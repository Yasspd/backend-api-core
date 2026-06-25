# Backend API Core

`backend-api-core` - это NestJS-бэкенд для отслеживания цен по URL-адресам товаров.
Сервис умеет:

- регистрировать пользователя по `deviceToken` и выдавать JWT;
- создавать цели для отслеживания цены;
- автоматически определять CSS-селектор цены через LLM;
- периодически перепроверять цены;
- отправлять уведомления, когда цена стала меньше или равна целевой;
- переводить цель в режим `FALLBACK_REQUIRED`, если сайт блокирует автоматический скрейпинг.

## Стек

- `NestJS 11`
- `Prisma`
- `PostgreSQL`
- `@nestjs/jwt` для аутентификации
- `cheerio` и `got-scraping` для получения и разбора HTML
- `@nestjs/schedule` для фонового обновления цен

## Архитектура модулей

- `auth` - вход по `deviceToken`, выпуск JWT, получение профиля.
- `targets` - создание, получение и обновление отслеживаемых целей.
- `scraper` - загрузка HTML и извлечение цены по селектору.
- `ai` - очистка HTML и извлечение селектора через LLM-провайдер.
- `notifications` - отправка email-уведомлений через `Resend` или SMTP.
- `scheduler` - почасовая проверка активных целей.
- `prisma` - доступ к базе данных.

## Модель данных

В базе используются три основные сущности:

- `User` - пользователь с `deviceToken`, `email` и тарифом.
- `Target` - цель отслеживания: URL, селектор, целевая и текущая цена, статус.
- `PriceHistory` - история проверок цены для каждой цели.

Статусы цели:

- `ACTIVE` - цель отслеживается автоматически.
- `FALLBACK_REQUIRED` - сайт заблокировал скрейпинг, нужен HTML от клиента.
- `FAILED` - обновление завершилось ошибкой.

## Требования

- `Node.js 20+`
- `npm`
- `PostgreSQL 16+` или контейнер через `docker compose`

## Быстрый старт

### 1. Установить зависимости

```bash
npm install
```

### 2. Поднять PostgreSQL

В репозитории есть `docker-compose.yml` с готовой конфигурацией:

```bash
docker compose up -d
```

По умолчанию контейнер поднимает PostgreSQL на `localhost:5432`.

### 3. Настроить переменные окружения

Создайте `.env` в корне проекта. Минимальный пример:

```env
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/database_name?schema=public
JWT_SECRET=change-me

LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_api_key

MAIL_FROM=alerts@example.com
```

### 4. Применить Prisma

Если схема уже создана миграциями:

```bash
npx prisma migrate deploy
npm run prisma:generate
```

Для локальной разработки можно использовать:

```bash
npx prisma migrate dev
```

### 5. Запустить приложение

Режим разработки:

```bash
npm run start:dev
```

Прод-сборка:

```bash
npm run build:with-prisma
npm run start:prod
```

После запуска API будет доступен по адресу `http://localhost:3000` или по значению `PORT`.

## Переменные окружения

### Обязательные

- `DATABASE_URL` - строка подключения к PostgreSQL.
- `JWT_SECRET` - секрет для подписи JWT.

### Общие

- `PORT` - порт HTTP-сервера, по умолчанию `3000`.

### AI / LLM

- `LLM_PROVIDER` - провайдер для извлечения селектора: `deepseek` или `gemini`. По умолчанию `deepseek`.
- `DEEPSEEK_API_KEY` - API-ключ DeepSeek.
- `DEEPSEEK_API_URL` - кастомный URL API DeepSeek. По умолчанию `https://api.deepseek.com/chat/completions`.
- `DEEPSEEK_MODEL` - модель DeepSeek. По умолчанию `deepseek-chat`.
- `GEMINI_API_KEY` - API-ключ Gemini.
- `GEMINI_API_URL` - кастомный URL API Gemini.
- `GEMINI_MODEL` - модель Gemini. По умолчанию `gemini-1.5-flash`.

### Скрейпинг

- `PROXY_LIST` - список прокси через запятую.
- `SCRAPER_JA3_PROFILE` - профиль TLS/JA3 для заголовка `x-stealth-ja3-profile`. По умолчанию `chrome_137`.

### Уведомления

Поддерживаются два режима:

- через `Resend`, если задан `RESEND_API_KEY`;
- через SMTP, если `RESEND_API_KEY` не задан.

Доступные переменные:

- `RESEND_API_KEY` - API-ключ Resend.
- `MAIL_FROM` - адрес отправителя.
- `SMTP_HOST` - SMTP-хост.
- `SMTP_PORT` - SMTP-порт, по умолчанию `587`.
- `SMTP_USER` - SMTP-логин.
- `SMTP_PASS` - SMTP-пароль.

## Как работает отслеживание цены

### Создание цели

1. Клиент вызывает `POST /auth/device-login` и получает JWT.
2. Клиент вызывает `POST /targets/create` с URL и целевой ценой.
3. Бэкенд загружает HTML страницы.
4. Модуль `ai` очищает HTML и просит LLM вернуть CSS-селектор цены.
5. Модуль `scraper` извлекает текущую цену по найденному селектору.
6. В базу записываются цель и первая запись в `PriceHistory`.

### Если сайт защищён от ботов

Если источник возвращает `403` или `407`, цель создаётся или переводится в статус `FALLBACK_REQUIRED`.
В этом случае клиент должен передать HTML вручную через `POST /targets/:id/fallback`.

### Фоновое обновление

Сервис `scheduler` каждый час запускает проверку всех целей со статусом `ACTIVE`.
Если новая цена меньше или равна целевой и отличается от предыдущей, отправляется уведомление.

## HTTP API

Все ответы и форматы ниже основаны на текущих контроллерах проекта.

### `POST /auth/device-login`

Вход или регистрация пользователя по токену устройства.

Тело запроса:

```json
{
  deviceToken: device-token-123456,
  email: user@example.com
}
```

Требования:

- `deviceToken` - строка длиной не меньше `12` символов.
- `email` - необязательное поле, должно быть валидным email.

Ответ:

```json
{
  accessToken: jwt-token,
  user: {
    id: uuid,
    deviceToken: device-token-123456,
    email: user@example.com,
    tariff: FREE,
    createdAt: 2026-06-24T00:00:00.000Z,
    updatedAt: 2026-06-24T00:00:00.000Z
  }
}
```

### `GET /auth/profile`

Возвращает payload авторизованного пользователя.

Заголовок:

```http
Authorization: Bearer <token>
```

### `POST /targets/create`

Создаёт новую цель отслеживания.

Заголовок:

```http
Authorization: Bearer <token>
```

Тело запроса:

```json
{
  url: https://example.com/product/123,
  targetPrice: 1999.99
}
```

Требования:

- `url` - валидный URL длиной до `2048` символов.
- `targetPrice` - число больше или равно `0.01`, не более двух знаков после запятой.

Особенности:

- если HTML успешно обработан, цель создаётся со статусом `ACTIVE`;
- если сайт блокирует скрейпинг, цель создаётся со статусом `FALLBACK_REQUIRED`.

### `GET /targets`

Возвращает список целей текущего пользователя, отсортированный по `updatedAt` в обратном порядке.
Для каждой цели возвращаются последние записи истории цен.

### `POST /targets/:id/fallback`

Передаёт HTML страницы вручную для цели в статусе `FALLBACK_REQUIRED` или для случая, когда нужен новый селектор.

Заголовок:

```http
Authorization: Bearer <token>
```

Тело запроса:

```json
{
  html: <html>...</html>
}
```

Требования:

- `html` - строка длиной до `2_000_000` символов.

После обработки цель переводится в `ACTIVE`, обновляются `selector`, `currentPrice` и `priceHistory`.

## NPM-скрипты

- `npm run prisma:generate` - генерация Prisma Client.
- `npm run build` - сборка NestJS-приложения.
- `npm run build:with-prisma` - генерация Prisma Client и сборка.
- `npm run start` - обычный запуск через Nest.
- `npm run start:dev` - запуск в watch-режиме.
- `npm run start:prod` - запуск собранного приложения.
- `npm run format` - форматирование `src/**/*.ts`.
- `npm run lint` - запуск ESLint для `src` и `test`.

## Ограничения и замечания

- Swagger/OpenAPI в проекте пока не подключён.
- WebSocket/SSE для fallback-событий в текущем коде не опубликован наружу, хотя внутри есть `FallbackEventsService`.
- Если не установлен `got-scraping`, сервис переключается на встроенный `fetch`.
- Если email у пользователя не задан, уведомление о снижении цены не отправляется.
- Если SMTP настроен не полностью и `RESEND_API_KEY` отсутствует, уведомления будут пропускаться.

## Полезные файлы

- `src/app.module.ts` - состав модулей приложения.
- `src/main.ts` - bootstrap, CORS и глобальная валидация.
- `src/modules/auth` - аутентификация.
- `src/modules/targets` - основная бизнес-логика отслеживания.
- `src/modules/scraper/scraper.service.ts` - загрузка HTML и извлечение цены.
- `src/modules/notifications/notification.service.ts` - уведомления.
- `src/modules/scheduler/scheduler.service.ts` - почасовой cron.
- `prisma/schema.prisma` - схема базы данных.

## Что можно улучшить дальше

- добавить `Swagger` для автогенерации API-документации;
- вынести пример `.env.example` в репозиторий;
- описать контракт fallback-событий для клиента;
- добавить раздел по деплою и миграциям в production.

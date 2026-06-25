"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClientClass = getPrismaClientClass;
const runtime = require("@prisma/client/runtime/client");
const config = {
    "previewFeatures": [],
    "clientVersion": "7.8.0",
    "engineVersion": "3c6e192761c0362d496ed980de936e2f3cebcd3a",
    "activeProvider": "postgresql",
    "inlineSchema": "generator client {\n  provider = \"prisma-client\"\n  output   = \"../src/generated/prisma\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n}\n\nmodel Users {\n  id       Int      @id @default(autoincrement())\n  email    String   @unique\n  password String\n  username String?\n  createAt DateTime\n}\n",
    "runtimeDataModel": {
        "models": {},
        "enums": {},
        "types": {}
    },
    "parameterizationSchema": {
        "strings": [],
        "graph": ""
    }
};
config.runtimeDataModel = JSON.parse("{\"models\":{\"Users\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"password\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"username\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}");
config.parameterizationSchema = {
    strings: JSON.parse("[\"where\",\"Users.findUnique\",\"Users.findUniqueOrThrow\",\"orderBy\",\"cursor\",\"Users.findFirst\",\"Users.findFirstOrThrow\",\"Users.findMany\",\"data\",\"Users.createOne\",\"Users.createMany\",\"Users.createManyAndReturn\",\"Users.updateOne\",\"Users.updateMany\",\"Users.updateManyAndReturn\",\"create\",\"update\",\"Users.upsertOne\",\"Users.deleteOne\",\"Users.deleteMany\",\"having\",\"_count\",\"_avg\",\"_sum\",\"_min\",\"_max\",\"Users.groupBy\",\"Users.aggregate\",\"AND\",\"OR\",\"NOT\",\"id\",\"email\",\"password\",\"username\",\"createAt\",\"equals\",\"in\",\"notIn\",\"lt\",\"lte\",\"gt\",\"gte\",\"not\",\"contains\",\"startsWith\",\"endsWith\",\"set\",\"increment\",\"decrement\",\"multiply\",\"divide\"]"),
    graph: "NwsQCBwAACkAMB0AAAQAEB4AACkAMB8CAAAAASABAAAAASEBACsAISIBACwAISNAAC0AIQEAAAABACABAAAAAQAgCBwAACkAMB0AAAQAEB4AACkAMB8CACoAISABACsAISEBACsAISIBACwAISNAAC0AIQEiAAAuACADAAAABAAgAwAABQAwBAAAAQAgAwAAAAQAIAMAAAUAMAQAAAEAIAMAAAAEACADAAAFADAEAAABACAFHwIAAAABIAEAAAABIQEAAAABIgEAAAABI0AAAAABAQgAAAkAIAUfAgAAAAEgAQAAAAEhAQAAAAEiAQAAAAEjQAAAAAEBCAAACwAwAQgAAAsAMAUfAgA3ACEgAQA0ACEhAQA0ACEiAQA1ACEjQAA2ACECAAAAAQAgCAAADgAgBR8CADcAISABADQAISEBADQAISIBADUAISNAADYAIQIAAAAEACAIAAAQACACAAAABAAgCAAAEAAgAwAAAAEAIA8AAAkAIBAAAA4AIAEAAAABACABAAAABAAgBhUAAC8AIBYAADAAIBcAADMAIBgAADIAIBkAADEAICIAAC4AIAgcAAAaADAdAAAXABAeAAAaADAfAgAbACEgAQAcACEhAQAcACEiAQAdACEjQAAeACEDAAAABAAgAwAAFgAwFAAAFwAgAwAAAAQAIAMAAAUAMAQAAAEAIAgcAAAaADAdAAAXABAeAAAaADAfAgAbACEgAQAcACEhAQAcACEiAQAdACEjQAAeACENFQAAIAAgFgAAKAAgFwAAIAAgGAAAIAAgGQAAIAAgJAIAAAABJQIAAAAEJgIAAAAEJwIAAAABKAIAAAABKQIAAAABKgIAAAABKwIAJwAhDhUAACAAIBgAACYAIBkAACYAICQBAAAAASUBAAAABCYBAAAABCcBAAAAASgBAAAAASkBAAAAASoBAAAAASsBACUAISwBAAAAAS0BAAAAAS4BAAAAAQ4VAAAjACAYAAAkACAZAAAkACAkAQAAAAElAQAAAAUmAQAAAAUnAQAAAAEoAQAAAAEpAQAAAAEqAQAAAAErAQAiACEsAQAAAAEtAQAAAAEuAQAAAAELFQAAIAAgGAAAIQAgGQAAIQAgJEAAAAABJUAAAAAEJkAAAAAEJ0AAAAABKEAAAAABKUAAAAABKkAAAAABK0AAHwAhCxUAACAAIBgAACEAIBkAACEAICRAAAAAASVAAAAABCZAAAAABCdAAAAAAShAAAAAASlAAAAAASpAAAAAAStAAB8AIQgkAgAAAAElAgAAAAQmAgAAAAQnAgAAAAEoAgAAAAEpAgAAAAEqAgAAAAErAgAgACEIJEAAAAABJUAAAAAEJkAAAAAEJ0AAAAABKEAAAAABKUAAAAABKkAAAAABK0AAIQAhDhUAACMAIBgAACQAIBkAACQAICQBAAAAASUBAAAABSYBAAAABScBAAAAASgBAAAAASkBAAAAASoBAAAAASsBACIAISwBAAAAAS0BAAAAAS4BAAAAAQgkAgAAAAElAgAAAAUmAgAAAAUnAgAAAAEoAgAAAAEpAgAAAAEqAgAAAAErAgAjACELJAEAAAABJQEAAAAFJgEAAAAFJwEAAAABKAEAAAABKQEAAAABKgEAAAABKwEAJAAhLAEAAAABLQEAAAABLgEAAAABDhUAACAAIBgAACYAIBkAACYAICQBAAAAASUBAAAABCYBAAAABCcBAAAAASgBAAAAASkBAAAAASoBAAAAASsBACUAISwBAAAAAS0BAAAAAS4BAAAAAQskAQAAAAElAQAAAAQmAQAAAAQnAQAAAAEoAQAAAAEpAQAAAAEqAQAAAAErAQAmACEsAQAAAAEtAQAAAAEuAQAAAAENFQAAIAAgFgAAKAAgFwAAIAAgGAAAIAAgGQAAIAAgJAIAAAABJQIAAAAEJgIAAAAEJwIAAAABKAIAAAABKQIAAAABKgIAAAABKwIAJwAhCCQIAAAAASUIAAAABCYIAAAABCcIAAAAASgIAAAAASkIAAAAASoIAAAAASsIACgAIQgcAAApADAdAAAEABAeAAApADAfAgAqACEgAQArACEhAQArACEiAQAsACEjQAAtACEIJAIAAAABJQIAAAAEJgIAAAAEJwIAAAABKAIAAAABKQIAAAABKgIAAAABKwIAIAAhCyQBAAAAASUBAAAABCYBAAAABCcBAAAAASgBAAAAASkBAAAAASoBAAAAASsBACYAISwBAAAAAS0BAAAAAS4BAAAAAQskAQAAAAElAQAAAAUmAQAAAAUnAQAAAAEoAQAAAAEpAQAAAAEqAQAAAAErAQAkACEsAQAAAAEtAQAAAAEuAQAAAAEIJEAAAAABJUAAAAAEJkAAAAAEJ0AAAAABKEAAAAABKUAAAAABKkAAAAABK0AAIQAhAAAAAAAAAS8BAAAAAQEvAQAAAAEBL0AAAAABBS8CAAAAATACAAAAATECAAAAATICAAAAATMCAAAAAQAAAAAFFQAGFgAHFwAIGAAJGQAKAAAAAAAFFQAGFgAHFwAIGAAJGQAKAQIBAgMBBQYBBgcBBwgBCQoBCgwCCw0DDA8BDRECDhIEERMBEhQBExUCGhgFGxkL"
};
async function decodeBase64AsWasm(wasmBase64) {
    const { Buffer } = await Promise.resolve().then(() => require('node:buffer'));
    const wasmArray = Buffer.from(wasmBase64, 'base64');
    return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
    getRuntime: async () => await Promise.resolve().then(() => require("@prisma/client/runtime/query_compiler_fast_bg.postgresql.js")),
    getQueryCompilerWasmModule: async () => {
        const { wasm } = await Promise.resolve().then(() => require("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.js"));
        return await decodeBase64AsWasm(wasm);
    },
    importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
    return runtime.getPrismaClient(config);
}
//# sourceMappingURL=class.js.map
import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { CreateTargetDto } from './dto/create-target.dto';
import { FallbackHtmlDto } from './dto/fallback-html.dto';
import { TargetsService } from './targets.service';

@UseGuards(JwtAuthGuard)
@Controller('targets')
export class TargetsController {
  constructor(private readonly targetsService: TargetsService) {}

  @Post('create')
  async createTarget(@Req() request: RequestWithUser, @Body() dto: CreateTargetDto) {
    return this.targetsService.createTarget(request.user.sub, dto);
  }

  @Get()
  async listTargets(@Req() request: RequestWithUser) {
    return this.targetsService.listTargets(request.user.sub);
  }

  @Post(':id/fallback')
  async submitFallbackHtml(
    @Req() request: RequestWithUser,
    @Param('id') targetId: string,
    @Body() dto: FallbackHtmlDto,
  ) {
    return this.targetsService.processFallbackHtml(request.user.sub, targetId, dto);
  }
}

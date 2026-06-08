import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Req, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SessionsService } from './sessions.service';

@Controller('sessions')
@UseGuards(AuthGuard('jwt'))
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.sessionsService.findAllByUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.sessionsService.findById(id, req.user.id);
  }

  @Post()
  create(@Body() dto: any, @Req() req: any) {
    return this.sessionsService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.sessionsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.sessionsService.delete(id, req.user.id);
  }
}

import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Res } from '@nestjs/common'
import { ServerResponse } from 'http'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtGuard } from '../auth/guards/jwt.guard'
import { SessionsService } from './sessions.service'

@ApiTags('sessions')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Get()
  findAll(@Request() req: { user: { id: string } }) {
    return this.sessions.findByUser(req.user.id)
  }

  @Post()
  create(@Request() req: { user: { id: string } }, @Body() body: { title?: string }) {
    return this.sessions.create(req.user.id, body.title)
  }

  @Get(':id/messages')
  messages(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.sessions.listMessages(id, req.user.id)
  }

  @Post(':id/messages')
  send(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() body: { content: string },
  ) {
    return this.sessions.sendMessage(id, req.user.id, body.content)
  }

  @Delete(':id')
  remove(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.sessions.remove(id, req.user.id)
  }

  @Get(':id/stream')
  stream(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Res() reply: { raw: ServerResponse },
  ) {
    reply.raw.setHeader('Content-Type', 'text/event-stream')
    reply.raw.setHeader('Cache-Control', 'no-cache')
    reply.raw.setHeader('Connection', 'keep-alive')
    reply.raw.flushHeaders()

    const sub = this.sessions.streamEvents(id, req.user.id).subscribe({
      next: ({ data }) => reply.raw.write(`data: ${data}\n\n`),
      error: () => reply.raw.end(),
      complete: () => reply.raw.end(),
    })

    reply.raw.on('close', () => sub.unsubscribe())
  }
}

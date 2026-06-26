import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtGuard } from '../../../../common/guards/jwt.guard'
import { CreateUploadUrlDto } from './dto/create-upload-url.dto'
import { FilesService } from '../../files.service'

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Post('upload-url')
  createUploadUrl(@Request() req: { user: { id: string } }, @Body() body: CreateUploadUrlDto) {
    return this.files.createUploadUrl(req.user.id, body)
  }

  @Post(':id/confirm')
  confirm(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.files.confirm(req.user.id, id)
  }

  @Get(':id/download')
  download(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.files.createDownloadUrl(req.user.id, id)
  }

  @Delete(':id')
  remove(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.files.remove(req.user.id, id)
  }
}

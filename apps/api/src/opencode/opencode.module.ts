import { Module } from '@nestjs/common'
import { OpenCodeService } from './opencode.service'
import { ProcessRegistryService } from './process-registry.service'

@Module({
  providers: [OpenCodeService, ProcessRegistryService],
  exports: [OpenCodeService, ProcessRegistryService],
})
export class OpenCodeModule {}

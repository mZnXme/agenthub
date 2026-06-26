import { Module } from '@nestjs/common'
import { OpenCodeService } from './opencode.service'
import { ProcessRegistryService } from './process-registry.service'
import { OpenCodeClientPort } from '../../../application/ports/opencode/opencode-client.port'
import { OpenCodeProcessManagerPort } from '../../../application/ports/opencode/opencode-process-manager.port'

@Module({
  providers: [
    OpenCodeService,
    ProcessRegistryService,
    { provide: OpenCodeClientPort, useExisting: OpenCodeService },
    { provide: OpenCodeProcessManagerPort, useExisting: ProcessRegistryService },
  ],
  exports: [OpenCodeService, ProcessRegistryService, OpenCodeClientPort, OpenCodeProcessManagerPort],
})
export class OpenCodeModule {}

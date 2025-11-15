import { Module } from '@nestjs/common';
import { MemoryService } from './memory.service';
import { MemoryController } from './memory.controller';
import { ChromaService } from './chroma.service';
import { EmbeddingService } from './embedding.service';
import { MemoryPruningService } from './memory-pruning.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MemoryController],
  providers: [
    MemoryService,
    ChromaService,
    EmbeddingService,
    MemoryPruningService,
  ],
  exports: [MemoryService, EmbeddingService],
})
export class MemoryModule {}

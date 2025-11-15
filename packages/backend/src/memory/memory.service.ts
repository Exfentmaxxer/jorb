import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ChromaService } from './chroma.service';
import { EmbeddingService } from './embedding.service';
import { MemoryType } from '../types/prisma-enums';

export interface MemoryCreateInput {
  userId: string;
  type: MemoryType;
  content: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export interface MemorySearchInput {
  userId: string;
  query: string;
  limit?: number;
  types?: MemoryType[];
  minScore?: number;
}

export interface MemoryUpdateInput {
  content?: string;
  metadata?: Record<string, any>;
  score?: number;
}

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly chromaService: ChromaService,
    private readonly embeddingService: EmbeddingService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Store a new memory
   */
  async store(input: MemoryCreateInput): Promise<any> {
    this.logger.log(`Storing ${input.type} memory for user ${input.userId}`);

    // Generate embedding
    const embedding = await this.embeddingService.generateEmbedding(input.content);

    // Determine expiration based on memory type
    let expiresAt = input.expiresAt;
    if (!expiresAt) {
      const now = new Date();
      switch (input.type) {
        case MemoryType.SHORT_TERM:
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
          break;
        case MemoryType.MID_TERM:
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
          break;
        case MemoryType.LONG_TERM:
        case MemoryType.SEMANTIC:
        case MemoryType.EPISODIC:
        case MemoryType.PROCEDURAL:
          expiresAt = undefined; // No expiration
          break;
      }
    }

    // Store in PostgreSQL
    const memory = await this.prisma.memory.create({
      data: {
        userId: input.userId,
        type: input.type,
        content: input.content,
        embedding: JSON.stringify(embedding),
        metadata: input.metadata || {},
        expiresAt,
      },
    });

    // Store in ChromaDB for vector search
    await this.chromaService.addMemory({
      id: memory.id,
      embedding,
      metadata: {
        userId: input.userId,
        type: input.type,
        content: input.content,
        createdAt: memory.createdAt.toISOString(),
        ...input.metadata,
      },
    });

    this.logger.log(`Memory ${memory.id} stored successfully`);

    return memory;
  }

  /**
   * Search memories using semantic similarity
   */
  async search(input: MemorySearchInput): Promise<any[]> {
    this.logger.log(`Searching memories for user ${input.userId}: "${input.query}"`);

    // Generate query embedding
    const queryEmbedding = await this.embeddingService.generateEmbedding(input.query);

    // Search in ChromaDB
    const chromaResults = await this.chromaService.searchMemories({
      queryEmbedding,
      limit: input.limit || 10,
      filter: {
        userId: input.userId,
        ...(input.types && input.types.length > 0 ? { type: { $in: input.types } } : {}),
      },
    });

    // Filter by minimum score if specified
    const minScore = input.minScore || 0;
    const filteredResults = chromaResults.filter((r) => r.distance >= minScore);

    // Get full memory records from PostgreSQL
    const memoryIds = filteredResults.map((r) => r.id);
    const memories = await this.prisma.memory.findMany({
      where: {
        id: { in: memoryIds },
        userId: input.userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    // Update access count and last accessed
    await this.prisma.memory.updateMany({
      where: {
        id: { in: memoryIds },
      },
      data: {
        accessCount: { increment: 1 },
        lastAccessedAt: new Date(),
      },
    });

    // Merge with similarity scores
    const results = memories.map((memory: any) => {
      const chromaResult = filteredResults.find((r: any) => r.id === memory.id);
      return {
        ...memory,
        similarityScore: chromaResult?.distance || 0,
      };
    });

    // Sort by similarity
    results.sort((a: any, b: any) => b.similarityScore - a.similarityScore);

    this.logger.log(`Found ${results.length} relevant memories`);

    return results;
  }

  /**
   * Get memory by ID
   */
  async getById(userId: string, memoryId: string): Promise<any> {
    const memory = await this.prisma.memory.findFirst({
      where: {
        id: memoryId,
        userId,
      },
    });

    if (!memory) {
      throw new Error('Memory not found');
    }

    // Update access count
    await this.prisma.memory.update({
      where: { id: memoryId },
      data: {
        accessCount: { increment: 1 },
        lastAccessedAt: new Date(),
      },
    });

    return memory;
  }

  /**
   * Update memory
   */
  async update(
    userId: string,
    memoryId: string,
    updates: MemoryUpdateInput,
  ): Promise<any> {
    this.logger.log(`Updating memory ${memoryId}`);

    // Verify ownership
    const existing = await this.prisma.memory.findFirst({
      where: { id: memoryId, userId },
    });

    if (!existing) {
      throw new Error('Memory not found');
    }

    const updateData: any = {};

    if (updates.content !== undefined) {
      updateData.content = updates.content;
      // Regenerate embedding
      const embedding = await this.embeddingService.generateEmbedding(updates.content);
      updateData.embedding = JSON.stringify(embedding);

      // Update in ChromaDB
      await this.chromaService.updateMemory(memoryId, {
        embedding,
        metadata: {
          content: updates.content,
        },
      });
    }

    if (updates.metadata !== undefined) {
      updateData.metadata = updates.metadata;
    }

    if (updates.score !== undefined) {
      updateData.score = updates.score;
    }

    const memory = await this.prisma.memory.update({
      where: { id: memoryId },
      data: updateData,
    });

    return memory;
  }

  /**
   * Delete memory
   */
  async delete(userId: string, memoryId: string): Promise<void> {
    this.logger.log(`Deleting memory ${memoryId}`);

    // Verify ownership
    const existing = await this.prisma.memory.findFirst({
      where: { id: memoryId, userId },
    });

    if (!existing) {
      throw new Error('Memory not found');
    }

    // Delete from PostgreSQL
    await this.prisma.memory.delete({
      where: { id: memoryId },
    });

    // Delete from ChromaDB
    await this.chromaService.deleteMemory(memoryId);

    this.logger.log(`Memory ${memoryId} deleted`);
  }

  /**
   * List memories for a user
   */
  async list(params: {
    userId: string;
    type?: MemoryType;
    limit?: number;
    offset?: number;
  }): Promise<{ memories: any[]; total: number }> {
    const where: any = {
      userId: params.userId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    };

    if (params.type) {
      where.type = params.type;
    }

    const [memories, total] = await Promise.all([
      this.prisma.memory.findMany({
        where,
        take: params.limit || 50,
        skip: params.offset || 0,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.memory.count({ where }),
    ]);

    return { memories, total };
  }

  /**
   * Consolidate short-term memories to mid/long-term
   */
  async consolidate(userId: string): Promise<{ promoted: number }> {
    this.logger.log(`Consolidating memories for user ${userId}`);

    // Get high-value short-term memories
    const shortTermMemories = await this.prisma.memory.findMany({
      where: {
        userId,
        type: MemoryType.SHORT_TERM,
        accessCount: { gte: 3 },
        score: { gte: 0.7 },
      },
    });

    let promoted = 0;

    for (const memory of shortTermMemories) {
      // Promote to mid-term
      await this.prisma.memory.update({
        where: { id: memory.id },
        data: {
          type: MemoryType.MID_TERM,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Update metadata in ChromaDB
      await this.chromaService.updateMemory(memory.id, {
        metadata: { type: MemoryType.MID_TERM },
      });

      promoted++;
    }

    this.logger.log(`Promoted ${promoted} memories from short-term to mid-term`);

    return { promoted };
  }

  /**
   * Prune expired and low-value memories
   */
  async prune(userId: string): Promise<{ deleted: number }> {
    this.logger.log(`Pruning memories for user ${userId}`);

    // Delete expired memories
    const expiredMemories = await this.prisma.memory.findMany({
      where: {
        userId,
        expiresAt: { lte: new Date() },
      },
      select: { id: true },
    });

    // Delete low-value memories
    const lowValueMemories = await this.prisma.memory.findMany({
      where: {
        userId,
        type: { in: [MemoryType.SHORT_TERM, MemoryType.MID_TERM] },
        score: { lte: 0.3 },
        accessCount: { lte: 1 },
        createdAt: { lte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
      },
      select: { id: true },
    });

    const memoryIds = [
      ...expiredMemories.map((m: any) => m.id),
      ...lowValueMemories.map((m: any) => m.id),
    ];

    if (memoryIds.length > 0) {
      // Delete from PostgreSQL
      await this.prisma.memory.deleteMany({
        where: { id: { in: memoryIds } },
      });

      // Delete from ChromaDB
      await this.chromaService.deleteMemories(memoryIds);
    }

    this.logger.log(`Pruned ${memoryIds.length} memories`);

    return { deleted: memoryIds.length };
  }

  /**
   * Get memory statistics
   */
  async getStats(userId: string): Promise<{
    total: number;
    byType: Record<string, number>;
    averageScore: number;
    totalAccessCount: number;
  }> {
    const memories = await this.prisma.memory.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    const byType: Record<string, number> = {};
    let totalScore = 0;
    let totalAccessCount = 0;

    for (const memory of memories) {
      byType[memory.type] = (byType[memory.type] || 0) + 1;
      totalScore += memory.score;
      totalAccessCount += memory.accessCount;
    }

    return {
      total: memories.length,
      byType,
      averageScore: memories.length > 0 ? totalScore / memories.length : 0,
      totalAccessCount,
    };
  }
}

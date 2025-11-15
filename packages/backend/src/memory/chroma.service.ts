import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChromaClient, Collection } from 'chromadb';

export interface ChromaMemoryInput {
  id: string;
  embedding: number[];
  metadata: Record<string, any>;
}

export interface ChromaSearchInput {
  queryEmbedding: number[];
  limit: number;
  filter?: Record<string, any>;
}

export interface ChromaSearchResult {
  id: string;
  distance: number;
  metadata: Record<string, any>;
}

@Injectable()
export class ChromaService implements OnModuleInit {
  private readonly logger = new Logger(ChromaService.name);
  private client: ChromaClient;
  private collection: Collection;
  private readonly collectionName = 'jorb_memories';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initialize();
  }

  /**
   * Initialize ChromaDB client and collection
   */
  private async initialize(): Promise<void> {
    try {
      const chromaUrl = this.configService.get<string>('CHROMA_URL', 'http://localhost:8000');

      this.logger.log(`Connecting to ChromaDB at ${chromaUrl}`);

      this.client = new ChromaClient({ path: chromaUrl });

      // Get or create collection
      try {
        this.collection = await this.client.getOrCreateCollection({
          name: this.collectionName,
          metadata: {
            description: 'Jorb Core memory storage',
          },
        });

        this.logger.log(`ChromaDB collection "${this.collectionName}" ready`);
      } catch (error) {
        this.logger.error('Failed to create/get collection:', error);
        throw error;
      }
    } catch (error) {
      this.logger.error('Failed to initialize ChromaDB:', error);
      throw error;
    }
  }

  /**
   * Add a memory to ChromaDB
   */
  async addMemory(input: ChromaMemoryInput): Promise<void> {
    try {
      await this.collection.add({
        ids: [input.id],
        embeddings: [input.embedding],
        metadatas: [input.metadata],
      });

      this.logger.debug(`Added memory ${input.id} to ChromaDB`);
    } catch (error) {
      this.logger.error(`Failed to add memory to ChromaDB:`, error);
      throw error;
    }
  }

  /**
   * Add multiple memories in batch
   */
  async addMemories(inputs: ChromaMemoryInput[]): Promise<void> {
    if (inputs.length === 0) return;

    try {
      await this.collection.add({
        ids: inputs.map((i) => i.id),
        embeddings: inputs.map((i) => i.embedding),
        metadatas: inputs.map((i) => i.metadata),
      });

      this.logger.debug(`Added ${inputs.length} memories to ChromaDB`);
    } catch (error) {
      this.logger.error(`Failed to add memories to ChromaDB:`, error);
      throw error;
    }
  }

  /**
   * Search memories by semantic similarity
   */
  async searchMemories(input: ChromaSearchInput): Promise<ChromaSearchResult[]> {
    try {
      const results = await this.collection.query({
        queryEmbeddings: [input.queryEmbedding],
        nResults: input.limit,
        where: input.filter,
      });

      if (!results.ids || !results.ids[0] || results.ids[0].length === 0) {
        return [];
      }

      const searchResults: ChromaSearchResult[] = [];

      for (let i = 0; i < results.ids[0].length; i++) {
        const id = results.ids[0][i];
        const distance = results.distances?.[0]?.[i] ?? 0;
        const metadata = results.metadatas?.[0]?.[i] ?? {};

        searchResults.push({
          id,
          distance: 1 - distance, // Convert distance to similarity score
          metadata,
        });
      }

      this.logger.debug(`Found ${searchResults.length} memories in ChromaDB`);

      return searchResults;
    } catch (error) {
      this.logger.error(`Failed to search memories in ChromaDB:`, error);
      throw error;
    }
  }

  /**
   * Update memory in ChromaDB
   */
  async updateMemory(
    id: string,
    updates: {
      embedding?: number[];
      metadata?: Record<string, any>;
    },
  ): Promise<void> {
    try {
      await this.collection.update({
        ids: [id],
        ...(updates.embedding ? { embeddings: [updates.embedding] } : {}),
        ...(updates.metadata ? { metadatas: [updates.metadata] } : {}),
      });

      this.logger.debug(`Updated memory ${id} in ChromaDB`);
    } catch (error) {
      this.logger.error(`Failed to update memory in ChromaDB:`, error);
      throw error;
    }
  }

  /**
   * Delete memory from ChromaDB
   */
  async deleteMemory(id: string): Promise<void> {
    try {
      await this.collection.delete({
        ids: [id],
      });

      this.logger.debug(`Deleted memory ${id} from ChromaDB`);
    } catch (error) {
      this.logger.error(`Failed to delete memory from ChromaDB:`, error);
      // Don't throw - deletion might fail if memory doesn't exist
      this.logger.warn('Continuing despite ChromaDB deletion error');
    }
  }

  /**
   * Delete multiple memories
   */
  async deleteMemories(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    try {
      await this.collection.delete({
        ids,
      });

      this.logger.debug(`Deleted ${ids.length} memories from ChromaDB`);
    } catch (error) {
      this.logger.error(`Failed to delete memories from ChromaDB:`, error);
      this.logger.warn('Continuing despite ChromaDB deletion error');
    }
  }

  /**
   * Get collection statistics
   */
  async getStats(): Promise<{
    count: number;
    name: string;
  }> {
    try {
      const count = await this.collection.count();

      return {
        count,
        name: this.collectionName,
      };
    } catch (error) {
      this.logger.error('Failed to get ChromaDB stats:', error);
      return {
        count: 0,
        name: this.collectionName,
      };
    }
  }

  /**
   * Reset collection (careful!)
   */
  async resetCollection(): Promise<void> {
    this.logger.warn(`Resetting ChromaDB collection ${this.collectionName}`);

    try {
      await this.client.deleteCollection({ name: this.collectionName });
      this.collection = await this.client.createCollection({
        name: this.collectionName,
        metadata: {
          description: 'Jorb Core memory storage',
        },
      });

      this.logger.log('ChromaDB collection reset complete');
    } catch (error) {
      this.logger.error('Failed to reset ChromaDB collection:', error);
      throw error;
    }
  }
}

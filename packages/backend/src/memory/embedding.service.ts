import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly openai: OpenAI;
  private readonly model: string;
  private readonly dimension: number;
  private readonly cache: Map<string, { embedding: number[]; timestamp: number }> = new Map();
  private readonly cacheTTL = 3600000; // 1 hour

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    this.model = this.configService.get<string>(
      'OPENAI_EMBEDDING_MODEL',
      'text-embedding-3-small',
    );
    this.dimension = this.configService.get<number>('MEMORY_EMBEDDING_DIMENSION', 1536);
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // Check cache first
    const cached = this.cache.get(text);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      this.logger.debug('Returning cached embedding');
      return cached.embedding;
    }

    try {
      this.logger.debug(`Generating embedding for text (${text.length} chars)`);

      const response = await this.openai.embeddings.create({
        model: this.model,
        input: text,
        dimensions: this.dimension,
      });

      const embedding = response.data[0].embedding;

      // Cache the result
      this.cache.set(text, {
        embedding,
        timestamp: Date.now(),
      });

      // Clean old cache entries periodically
      if (this.cache.size > 1000) {
        this.cleanCache();
      }

      return embedding;
    } catch (error) {
      this.logger.error('Failed to generate embedding:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    // Check which texts need embeddings
    const toEmbed: string[] = [];
    const results: number[][] = new Array(texts.length);

    for (let i = 0; i < texts.length; i++) {
      const cached = this.cache.get(texts[i]);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        results[i] = cached.embedding;
      } else {
        toEmbed.push(texts[i]);
      }
    }

    // Generate embeddings for texts not in cache
    if (toEmbed.length > 0) {
      try {
        this.logger.debug(`Generating ${toEmbed.length} embeddings in batch`);

        const response = await this.openai.embeddings.create({
          model: this.model,
          input: toEmbed,
          dimensions: this.dimension,
        });

        // Fill in results and update cache
        let embeddingIndex = 0;
        for (let i = 0; i < texts.length; i++) {
          if (!results[i]) {
            const embedding = response.data[embeddingIndex].embedding;
            results[i] = embedding;

            // Cache the result
            this.cache.set(texts[i], {
              embedding,
              timestamp: Date.now(),
            });

            embeddingIndex++;
          }
        }
      } catch (error) {
        this.logger.error('Failed to generate batch embeddings:', error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have the same dimension');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Find most similar text from a list
   */
  async findMostSimilar(
    query: string,
    texts: string[],
  ): Promise<{
    text: string;
    similarity: number;
    index: number;
  }> {
    const queryEmbedding = await this.generateEmbedding(query);
    const textEmbeddings = await this.generateEmbeddings(texts);

    let maxSimilarity = -1;
    let maxIndex = -1;

    for (let i = 0; i < textEmbeddings.length; i++) {
      const similarity = this.cosineSimilarity(queryEmbedding, textEmbeddings[i]);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        maxIndex = i;
      }
    }

    return {
      text: texts[maxIndex],
      similarity: maxSimilarity,
      index: maxIndex,
    };
  }

  /**
   * Clean old cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, value] of this.cache) {
      if (now - value.timestamp > this.cacheTTL) {
        toDelete.push(key);
      }
    }

    for (const key of toDelete) {
      this.cache.delete(key);
    }

    this.logger.debug(`Cleaned ${toDelete.length} cache entries`);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.log('Embedding cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses to calculate
    };
  }
}

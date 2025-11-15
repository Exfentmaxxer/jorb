/**
 * Prisma Enum Types
 *
 * These enums are exported here as a fallback when @prisma/client is not yet generated.
 * During normal operation, these should be imported from @prisma/client instead.
 * The Prisma client generation happens during installation via `prisma generate`.
 */

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM',
}

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  TERMINATED = 'TERMINATED',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  PLANNING = 'PLANNING',
  EXECUTING = 'EXECUTING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum TaskStepStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export enum MemoryType {
  SHORT_TERM = 'SHORT_TERM',
  MID_TERM = 'MID_TERM',
  LONG_TERM = 'LONG_TERM',
  SEMANTIC = 'SEMANTIC',
  EPISODIC = 'EPISODIC',
  PROCEDURAL = 'PROCEDURAL',
}

export enum ToolExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
  CANCELLED = 'CANCELLED',
}

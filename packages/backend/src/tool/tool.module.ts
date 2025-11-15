import { Module } from '@nestjs/common';
import { ToolService } from './tool.service';
import { ToolController } from './tool.controller';
import { ToolRegistryService } from './tool-registry.service';
import { ToolExecutorService } from './tool-executor.service';
import { ToolLoaderService } from './tool-loader.service';
import { PrismaModule } from '../prisma/prisma.module';

// Built-in tools
import { CalculatorTool } from './built-in/calculator.tool';
import { SchedulerTool } from './built-in/scheduler.tool';
import { EmailDrafterTool } from './built-in/email-drafter.tool';
import { HttpRequestTool } from './built-in/http-request.tool';
import { BrowserAutomationTool } from './built-in/browser-automation.tool';
import { FileIoTool } from './built-in/file-io.tool';

@Module({
  imports: [PrismaModule],
  controllers: [ToolController],
  providers: [
    ToolService,
    ToolRegistryService,
    ToolExecutorService,
    ToolLoaderService,
    // Built-in tools
    CalculatorTool,
    SchedulerTool,
    EmailDrafterTool,
    HttpRequestTool,
    BrowserAutomationTool,
    FileIoTool,
  ],
  exports: [ToolService, ToolRegistryService],
})
export class ToolModule {}

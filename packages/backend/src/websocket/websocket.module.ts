import { Module } from '@nestjs/common';
import { TaskGateway } from './task.gateway';

@Module({
  providers: [TaskGateway],
})
export class WebsocketModule {}

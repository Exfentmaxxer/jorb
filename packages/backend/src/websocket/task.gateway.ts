import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class TaskGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TaskGateway.name);

  @SubscribeMessage('subscribe:task')
  handleSubscribe(
    @MessageBody() data: { taskId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`task:${data.taskId}`);
    this.logger.log(`Client ${client.id} subscribed to task ${data.taskId}`);
    return { success: true };
  }

  @SubscribeMessage('unsubscribe:task')
  handleUnsubscribe(
    @MessageBody() data: { taskId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`task:${data.taskId}`);
    return { success: true };
  }

  emitTaskUpdate(taskId: string, update: any) {
    this.server.to(`task:${taskId}`).emit('task:update', update);
  }

  emitTaskProgress(taskId: string, progress: number) {
    this.server.to(`task:${taskId}`).emit('task:progress', { taskId, progress });
  }
}

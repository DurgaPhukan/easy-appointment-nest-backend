import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SocketGateway.name);
  private connectedClients: Map<string, Socket> = new Map();

  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) { }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.disconnect(client, 'No token provided');
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      if (!userId) {
        this.disconnect(client, 'Invalid token');
        return;
      }

      // Store client connection
      client.data.userId = userId;
      this.connectedClients.set(userId, client);

      // Join user to their room
      client.join(`user:${userId}`);

      this.logger.log(`Client connected: ${userId}`);
    } catch (error) {
      this.disconnect(client, 'Authentication failed');
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedClients.delete(userId);
      this.logger.log(`Client disconnected: ${userId}`);
    }
  }

  private disconnect(client: Socket, reason: string) {
    client.emit('error', new UnauthorizedException(reason));
    client.disconnect();
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomName: string
  ) {
    client.join(roomName);
    return { status: 'success', message: `Joined room: ${roomName}` };
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomName: string
  ) {
    client.leave(roomName);
    return { status: 'success', message: `Left room: ${roomName}` };
  }

  // Send message to a specific user
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Send message to multiple users
  sendToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach(userId => {
      this.sendToUser(userId, event, data);
    });
  }

  // Send message to a specific room
  sendToRoom(roomName: string, event: string, data: any) {
    this.server.to(roomName).emit(event, data);
  }

  // Check if a user is online
  isUserOnline(userId: string): boolean {
    return this.connectedClients.has(userId);
  }
}
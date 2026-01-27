import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*', // Allow all origins for demo purposes
    },
})
export class ReportsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        // console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        // console.log(`Client disconnected: ${client.id}`);
    }

    // Method to broadcast new high-priority reports
    notifyNewReport(report: any) {
        if (report.priority === 'CRITICAL' || report.priority === 'HIGH') {
            this.server.emit('critical-report', {
                title: report.title,
                priority: report.priority,
                id: report.id,
                message: `⚠️ NEW ${report.priority} REPORT: ${report.title}`,
            });
        }
    }
}

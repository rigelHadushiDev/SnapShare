import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class SSEService {
    private clients = new Map<string, Subject<string>>();
    private messages = new Map<string, string[]>();

    sendEventToChannel(channel: string, data: string) {
        channel = channel.toLowerCase();
        const client = this.clients.get(channel);
        if (client) {
            client.next(data);
        }
        const channelMessages = this.messages.get(channel) || [];
        channelMessages.push(data);
        this.messages.set(channel, channelMessages);
    }

    subscribeToChannel(channel: string): Subject<string> {
        channel = channel.toLowerCase();
        let newClient = this.clients.get(channel);

        if (!newClient) {
            newClient = new Subject<string>();
            this.clients.set(channel, newClient);
        }

        return newClient;
    }

    unsubscribeFromChannel(channel: string) {
        channel = channel.toLowerCase();
        this.clients.delete(channel);
        this.messages.delete(channel);
    }

    getMessagesForChannel(channel: string): string[] {
        channel = channel.toLowerCase();
        return this.messages.get(channel) || [];
    }
}

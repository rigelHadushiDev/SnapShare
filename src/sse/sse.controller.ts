import { Controller, Get, Response, Headers, Param, Query } from '@nestjs/common';
import { SSEService } from './sse.service';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('SSE Module')
@Controller('sse')
export class SSEController {
    constructor(private readonly sseService: SSEService) { }

    @ApiOperation({ summary: 'Opening up a SSE event stream', description: 'Opening up a SSE event stream, which is used mainly for the synchronization module' })
    @ApiParam({ name: 'channel', description: 'Channel in which the messages are being streamed', type: String })
    @ApiQuery({ name: '_token', description: 'Authentication token', type: String })
    @Get(':channel')
    async streamEvents(
        @Param('channel') channel: string,
        @Query('_token') _token: string,
        @Response() res,
        @Headers() headers,
    ) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const client = this.sseService.subscribeToChannel(channel);
        const messages = this.sseService.getMessagesForChannel(channel);

        messages.forEach(message => {
            res.write(`data: ${message}\n\n`);
        });

        client.subscribe((data) => {
            res.write(`data: ${data}\n\n`);
        });

        res.on('close', () => {
            this.sseService.unsubscribeFromChannel(channel);
        });
    }
}

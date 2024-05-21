import { ExceptionFilter, Catch, ArgumentsHost, HttpException, InternalServerErrorException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status: number;
        let message: any;
        let error: any;
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            message = exception.getResponse();
            message = message.message;
            error = message.error;

        } else {
            console.error('Unexpected error:', exception);
            const internalServerErrorException = new InternalServerErrorException('unexpectedErrorOccurred');
            status = internalServerErrorException.getStatus();
            message = internalServerErrorException.getResponse();
            message = message.message;
            error = message.error;
        }

        response.status(status).json({
            statusCode: status,
            error: error,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,  // Include the path in the payload
        });
    }
}
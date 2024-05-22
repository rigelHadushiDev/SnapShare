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
        let errorResponse: any;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            errorResponse = exception.getResponse();

            if (typeof errorResponse === 'string') {
                message = errorResponse;
            } else if (typeof errorResponse === 'object' && errorResponse !== null) {
                message = errorResponse.message;
                error = errorResponse.error;
            }
        } else {

            console.error('Unexpected error:', exception);
            const internalServerErrorException = new InternalServerErrorException('unexpectedErrorOccurred');
            status = internalServerErrorException.getStatus();
            errorResponse = internalServerErrorException.getResponse();

            if (typeof errorResponse === 'string') {
                message = errorResponse;
            } else if (typeof errorResponse === 'object' && errorResponse !== null) {
                message = errorResponse.message;
                error = errorResponse.error;
            }
        }

        response.status(status).json({
            statusCode: status,
            error: error,
            message,
            timestamp: new Date().toString(),
            path: request.url,
        });
    }
}
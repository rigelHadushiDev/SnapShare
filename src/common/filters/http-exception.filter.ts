import { ExceptionFilter, Catch, ArgumentsHost, HttpException, InternalServerErrorException } from '@nestjs/common';
import { Request, Response } from 'express';
import { SnapShareUtility } from 'src/common/utilities/snapShareUtility.utils'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(error: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status: number;
        let message: any;
        let errorName: any;
        let errorResponse: any;

        if (error instanceof HttpException) {
            status = error.getStatus();
            errorResponse = error.getResponse();

            if (typeof errorResponse === 'string') {
                message = errorResponse;
            } else if (typeof errorResponse === 'object' && errorResponse !== null) {
                message = errorResponse.message;
                errorName = errorResponse.error;
            }
        } else {
            SnapShareUtility.printToFile(error.stack || error, 'unexpectedError');
            console.log('Unexpected error:', error);

            const internalServerErrorException = new InternalServerErrorException('unexpectedErrorOccurred');
            status = internalServerErrorException.getStatus();
            errorResponse = internalServerErrorException.getResponse();

            if (typeof errorResponse === 'string') {
                message = errorResponse;
            } else if (typeof errorResponse === 'object' && errorResponse !== null) {
                message = errorResponse.message;
                errorName = errorResponse.error;
            }

        }

        response.status(status).json({
            statusCode: status,
            error: errorName,
            message,
            timestamp: new Date().toString(),
            path: request.url,
        });
    }
}
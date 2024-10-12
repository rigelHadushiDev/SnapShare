import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';

@Catch(TokenExpiredError)
export class JwtExpiredExceptionFilter implements ExceptionFilter {
    catch(exception: TokenExpiredError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        response.status(401).json({
            statusCode: 401,
            message: 'sessionTokenExpired',
            error: 'Unauthorized',
        });
    }
}

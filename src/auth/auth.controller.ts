import { Body, Controller, HttpCode, HttpStatus, InternalServerErrorException, NotFoundException, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';
import { LogInReq, LogInRes } from './dtos/LogIn.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';

@ApiTags("Auth Module")
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Public()
    @Post('login')
    @ApiOperation({ summary: 'User login', description: 'Authenticate user credentials and return access token.' })
    @ApiBody({ type: LogInReq, required: true })
    @ApiResponse({ status: HttpStatus.OK, description: 'User has signed in succesfully', type: LogInRes })
    @ApiException(() => NotFoundException, { description: 'No User is found with this Username. [key: "noUserWithThisUsername" ]' })
    @ApiException(() => NotFoundException, { description: 'Invalid Password or Username. [key: "invalidPasswordOrUsername" ]' })
    @ApiException(() => InternalServerErrorException, { description: 'Failed creating access token. [key: "failedCreatingAccessToken" ]' })
    logIn(@Body() logIn: LogInReq) {
        return this.authService.login(logIn.username, logIn.password);
    }

}

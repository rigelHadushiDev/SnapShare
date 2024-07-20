import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/user/services/users.service';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {

    constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) { }

    async login(username: string, password: string) {

        const user = await this.usersService.getUserByUsername(username);

        if (!user) {
            throw new NotFoundException('noUserWithThisUsername');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new NotFoundException('invalidPasswordOrUsername');
        }

        const payload = { username: user.username, userId: user.userId, };

        const access_token = await this.jwtService.signAsync(payload);

        if (!access_token)
            new InternalServerErrorException('failedCreatingAccessToken');

        return { access_token };

    }
}

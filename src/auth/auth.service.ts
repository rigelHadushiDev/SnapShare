import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/user/users.service';
import * as bcrypt from 'bcrypt'
import { User } from 'src/user/user.entity';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {

    constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) { }

    async login(username: string, password: string) {
        const user = await this.usersService.findOneByUsername(username);

        if (!user) {
            throw new NotFoundException('No user found with this username');
        }

        try {
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                throw new NotFoundException('Invalid Password or Username');
            }

            const payload = { username: user.username };
            console.log(payload);

            const access_token = await this.jwtService.signAsync(payload);

            return { access_token };
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    }
}

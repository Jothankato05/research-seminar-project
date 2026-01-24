import { Controller, Request, Post, UseGuards, Body, Ip, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

class LoginDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(8)
    password!: string;
}

class RegisterDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(8)
    password!: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Ip() ip: string, @Headers('user-agent') ua: string) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user, ip, ua);
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        // Public registration always creates a STUDENT
        return this.authService.register(registerDto.email, registerDto.password, UserRole.STUDENT);
    }

    @Post('users')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async createUser(@Body() createUserDto: RegisterDto) {
        // Admin can create users with specific roles
        return this.authService.register(createUserDto.email, createUserDto.password, createUserDto.role);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('refresh')
    async refresh(@Request() req: any, @Body('refresh_token') refreshToken: string) {
        return this.authService.refresh(req.user.userId, refreshToken);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('logout')
    async logout(@Request() req: any) {
        return this.authService.logout(req.user.userId);
    }
}

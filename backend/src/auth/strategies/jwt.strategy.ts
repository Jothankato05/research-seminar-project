import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

// Load RSA public key from environment variable or file
let publicKey: string | Buffer = '';
try {
    if (process.env.JWT_PUBLIC_KEY) {
        publicKey = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
    } else {
        publicKey = fs.readFileSync(path.join(process.cwd(), 'secrets', 'public.key'));
    }
} catch (error) {
    console.error('Warning: Failed to load public key in JwtStrategy.', error);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: publicKey,
            algorithms: ['RS256'],
        });
    }

    async validate(payload: any) {
        return { userId: payload.sub, username: payload.username, role: payload.role };
    }
}

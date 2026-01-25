import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

// Load RSA public key from environment variable or file
let publicKey: string | Buffer = '';
try {
    if (process.env.JWT_PUBLIC_KEY) {
        console.log('JwtStrategy: Loading JWT_PUBLIC_KEY from environment...');
        publicKey = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
    } else {
        const keyPath = path.join(process.cwd(), 'secrets', 'public.key');
        console.log(`JwtStrategy: Checking for public key at: ${keyPath}`);
        if (fs.existsSync(keyPath)) {
            publicKey = fs.readFileSync(keyPath);
            console.log('JwtStrategy: Loaded public key from filesystem.');
        } else {
            console.warn('JwtStrategy: Public key not found in environment or filesystem!');
        }
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

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ThrottlerStorageRedisService implements ThrottlerStorage, OnModuleInit {
    private redis!: Redis;
    private readonly logger = new Logger(ThrottlerStorageRedisService.name);
    private isConnected = false;

    constructor(private readonly configService: ConfigService) { }

    onModuleInit() {
        try {
            this.redis = new Redis({
                host: this.configService.get('REDIS_HOST') || 'localhost',
                port: this.configService.get('REDIS_PORT') || 6379,
                maxRetriesPerRequest: 1,
                retryStrategy: () => null, // Don't retry, fail fast in development
                lazyConnect: true,
            });

            this.redis.connect().then(() => {
                this.isConnected = true;
                this.logger.log('Connected to Redis');
            }).catch((err) => {
                this.logger.warn('Redis not available, throttling disabled: ' + err.message);
                this.isConnected = false;
            });

            this.redis.on('error', () => {
                // Silently handle connection errors after initial connection attempt
                this.isConnected = false;
            });
        } catch (err) {
            this.logger.warn('Failed to initialize Redis, throttling disabled');
            this.isConnected = false;
        }
    }

    async increment(key: string, ttl: number): Promise<ThrottlerStorageRecord> {
        // If Redis is not connected, allow all requests (no throttling)
        if (!this.isConnected) {
            return {
                totalHits: 1,
                timeToExpire: Math.ceil(ttl / 1000),
                isBlocked: false,
                timeToBlockExpire: 0,
            };
        }

        try {
            const totalHits = await this.redis.incr(key);
            const timeToExpire = await this.redis.ttl(key);

            if (timeToExpire === -1) {
                await this.redis.expire(key, Math.ceil(ttl / 1000));
            }

            return {
                totalHits,
                timeToExpire: Math.ceil(ttl / 1000), // Convert to seconds for Redis
                isBlocked: false, // Basic implementation
                timeToBlockExpire: 0,
            };
        } catch (err) {
            // On any Redis error, allow the request
            return {
                totalHits: 1,
                timeToExpire: Math.ceil(ttl / 1000),
                isBlocked: false,
                timeToBlockExpire: 0,
            };
        }
    }
}

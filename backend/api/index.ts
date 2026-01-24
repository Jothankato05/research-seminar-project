import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module'; // Adjust path if needed
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

const createNestServer = async (expressInstance: express.Express) => {
    const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressInstance),
    );

    // Enable CORS
    app.enableCors({
        origin: '*', // Allow all origins for serverless (or configure specific domains in env)
        credentials: true,
    });

    // Global prefix (must match your main.ts)
    app.setGlobalPrefix('api/v1');

    await app.init();
};

createNestServer(server);

export default server;

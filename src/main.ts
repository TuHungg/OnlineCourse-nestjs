import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
    DocumentBuilder,
    SwaggerDocumentOptions,
    SwaggerCustomOptions,
    SwaggerModule,
} from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { CLIENT_WHITELIST } from './common/utils/constants/app.constant';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: {
            // origin: process.env.CLIENT_DOMAIN,
            origin: function (origin, callback) {
                if (!origin || CLIENT_WHITELIST.indexOf(origin) !== -1) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
        },
    });
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    const config = new DocumentBuilder()
        .setTitle('ONLINE COURSE API')
        .setDescription('The description of the API')
        .setVersion('1.0')
        .addBearerAuth(
            {
                // I was also testing it without prefix 'Bearer ' before the JWT
                description: `[just text field] Please enter token in following format: Bearer <JWT>`,
                name: 'Authorization',
                bearerFormat: 'Bearer', // I`ve tested not to use this field, but the result was the same
                scheme: 'Bearer',
                type: 'http', // I`ve attempted type: 'apiKey' too
                in: 'Header',
            },
            'access-token' // This name here is important for matching up with @ApiBearerAuth() in your controller!0wk
        )
        .build();

    //SWAGGER OPTIONS
    const documentOptions: SwaggerDocumentOptions = {};
    // SWAGGER CUSTOM OPTIONS
    const customOptions: SwaggerCustomOptions = {};
    const document = SwaggerModule.createDocument(app, config, documentOptions);
    SwaggerModule.setup('/api', app, document, customOptions);

    await app.listen(process.env.PORT || 3000);
}
bootstrap();

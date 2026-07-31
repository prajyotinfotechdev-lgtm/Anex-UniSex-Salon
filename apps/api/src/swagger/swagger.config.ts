import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env.config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ANEX OS API',
      version: '1.0.0',
      description: 'Enterprise Salon Management Platform API',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/api/v1/**/*.routes.ts', './src/api/v1/**/*.controller.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);

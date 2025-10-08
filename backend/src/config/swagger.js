const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const serverUrl =
    process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: process.env.APP_NAME || 'WDP301 API',
            version: process.env.APP_VERSION || '1.0.0',
            description: 'API documentation',
        },
        servers: [{ url: serverUrl }],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
            },
        },
    },
    apis: [
        path.join(__dirname, '../router/**/*.js'),
        path.join(__dirname, '../controllers/**/*.js'),
    ],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;

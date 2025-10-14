const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const serverUrl = process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

const options = {
    definition: {
        openapi: '3.0.3',
        info: { title: process.env.APP_NAME || 'WDP301 API', version: process.env.APP_VERSION || '1.0.0' },
        servers: [{ url: serverUrl }],
        components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
    },
    apis: [
        path.join(__dirname, '../router/**/*.js'),
    ],
};

const swaggerSpec = swaggerJSDoc(options);

if (process.env.NODE_ENV !== 'production') {
    console.log('Swagger paths:', Object.keys(swaggerSpec.paths || {}));
}

module.exports = swaggerSpec;

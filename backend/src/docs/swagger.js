// Configuración base de la documentación OpenAPI 3, generada con
// swagger-jsdoc a partir de los comentarios JSDoc que se escriben directo
// en los archivos de rutas (src/routes/*.routes.js). Este módulo solo arma
// la especificación; quien la expone como página interactiva es app.js,
// con swagger-ui-express.

const swaggerJsdoc = require('swagger-jsdoc');

const opciones = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Directorio Person',
      version: '1.0.0',
      description: 'API REST para el directorio de personas de AdventureWorks2025'
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Desarrollo' },
      {
        url: 'https://backend-directorio-jp-hkemejeybpc0dthz.centralus-01.azurewebsites.net',
        description: 'Producción'
      }
    ],
    // Esquema de seguridad reutilizable: cada endpoint protegido lo
    // referencia por nombre ("security: [{ bearerAuth: [] }]") en vez de
    // repetir esta definición en cada uno.
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  // swagger-jsdoc escanea estos archivos en busca de bloques de comentario
  // que empiecen con "@swagger" o "@openapi" y arma la especificación a
  // partir de ellos. Un patrón, no una lista de archivos: cubre cualquier
  // router nuevo (correos, telefonos, direcciones, etc.) sin tocar acá.
  apis: ['./src/routes/*.routes.js']
};

const especificacionSwagger = swaggerJsdoc(opciones);

module.exports = especificacionSwagger;

import { Options } from "swagger-jsdoc";

const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My TypeScript API",
      description: "API documentation with Swagger-Doc",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
  apis: ["./app.ts", "./routes/*.ts"], // Adjust path if your app.ts is in the root
};

export default swaggerOptions;

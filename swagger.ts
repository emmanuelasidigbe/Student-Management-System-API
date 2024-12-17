import swaggerAutogen from "swagger-autogen"; // Importing swagger-autogen

const swagger = swaggerAutogen(); // Initialize swagger-autogen

const doc = {
  info: {
    title: "My API", // The title of the API
    description: "Description of the API", // The description of the API
  },
  host: "localhost:3000", // The host of the API
  basePath: "/", // The base path
  schemes: ["http"], // Supported schemes (e.g., http, https)
};

const outputFile = "./swagger-output.json"; // Path to the output file
const routes = [
  "./app.ts", // Path to the main route file
];

// Generate the Swagger JSON file
swagger(outputFile, routes, doc)
  .then(() => {
    console.log("Swagger documentation generated successfully");
  })
  .catch((error: Error) => {
    console.error("Error generating Swagger documentation:", error);
  });

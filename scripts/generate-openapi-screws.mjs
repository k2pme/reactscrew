import openapiModule from '../dist/generation/openapi.js';

const { generateOpenApiArtifactsFromFile } = openapiModule;

const [, , inputPath, outputDirectory] = process.argv;

if (!inputPath || !outputDirectory) {
  console.error('Usage: node scripts/generate-openapi-screws.mjs <openapi.json> <output-directory>');
  process.exit(1);
}

await generateOpenApiArtifactsFromFile(inputPath, outputDirectory);

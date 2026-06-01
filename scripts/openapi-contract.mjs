import openapiModule from '../dist/generation/openapi.js';

const { loadOpenApiContract, validateOpenApiContract } = openapiModule;

const [, , command, source] = process.argv;

if (!command || !source) {
  console.error(
    'Usage: node scripts/openapi-contract.mjs <inspect|validate> <openapi-file-or-url>'
  );
  process.exit(1);
}

const contract = await loadOpenApiContract(source);

if (command === 'inspect') {
  console.log(JSON.stringify(contract, null, 2));
  process.exit(0);
}

if (command === 'validate') {
  const result = validateOpenApiContract(contract);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.valid ? 0 : 1);
}

console.error(`Unknown command "${command}". Expected "inspect" or "validate".`);
process.exit(1);

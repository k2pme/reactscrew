import { generateOpenApiArtifactsFromFile } from '../../src/generation/openapi.ts';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const specs = ['users', 'products', 'orders'];
const base = new URL('.', import.meta.url).pathname;

for (const name of specs) {
  const input = join(base, 'openapi', `${name}.openapi.json`);
  const output = join(base, 'generated', name);
  console.log(`Generating ${name} → ${output}`);
  await mkdir(output, { recursive: true });
  const result = await generateOpenApiArtifactsFromFile(input, output);
  console.log(`  ✓ ${result.contract.operations.length} operations, ${result.contract.schemas.length} schemas`);
}

# Generation Strategy

`reactscrew` ships a minimal OpenAPI generator intended to bootstrap screws from an existing REST contract.

## Current Strategy

- Parse a local OpenAPI JSON file.
- Group operations by first path segment.
- Generate one screw object per group.
- Use `operationId` when available for method names.
- Fall back to method + route naming when `operationId` is missing.

## Merge Strategy

The generated file is meant to be committed as a baseline, then wrapped or extended manually.

Recommended approach:

1. Generate a raw file into `generated/`.
2. Keep custom validators, optimistic updates and invalidation rules in hand-written wrapper files.
3. Re-generate only the raw layer when the backend contract changes.

This keeps codegen deterministic while preserving room for product-specific behavior.

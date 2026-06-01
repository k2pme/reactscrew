export const logRequest = (
  method: string,
  path: string,
  status: number,
  headers: Record<string, unknown> | undefined,
  requestBody: unknown,
  responseBody: unknown,
  durationMs?: number
): void => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const now = new Date().toISOString();
  const lines = [
    `[${now}] ${method.toUpperCase()} ${path} ${status}`,
    `Headers: ${JSON.stringify(headers ?? {})}`,
    `Request Body: ${JSON.stringify(requestBody ?? null)}`,
    `Response: ${JSON.stringify(responseBody ?? null)}`
  ];

  if (typeof durationMs === 'number') {
    lines.push(`Duration: ${durationMs}ms`);
  }

  console.log(lines.join('\n'));
};

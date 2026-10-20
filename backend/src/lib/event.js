export function getHeader(event, name) {
  const headers = event.headers || {};
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) return value;
  }
  return undefined;
}

export function getMethod(event) {
  return String(event.requestContext?.http?.method || event.httpMethod || "").toUpperCase();
}

export function getPathParam(event, name) {
  const params = event.pathParameters || {};
  const value = params[name];
  return value === undefined || value === null ? undefined : decodeURIComponent(String(value));
}

export function getQuery(event) {
  return event.queryStringParameters || {};
}

export function getJwtClaims(event) {
  return (
    event.requestContext?.authorizer?.jwt?.claims ||
    event.requestContext?.authorizer?.claims ||
    null
  );
}

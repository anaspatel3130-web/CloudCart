export function log(level, message, fields = {}) {
  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    ...fields,
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else console.log(line);
}

export function requestLog(event, extra = {}) {
  const requestId =
    event.requestContext?.requestId ||
    event.requestContext?.http?.requestId ||
    extra.requestId ||
    undefined;
  log("info", "request", {
    requestId,
    method: event.requestContext?.http?.method || event.httpMethod,
    path: event.rawPath || event.path,
    ...extra,
  });
}

export function pathParamFromRequest(
  request: Request,
  paramName: string,
): string {
  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const apiIndex = segments.indexOf("api");
  const pathAfterApi = apiIndex >= 0 ? segments.slice(apiIndex + 1) : segments;

  const paramIndex = findDynamicSegmentIndex(pathAfterApi, paramName);
  if (paramIndex >= 0 && pathAfterApi[paramIndex]) {
    return decodeURIComponent(pathAfterApi[paramIndex]!);
  }

  throw Object.assign(new Error(`Missing path parameter: ${paramName}`), {
    status: 400,
  });
}

function findDynamicSegmentIndex(parts: string[], paramName: string): number {
  const patterns: Record<string, string[]> = {
    chatId: ["chats"],
    messageId: ["messages"],
    attachmentId: ["attachments"],
  };
  const parents = patterns[paramName];
  if (!parents) return -1;
  for (let i = 0; i < parts.length; i++) {
    if (parents.includes(parts[i]!) && parts[i + 1]) {
      return i + 1;
    }
  }
  return -1;
}

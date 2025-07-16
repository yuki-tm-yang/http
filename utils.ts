export function getMimeType(extention: string) {
  switch (extention) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css";
    case ".js":
      return "application/javascript";
    case ".json":
      return "application/json";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

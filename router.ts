export type Handler = (params: {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: string;
}) => {
  statusLine: string;
  headers: Record<string, string>;
  body: string;
};

interface RouterEntry {
  method: string;
  path: string | RegExp;
  handler: Handler;
}

export class Router {
  private routes: RouterEntry[] = [];

  get(path: string | RegExp, handler: Handler) {
    this.routes.push({ method: "GET", path, handler });
  }

  post(path: string | RegExp, handler: Handler) {
    this.routes.push({ method: "POST", path, handler });
  }

  handle(
    method: string,
    path: string,
    headers: Record<string, string>,
    body?: string,
  ) {
    for (const route of this.routes) {
      if (method !== route.method) {
        console.warn("No match method");
        continue;
      }

      const isPathMatch = typeof path === "string"
        ? path === route.path
        : route.path instanceof RegExp && path === route.path;

      if (!isPathMatch) {
        console.warn("No match path");
        continue;
      }

      return route.handler({
        method,
        path,
        headers,
        body,
      });
    }

    return {
      statusLine: "HTTP/1.1 404 Not Found",
      headers: { "content-type": "text/plain" },
      body: "404 Not Found",
    };
  }
}

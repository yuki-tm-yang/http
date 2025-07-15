import HTTP from "./http.ts";
import { Router } from "./router.ts";

const now = new Date().toLocaleTimeString();
console.log(
  `[${now}] 🔁 Server restarted and running on http://localhost:8080`,
);

const router = new Router();
router.get("/", () => ({
  statusLine: "HTTP/1.1 200 OK",
  headers: { "content-type": "text/plain" },
  body: "What's up here's root",
}));

router.get("/tokyo", () => ({
  statusLine: "HTTP/1.1 200 OK",
  headers: { "content-type": "text/plain" },
  body: "What's up here's Tokyo",
}));

const listener = Deno.listen({ port: 8080 });
console.log("HTTP server is running on http://localhost:8080");

for await (const conn of listener) {
  handleConnection(conn);
}

async function handleConnection(conn: Deno.Conn) {
  const buffer = new Uint8Array(1024);
  console.log({ buffer });
  try {
    while (true) {
      const bufferRead = await conn.read(buffer);
      console.log({ bufferRead });

      if (bufferRead === null) {
        console.log("Connection closed");
        break;
      }

      const requestText = new TextDecoder().decode(
        buffer.subarray(0, bufferRead),
      );
      console.log("Received request:\n", requestText);
      const { method, path, headers } = HTTP.parseRequest(requestText);
      const { statusLine, headers: resHeaders, body: resBody } = router.handle(
        method,
        path,
        headers,
      );

      resHeaders["content-length"] = resBody.length.toString();

      const responseBytes = HTTP.buildResponse(
        statusLine,
        resHeaders,
        resBody,
      );
      await conn.write(responseBytes);

      const connectionHeader = headers["connection"] ?? "";
      console.log({ connectionHeader });
      if (connectionHeader.toLocaleLowerCase() !== "keep-alive") {
        conn.close();
        break;
      }
      console.log(
        `Response sent for ${method} ${path} with status ${statusLine}`,
      );
    }
  } finally {
    conn.close();
  }
}

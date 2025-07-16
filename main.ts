import HTTP from "./http.ts";
import { Router } from "./router.ts";
import { getMimeType } from "./utils.ts";

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

router.get("/html", () => "index.html");
router.get("/styles.css", () => "styles.css");
router.get("/script.js", () => "script.js");

const listener = Deno.listen({ port: 8080 });
console.log("HTTP server is running on http://localhost:8080");

for await (const conn of listener) {
  handleConnection(conn);
}

async function handleConnection(conn: Deno.Conn) {
  const buffer = new Uint8Array(1024);

  try {
    while (true) {
      const bufferRead = await conn.read(buffer);

      if (bufferRead === null) {
        console.log("Connection closed");
        break;
      }

      const requestText = new TextDecoder().decode(
        buffer.subarray(0, bufferRead),
      );

      const parsedRequestText = HTTP.parseRequest(requestText);
      const { method, path, headers } = parsedRequestText;

      let responseBytes: Uint8Array;
      const maybePath = router.handle(method, path, headers);

      if (typeof maybePath === "string") {
        const filePath = `./public/${maybePath}`;
        try {
          const data = await Deno.readFile(filePath);
          const extention = maybePath.slice(maybePath.lastIndexOf("."));
          const mimeType = getMimeType(extention);
          responseBytes = HTTP.buildResponse(
            "HTTP/1.1 200 OK",
            {
              "content-type": mimeType,
              "content-length": data.byteLength.toString(),
            },
            "",
          );

          await conn.write(responseBytes);
          await conn.write(data);
        } catch {
          responseBytes = HTTP.buildResponse(
            "HTTP/1.1 404 Not Found",
            { "content-type": "text/plain" },
            "404 Not Found",
          );
          await conn.write(responseBytes);
        }
      } else {
        const { statusLine, headers: resHeaders, body: resBody } = maybePath;
        resHeaders["content-length"] = resBody.length.toString();

        responseBytes = HTTP.buildResponse(
          statusLine,
          resHeaders,
          resBody,
        );
        await conn.write(responseBytes);
        console.log(
          `Response sent for ${method} ${path} with status ${statusLine}`,
        );
      }
    }
  } finally {
    conn.close();
  }
}

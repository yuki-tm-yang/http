import { bold } from "jsr:@std/internal@^1.0.6/styles";
import HTTP from "./http.ts";

const now = new Date().toLocaleTimeString();
console.log(
  `[${now}] 🔁 Server restarted and running on http://localhost:8080`,
);

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

      let responseBody: string;
      let statusLine = "HTTP/1.1 200 OK";

      switch (path) {
        case "/":
          responseBody = "Here is root";
          break;
        case "/tokyo":
          responseBody = "Here is Tokyo";
          break;
        case "/osaka":
          responseBody = "Here is Osaka";
          break;

        default:
          statusLine = "HTTP/1.1 404 Not Found";
          responseBody = "404 Not Found";
      }
      const httpResponse = HTTP.buildResponse(
        statusLine,
        {
          "content-type": "text/plain",
          "content-length": responseBody.length.toString(),
          connection: headers["connection"] || "",
        },
        responseBody,
      );
      await conn.write(httpResponse);

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

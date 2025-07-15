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
  const bufferRead = await conn.read(buffer);
  console.log({ bufferRead });

  if (bufferRead === null) {
    console.log("Connection closed");
    return;
  }

  const requestText = new TextDecoder().decode(buffer.subarray(0, bufferRead));
  console.log("Received request:\n", requestText);

  const [requestLine, ...headers] = requestText.split("\r\n");
  const [method, path] = requestLine.split(" ");

  let responseBody: string;
  let statusLine = "HTTP/1.1 200 OK";

  switch (path) {
    case "/":
      responseBody = "Here is root";
      break;
    case "/tokyo":
      responseBody = "Here is Tokyo";
      break;
    case "/Osaka":
      responseBody = "Here is Osaka";
      break;

    default:
      statusLine = "HTTP/1.1 404 Not Found";
      responseBody = "404 Not Found";
  }
  const httpResponse = [
    statusLine,
    "Context-Type: text/plain",
    `Content-Length: ${responseBody.length}`,
    "",
    responseBody,
  ].join("\r\n");

  await conn.write(new TextEncoder().encode(httpResponse));
  conn.close();
  console.log(`Response sent for ${method} ${path} with status ${statusLine}`);
}

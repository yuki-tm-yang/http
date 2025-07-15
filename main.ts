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
  console.log("Received request:", requestText);

  const body = "Your first Server is running!";
  const httpResponse = [
    "HTTP/1.1 200 OK",
    "Context-Type: text/plain",
    `Content-Length: ${body.length}`,
    "",
    body,
  ].join("\r\n");

  await conn.write(new TextEncoder().encode(httpResponse));
  conn.close();
  console.log("Response sent and connection closed");
}

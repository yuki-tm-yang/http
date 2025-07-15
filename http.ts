const HTTP = {
  parseRequest(requestText: string) {
    const [requestLine, ...headerLines] = requestText.split("\r\n");
    const [method, path, httpVersion] = requestLine.split(" ");
    const headers = headerLines.filter((headerLine) => headerLine.includes(":"))
      .reduce<Record<string, string>>((map, headerLine) => {
        const [rawName, ...rest] = headerLine.split(":");
        const name = rawName.trim().toLocaleLowerCase();
        const value = rest.join(":").trim();
        map[name] = value;
        return map;
      }, {});

    return {
      method,
      path,
      headers,
      httpVersion,
    };
  },

  buildResponse(
    statusLine: string,
    headers: Record<string, string>,
    body: string,
  ): Uint8Array {
    const headerLines = Object.entries(headers).map(([name, value]) =>
      `${name}: ${value}`
    );

    const responseText = [
      statusLine,
      ...headerLines,
      "",
      body,
    ].join("\r\n");

    return new TextEncoder().encode(responseText);
  },
};

export default HTTP;

import { MuxAsyncIterator } from "https://deno.land/std@0.213.0/async/mux_async_iterator.ts";

import { Request } from "./request.ts";

//const httpServer = Deno.listen({ port: 80, hostname: "127.0.0.1" });
const httpServer = Deno.listen({ port: 80});
const listener = new MuxAsyncIterator<Deno.Conn>();
listener.add(httpServer);

for await (const conn of listener) {
  handler(
    conn,
    1000,
  ).catch((e) => {
    console.log(e);
  });
}

async function handler(
  incomeConn: Deno.Conn,
  timeout: number,
) {
  const reader = incomeConn.readable.getReader();

  const request = await new Request(reader).parse();
  if (!request) return safeClose(incomeConn);

  const method = request.method;
  const target = request.target!;

  const ctrl = new AbortController();
  const { signal } = ctrl;
  const encoder = new TextEncoder();

  switch (method) {
    case "CONNECT":
      try {
        reader.releaseLock();

        using targetConn = await timeoutConn(Deno.connect(target), timeout);

        await incomeConn.write(
          encoder.encode("HTTP/1.1 200 Connection established\r\n\r\n"),
        );

        await Promise.all([
          incomeConn.readable.pipeTo(targetConn.writable, { signal }),
          targetConn.readable.pipeTo(incomeConn.writable, { signal }),
        ]).catch(() => ctrl.abort());
      } catch (e) {
        console.log(e);
      } finally {
        safeClose(incomeConn);
      }
      break;
  }
}

class TimeoutError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "Timeout";
  }
}

function timeoutConn(
  promise: Promise<Deno.TcpConn>,
  ms: number,
): Promise<Deno.TcpConn> {
  let timer: number | undefined;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(resolve, ms);
  }).then(() => {
    promise.then(safeClose).catch(() => {});
    throw new TimeoutError("Connection timed out after " + ms + " ms");
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function safeClose(...conns: Deno.Conn[]) {
  conns.forEach((v) => {
    try {
      v.close();
      // deno-lint-ignore no-empty
    } catch (_) {}
  });
}

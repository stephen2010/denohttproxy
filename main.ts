import { MuxAsyncIterator } from "https://deno.land/std@0.224.0/async/mux_async_iterator.ts";
import { readLines } from "https://deno.land/std@0.224.0/io/read_lines.ts";

// const cert = await Deno.readTextFile(
//   "/home/ste/work/certs/cert-lets_encrypt-AocCcg6zccpeNEWFsVIPfSfgjUA0aS-mSNlW1-U1I-o",
// );
// const key = await Deno.readTextFile(
//   "/home/ste/work/certs/key-lets_encrypt-AocCcg6zccpeNEWFsVIPfSfgjUA0aS-mSNlW1-U1I-o",
// );

// const httpServer = Deno.listenTls({ port: 443, cert, key });
const httpServer = Deno.listen({ port: 443 });
const listener = new MuxAsyncIterator<Deno.Conn>();
listener.add(httpServer);

for await (const conn of listener) {
  handler(
    conn,
    1000,
  ).catch(() => {});
  // ).catch((e) => {
  //   console.log(e);
  // });
}

async function handler(
  incomeConn: Deno.Conn,
  timeout: number,
) {
  let connectline = "";
  for await (let line of readLines(incomeConn)) {
    if (line.startsWith("CONNECT ")) {
      connectline = line;
      // console.log(connectline);
      break;
    }
  }
  const lines = connectline.split(" ");
  const url = new URL(`a://${lines[1]}`);
  const target = { hostname: url.hostname, port: Number(url.port) };

  const ctrl = new AbortController();
  const { signal } = ctrl;
  const encoder = new TextEncoder();

  try {
    using targetConn = await timeoutConn(Deno.connect(target), timeout);

    await incomeConn.write(
      encoder.encode("HTTP/1.1 200 Connection established\r\n\r\n"),
    );

    await Promise.all([
      incomeConn.readable.pipeTo(targetConn.writable, { signal }),
      targetConn.readable.pipeTo(incomeConn.writable, { signal }),
    ]).catch(() => ctrl.abort());
  } catch (_) {
    // } catch (e) {
    //   console.log(e);
  } finally {
    safeClose(incomeConn);
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
    } catch (_) {}
  });
}

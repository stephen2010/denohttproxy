const hostport = { port: 80};
const listener = Deno.listen(hostport);

for await (const conn of listener) {
//  await conn.readable.pipeTo(Deno.stdout.writable);
  await conn.readable.pipeTo(conn.writable);

//  conn.close();
}

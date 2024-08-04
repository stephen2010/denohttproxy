//import { proxy } from "https://deno.land/x/oak_http_proxy@2.3.0/mod.ts";
//import { Application } from "https://deno.land/x/oak@v12.6.2/mod.ts";
//const app = new Application();
//app.use(proxy("https://www.sogou.com/"));
/*
app.use(
  function (sxw, res) {
    // console.log(sxw.request.url.pathname);
    proxy("https://www.sogou.com${sxw.request.url.pathname}");
  },
);
*/
//await app.listen({ port: 80 });

class ProxyHTTP {
  public readonly listener: Deno.Listener;
  public readonly target: URL;
  public listening = false;
  constructor(listener: Deno.Listener, target: URL | string) {
    this.listener = listener;
    this.target = target instanceof URL ? target : new URL(target);
  }
  private async handler(conn: Deno.Conn) {
    const httpConn = Deno.serveHttp(conn);
    for await (const { request, respondWith } of httpConn) {
      const url = new URL(request.url);
      url.hostname = this.target.hostname;
      url.port = this.target.port;
//      console.log(url);
      respondWith(fetch(url.toString(), request));
    }
  }
  public async listen() {
    this.listening = true;
    while (this.listening) this.handler(await this.listener.accept());
  }
  public stop() {
    this.listening = false;
  }
}

const server = Deno.listen({port: 80 });
const proxy = new ProxyHTTP(server, "https://github.com");
proxy.listen();

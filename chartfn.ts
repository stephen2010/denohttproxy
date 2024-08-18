import { serveFile } from "jsr:@std/http/file-server";
import { dirname, extname } from "jsr:@std/path";

const regex1 = /https\:\/\/static\.tradingview\.com/g;
const regex2 = /data\.tradingview\.com/i;

export async function chartfn(req: Request) {
  /*
  return serveFile(
    req,
    "./tv.html",
  );
  */
  const tvurl = "https://tradingview.com/chart";
  const res = await fetch(tvurl, req);
  let indexhtml = await res.text();
  indexhtml = indexhtml.replace(regex1, "");
  indexhtml = indexhtml.replace(regex2, "wp3.deno.dev");

  return new Response(indexhtml, res);
}

const newhearders = new Headers();

const regex3 = /wp1\.deno\.dev/i;
function tihuan(str: string, strthen: string): string {
  return str.replace(regex3, strthen);
}

export async function staticfn(req: Request, pathname: string) {
  const tvurl = "https://static.tradingview.com" + pathname;

  // const localfile = "/home/ste/tradingview/20240813" + pathname;
  //  const localdir = dirname(localfile);
  // const localfilext = extname(localfile);
  const localfilext = extname(pathname);
  // if (localfilext == ".css") {
  //   newHeaders.set(
  //     "Sec-Fetch-Dest",
  //     "style",
  //   );
  // } else if (localfilext == ".js") {
  //   newHeaders.set(
  //     "Sec-Fetch-Dest",
  //     "script",
  //   );
  // }
  for (var [key, value] of req.headers) {
    switch (key) {
      case "host": {
        newhearders.set(key, tihuan(value, "static.tradingview.com"));
        break;
      }
      case "origin": {
        newhearders.set(key, tihuan(value, "tradingview.com"));
        break;
      }
      case "referer": {
        newhearders.set(key, tihuan(value, "tradingview.com"));
        break;
      }
      case "Sec-Fetch-Dest": {
        const destzhi = localfilext == ".css" ? "style" : "script";
        newhearders.set(key, destzhi);
        break;
      }
      default: {
        newhearders.append(key, value);
      }
    }
  }
  console.log("newhearders", newhearders);
  const res = await fetch(tvurl, {
    headers: newHeaders,
    // referrer: "https://tradingview.com/chart",
  });
  return res;
}

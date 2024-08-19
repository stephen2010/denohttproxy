import { serveFile } from "jsr:@std/http/file-server";
import { dirname, extname } from "jsr:@std/path";

const regex3 = /wp3\.deno\.dev/i;

const regex1 = /https\:\/\/static\.tradingview\.com/g;
// const regex2 = /data\.tradingview\.com/i;

export async function chartfn(req: Request) {
  /*
  return serveFile(
    req,
    "./tv.html",
  );
  */
  const target = "https://tradingview.com/chart";

  const nh = new Headers(req.headers);
  const value = nh.get("host");
  if (value != null) {
    nh.set("host", value.replace(regex3, "tradingview.com"));
  }
  // console.log("/chart nh", nh);

  const res = await fetch(target, {
    headers: nh,
  });
  // return res;
  let indexhtml = await res.text();
  indexhtml = indexhtml.replace(regex1, "");
  // indexhtml = indexhtml.replace(regex2, "wp3.deno.dev");

  return new Response(indexhtml, res);
}

export async function staticfn(req: Request, pathname: string) {
  const target = "https://static.tradingview.com" + pathname;

  // const localfile = "/home/ste/tradingview/20240813" + pathname;
  //  const localdir = dirname(localfile);
  // const localfilext = extname(localfile);

  const nh = new Headers(req.headers);

  ["host", "origin", "referer"].forEach((key) => {
    const value = nh.get(key);
    if (value != null) {
      nh.set(key, value.replace(regex3, "tradingview.com"));
    }
  });

  const localfilext = extname(pathname);
  if (nh.has("Sec-Fetch-Dest")) {
    const destzhi = localfilext == ".css" ? "style" : "script";
    nh.set("Sec-Fetch-Dest", destzhi);
  }
  // console.log("/static nh", nh);

  const res = await fetch(target, {
    headers: nh,
  });
  return res;
  // let indexhtml = await res.text();
  // return new Response(indexhtml, res);
}

//========================================
function tihuan(str: string, strthen: string): string {
  return str.replace(regex3, strthen);
}

export async function staticfn2(req: Request, pathname: string) {
  const target = "https://static.tradingview.com" + pathname;

  // const localfile = "/home/ste/tradingview/20240813" + pathname;
  //  const localdir = dirname(localfile);
  // const localfilext = extname(localfile);
  const localfilext = extname(pathname);

  const nh = new Headers();
  for (var [key, value] of req.headers) {
    switch (key) {
      case "host": {
        nh.set(key, tihuan(value, "tradingview.com"));
        break;
      }
      case "origin": {
        nh.set(key, tihuan(value, "tradingview.com"));
        break;
      }
      case "referer": {
        nh.set(key, tihuan(value, "tradingview.com"));
        break;
      }
      case "Sec-Fetch-Dest": {
        const destzhi = localfilext == ".css" ? "style" : "script";
        nh.set(key, destzhi);
        break;
      }
      default: {
        nh.append(key, value);
      }
    }
  }
  console.log("nh", nh);
  const res = await fetch(target, {
    headers: nh,
  });
  return res;
}

const kv = await Deno.openKv();
import { serveFile } from "jsr:@std/http/file-server";

const regex2 = /wp1\.deno\.dev/i;

const luyou = async (req: Request) => {
  const url = new URL(req.url);
  const pn = url.pathname;
  const pathsz = pn.split("/");
  pathsz.shift();
  let path1 = pathsz.shift();
  if (path1 == "wangzhi") {
    const wangzhi = pathsz.shift();
    await kv.set(["wangzhi"], wangzhi);
    var response = Response.redirect("https://wp1.deno.dev/", 301);
    return response;
  }
  const value = (await kv.get(["wangzhi"])).value;
  if (!value) {
    return new Response("404: Not Found", {
      status: 404,
    });
  }
  const target = req.url.replace(regex2, value as string);
  return fetch(target);
};

Deno.serve(luyou);

const kv = await Deno.openKv();

let target: string | undefined = undefined;

const regex2 = /wp1\.deno\.dev/i;
function tihuan(str: string): string {
  const hoststr = str.replace(regex2, target);
  return hoststr;
}

const luyou = async (req: Request) => {
  const url = new URL(req.url);
  const pn = url.pathname;
  const pathsz = pn.split("/");
  pathsz.shift();
  let path1 = pathsz.shift();
  if (path1 == "wangzhi") {
    target = pathsz.shift();
    var response = Response.redirect("https://wp1.deno.dev/", 301);
    return response;
  }
  if (path1 == "delecookie") {
    const iter = kv.list<string>({ prefix: ["cookie"] });
    for await (const item of iter) {
      console.log("cookie", item, " has deleted");
      await kv.delete(item.key);
    }
    const entry = await kv.get(["wangzhi"]);
    await kv.delete(entry.key);
    return new Response("all cookies has deleted", {
      status: 200,
    });
  }

  if (target == undefined) {
    return new Response("404: Not Found", {
      status: 404,
    });
  }
  const hoststr = req.headers.get("Host");
  const originstr = req.headers.get("Origin");
  const refererstr = req.headers.get("Referer");
  const newhearders = new Headers({
    host: tihuan(hoststr),
    origin: tihuan(originstr),
    referer: tihuan(refererstr),
  });
  const rescookiestr = (await kv.get(["cookie", target])).value;
  if (rescookiestr != null) {
    newhearders.set("Cookie", rescookiestr as string);
  }

  for (var [key, value] of req.headers) {
    switch (key) {
      case "cookie": {
        continue;
      }
      case "host": {
        continue;
      }
      case "origin": {
        continue;
      }
      case "referer": {
        continue;
      }
      default: {
        newhearders.append(key, value);
      }
    }
  }

  let reqform: FormData | undefined = undefined;
  if (req.method == "POST") {
    reqform = await req.formData();
  }

  const targeturl = req.url.replace(regex2, target);
  const res = await fetch(targeturl, {
    headers: newhearders,
    method: req.method,
    body: reqform,
  });
  const reqcookiestr = getCookies(res.headers);
  await kv.set(["cookie", target], reqcookiestr);
  return res;
};

Deno.serve(luyou);

function getCookies(resheaders: Headers): string {
  const reqcookies: string[] = [];
  for (const [key, setcookiestr] of resheaders) {
    if (key === "set-cookie") {
      const c = setcookiestr.split(";");
      const c1 = c.shift();
      if (c1 != null) {
        reqcookies.push(c1);
      }
    }
  }
  const reqcookiestr = reqcookies.join(";");
  return reqcookiestr;
}

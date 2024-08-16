const kv = await Deno.openKv();

const regex2 = /wp1\.deno\.dev/i;
let target: string | undefined = undefined;

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
  const targeturl = req.url.replace(regex2, target);
  const httpstr = "https://" + target + "/";
  const newhearders = new Headers({
    host: target,
    referer: targeturl,
    origin: httpstr,
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

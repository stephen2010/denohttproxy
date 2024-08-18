const kv = await Deno.openKv();

let target: string | null = null;

const regex1 = /github\.com/i;
const regex2 = /wp1\.deno\.dev/i;

function tihuan(str: string): string {
  return str.replace(regex2, target);
}

const luyou = async (req: Request) => {
  const url = new URL(req.url);
  const pn = url.pathname;
  const pathsz = pn.split("/");
  pathsz.shift();
  let path1 = pathsz.shift();
  if (path1 == "wangzhi") {
    target = pathsz.shift();
    return Response.redirect("https://wp1.deno.dev/", 301);
  }
  if (path1 == "delecookie") {
    const iter = kv.list<string>({ prefix: ["cookie"] });
    for await (const item of iter) {
      console.log("cookie", item, " has deleted");
      await kv.delete(item.key);
    }
    return new Response("all cookies has deleted", {
      status: 200,
    });
  }

  if (target == null) {
    return new Response("404: Not Found", {
      status: 404,
    });
  }

  const newhearders = new Headers();

  for (var [key, value] of req.headers) {
    switch (key) {
      case "host": {
        newhearders.set(key, tihuan(value));
        break;
      }
      case "origin": {
        newhearders.set(key, tihuan(value));
        break;
      }
      case "referer": {
        newhearders.set(key, tihuan(value));
        break;
      }
      default: {
        newhearders.append(key, value);
      }
    }
  }

  let reqform: FormData | undefined = undefined;
  if (req.method == "POST") {
    reqform = await req.formData();
    if (reqform.has("return_to")) {
      let returnto = reqform.get("return_to");
      returnto = returnto.replace(regex1, "wp1.deno.dev");
      reqform.set("return_to", returnto);
    }
    console.log("reqform", reqform);
  }

  const targeturl = req.url.replace(regex2, target);
  const res = await fetch(targeturl, {
    headers: newhearders,
    method: req.method,
    body: reqform,
  });
  return res;
};

Deno.serve(luyou);

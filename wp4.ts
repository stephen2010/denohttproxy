const regex2 = /wp4\.deno\.dev/i;

let target: string | null = null;
const luyou = async (req: Request) => {
  const url = new URL(req.url);
  const pn = url.pathname;
  const pathsz = pn.split("/");
  pathsz.shift();
  let path1 = pathsz.shift();
  if (path1 == "wangzhi") {
    target = pathsz.shift();
    return Response.redirect("https://wp4.deno.dev/", 301);
  }

  if (target == null) {
    return new Response("404: Not Found", {
      status: 404,
    });
  }

  const targeturl = req.url.replace(regex2, target);

  const newreq = new Request(targeturl, {
    headers: req.headers,
    method: req.method,
    body: req.body,
    redirect: "follow",
  });
  return await fetch(newreq);
};

Deno.serve(luyou);

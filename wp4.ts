let target: string | null = null;

Deno.serve(async (req) => {
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

  url.host = target;

  const newreq = new req(url.toString(), {
    headers: req.headers,
    method: req.method,
    body: req.body,
    redirect: "follow",
  });
  return await fetch(newreq);
});

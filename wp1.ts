const luyou = async (req: Request) => {
  const url = new URL(req.url);
  const pn = url.pathname;
  const target = "https://" + pn;
  return fetch(target, req);
};

Deno.serve(luyou);

const luyou = async (req: Request) => {
  const url = new URL(req.url);
  const pn = url.pathname;
  const se = url.search;
  const target = "https://" + pn + se;
  return fetch(target, req);
};

Deno.serve(luyou);

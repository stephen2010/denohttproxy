import { proxy } from "https://deno.land/x/oak_http_proxy@2.3.0/mod.ts";
import { Application } from "https://deno.land/x/oak@v12.6.2/mod.ts";

const app = new Application();

app.use(proxy("https://github.com/"));

await app.listen({ port: 80 });

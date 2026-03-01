import { defineMiddleware } from "astro:middleware";
import { validateAccessJWT } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  // Public routes — skip auth entirely
  if (!context.url.pathname.startsWith("/portal")) {
    return next();
  }

  // Local dev bypass — no CF Access edge auth available locally
  if (import.meta.env.DEV) {
    context.locals.user = { email: "dev@example.com" };
    return next();
  }

  // Get Cloudflare runtime env (wrangler.jsonc vars + CF dashboard secrets)
  const runtimeEnv = context.locals.runtime?.env;

  // Portal routes — validate CF Access JWT (defense-in-depth)
  const result = await validateAccessJWT(context.request, runtimeEnv);

  if (result) {
    context.locals.user = { email: result.email };
    return next();
  }

  // CF Access should block unauthenticated requests at the edge.
  // If we reach here, something is misconfigured — reject the request.
  return new Response("Unauthorized", { status: 401 });
});

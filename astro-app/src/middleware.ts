import { defineMiddleware } from "astro:middleware";
import { validateAccessJWT } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  // Public routes — skip auth entirely
  if (!context.url.pathname.startsWith("/portal")) {
    return next();
  }

  // Portal routes — validate CF Access JWT (defense-in-depth)
  const result = await validateAccessJWT(context.request);

  if (result) {
    context.locals.user = { email: result.email };
    return next();
  }

  // CF Access should block unauthenticated requests at the edge.
  // If we reach here, something is misconfigured — reject the request.
  return new Response("Unauthorized", { status: 401 });
});

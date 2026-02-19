import { jwtVerify, createRemoteJWKSet } from "jose";

/**
 * Validates a Cloudflare Access JWT from the Cf-Access-Jwt-Assertion header.
 * Returns the authenticated user's email on success, null on failure.
 *
 * Defense-in-depth: CF Access enforces auth at the edge before requests reach
 * the Astro Worker. This validation catches misconfiguration or bypass attempts.
 */
export async function validateAccessJWT(
  request: Request,
  env?: Record<string, unknown>,
): Promise<{ email: string } | null> {
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return null;

  const teamDomain = getEnvVar("CF_ACCESS_TEAM_DOMAIN", env);
  const aud = getEnvVar("CF_ACCESS_AUD", env);
  if (!teamDomain || !aud) return null;

  try {
    const JWKS = createRemoteJWKSet(
      new URL(`${teamDomain}/cdn-cgi/access/certs`),
    );

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: teamDomain,
      audience: aud,
    });

    const email = payload.email as string | undefined;
    if (!email) return null;

    return { email };
  } catch {
    return null;
  }
}

/**
 * Read env vars from Cloudflare runtime env (preferred), then fall back to process.env.
 * On CF Workers: vars from wrangler.jsonc are in locals.runtime.env, not process.env.
 * On local dev: vars come from .env via process.env.
 */
function getEnvVar(
  name: string,
  runtimeEnv?: Record<string, unknown>,
): string | undefined {
  // Cloudflare Workers runtime: env vars from wrangler.jsonc / CF dashboard
  const runtimeVal = runtimeEnv?.[name];
  if (typeof runtimeVal === "string" && runtimeVal) return runtimeVal;

  // Local dev fallback: .env file loaded into process.env
  if (typeof process !== "undefined" && process.env?.[name]) {
    return process.env[name];
  }

  return undefined;
}

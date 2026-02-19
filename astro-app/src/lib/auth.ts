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
): Promise<{ email: string } | null> {
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return null;

  const teamDomain = getEnvVar("CF_ACCESS_TEAM_DOMAIN");
  const aud = getEnvVar("CF_ACCESS_AUD");
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

/** Read env vars from either Astro's import.meta.env or process.env (Workers runtime). */
function getEnvVar(name: string): string | undefined {
  // Cloudflare Workers: vars are on process.env at runtime
  // Astro dev: vars are on process.env via .env file
  return (
    (typeof process !== "undefined" && process.env?.[name]) || undefined
  );
}

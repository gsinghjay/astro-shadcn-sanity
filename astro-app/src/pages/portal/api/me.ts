import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = ({ locals }) => {
  return new Response(JSON.stringify(locals.user ?? null), {
    headers: { "Content-Type": "application/json" },
  });
};

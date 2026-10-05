// Cloudflare Pages Function for /api/feedback (see ../_lib/handler.js).
import { handleGet, handlePost } from "../_lib/handler.js";

export const onRequestGet = ({ request, env }) => handleGet(request, env);
export const onRequestPost = ({ request, env }) => handlePost(request, env);
export const onRequest = () => new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: { allow: "GET, POST", "content-type": "application/json" } });

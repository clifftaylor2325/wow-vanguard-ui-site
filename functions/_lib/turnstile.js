// Cloudflare Turnstile's server-side check (siteverify). A token passes when
// Cloudflare says success and the widget ran on this site's hostname.
// Cloudflare's public test secret keys answer for "example.com" with
// metadata.result_with_testing_key set; those answers skip the hostname match
// (feedback.js refuses test keys anywhere but localhost).

export const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Cloudflare's published test keys (developers.cloudflare.com/turnstile/troubleshooting/testing/).
export const TEST_SITEKEYS = ["1x00000000000000000000AA", "2x00000000000000000000AB", "1x00000000000000000000BB", "2x00000000000000000000BB", "3x00000000000000000000FF"];
export const TEST_SECRETS = ["1x0000000000000000000000000000000AA", "2x0000000000000000000000000000000AA", "3x0000000000000000000000000000000AA"];

// True when the token checks out for hostname.
export async function verifyTurnstile({ secret, token, ip, hostname, fetchFn = fetch }) {
  if (!token || typeof token !== "string" || token.length > 2048) return false;
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  let data;
  try {
    const res = await fetchFn(SITEVERIFY, { method: "POST", body: form });
    data = await res.json();
  } catch {
    return false;
  }
  if (!data || data.success !== true) return false;
  return data.metadata?.result_with_testing_key === true || data.hostname === hostname;
}

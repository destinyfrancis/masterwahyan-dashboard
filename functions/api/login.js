const COOKIE_NAME = "mw_dash_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

export async function onRequestPost(context) {
  const configuredHash = context.env.DASHBOARD_PASSWORD_HASH;
  const sessionSecret = context.env.DASHBOARD_SESSION_SECRET;

  if (!configuredHash || !sessionSecret) {
    return json({ error: "Dashboard auth is not configured." }, 500);
  }

  const formData = await context.request.formData();
  const password = String(formData.get("password") || "");
  const passwordHash = await sha256Hex(password);

  if (!timingSafeEqual(passwordHash, configuredHash.trim().toLowerCase())) {
    return json({ error: "Invalid password." }, 401);
  }

  const issuedAt = String(Math.floor(Date.now() / 1000));
  const signature = await hmacHex(sessionSecret, issuedAt);
  const cookie = [
    `${COOKIE_NAME}=${issuedAt}.${signature}`,
    "Path=/",
    `Max-Age=${SESSION_TTL_SECONDS}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax"
  ].join("; ");

  return json({ ok: true }, 200, {
    "Set-Cookie": cookie
  });
}

export function onRequest() {
  return json({ error: "Method not allowed." }, 405, {
    Allow: "POST"
  });
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(digest));
}

async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return bytesToHex(new Uint8Array(signature));
}

function bytesToHex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers
    }
  });
}

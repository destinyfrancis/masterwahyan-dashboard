const COOKIE_NAME = "mw_dash_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

const PUBLIC_PATHS = new Set([
  "/login",
  "/login.html",
  "/api/login"
]);

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (PUBLIC_PATHS.has(url.pathname)) {
    return context.next();
  }

  if (url.pathname === "/logout") {
    return logoutResponse();
  }

  const valid = await hasValidSession(context.request, context.env);
  if (!valid) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("next", url.pathname + url.search);
    return Response.redirect(loginUrl.toString(), 302);
  }

  return context.next();
}

async function hasValidSession(request, env) {
  const secret = env.DASHBOARD_SESSION_SECRET;
  if (!secret) return false;

  const cookie = getCookie(request.headers.get("Cookie") || "", COOKIE_NAME);
  if (!cookie) return false;

  const [issuedAtText, signature] = cookie.split(".");
  const issuedAt = Number(issuedAtText);
  if (!Number.isFinite(issuedAt) || !signature) return false;

  const ageSeconds = Math.floor(Date.now() / 1000) - issuedAt;
  if (ageSeconds < 0 || ageSeconds > SESSION_TTL_SECONDS) return false;

  const expected = await hmacHex(secret, issuedAtText);
  return timingSafeEqual(signature, expected);
}

function getCookie(cookieHeader, name) {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
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

function logoutResponse() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/login",
      "Set-Cookie": `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`
    }
  });
}

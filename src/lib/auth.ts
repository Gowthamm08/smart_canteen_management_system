import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export interface AuthUser {
  user_id: number;
  full_name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER" | "STAFF";
}

const SESSION_COOKIE = "smart_canteen_session";

function getSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET is missing or too short.");
  }

  return new TextEncoder().encode(secret);
}

// Create a signed session token
export async function createSession(user: AuthUser) {
  return new SignJWT({
    user_id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

// Set secure HTTP-only session cookie
export async function setSession(user: AuthUser) {
  const token = await createSession(user);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

// Read and verify current session
export async function getSession(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, getSecret());

    if (
      typeof payload.user_id !== "number" ||
      typeof payload.full_name !== "string" ||
      typeof payload.email !== "string" ||
      !["ADMIN", "CUSTOMER", "STAFF"].includes(
        String(payload.role)
      )
    ) {
      return null;
    }

    return {
      user_id: payload.user_id,
      full_name: payload.full_name,
      email: payload.email,
      role: payload.role as AuthUser["role"],
    };
  } catch {
    return null;
  }
}

// Remove session cookie
export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await getSession();

  if (!user) {
    return {
      authorized: false as const,
      user: null,
      response: NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      authorized: false as const,
      user: null,
      response: NextResponse.json(
        { success: false, message: "You do not have permission" },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true as const,
    user,
    response: null,
  };
}

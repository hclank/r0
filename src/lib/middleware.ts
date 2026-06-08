import { NextResponse } from "next/server";
import { verifyToken, TokenPayload } from "./auth";

type AuthResult = {
  user?: TokenPayload;
  errorResponse?: NextResponse;
};

export function requireAuth(
  request: Request,
  requiredRole?: "admin",
): AuthResult {
  const auth_header = request.headers.get("authorization");
  if (!auth_header || !auth_header.startsWith("Bearer ")) {
    return {
      errorResponse: NextResponse.json(
        { error: "Unauthorized: Missing or invalid token" },
        { status: 401 },
      ),
    };
  }

  const token = auth_header.split(" ")[1];
  const decodedPayload = verifyToken(token);

  if (!decodedPayload) {
    return {
      errorResponse: NextResponse.json(
        { error: "Unauthorized: Token is expired or invalid" },
        { status: 401 },
      ),
    };
  }

  if (requiredRole && decodedPayload.role !== requiredRole) {
    return {
      errorResponse: NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      ),
    };
  }

  return { user: decodedPayload };
}

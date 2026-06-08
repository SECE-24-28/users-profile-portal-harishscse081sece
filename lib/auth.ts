// lib/auth.ts
// JWT utility functions for creating and verifying tokens.
// JWT (JSON Web Token) is used to keep users logged in securely.

import jwt from "jsonwebtoken";

// Payload stored inside the token
export interface TokenPayload {
  userId: number;
  email: string;
}

// Helper to safely read the secret at call time (not module load time),
// so it's always available after Next.js loads env variables.
function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set.");
  return secret;
}

// Creates a JWT token that expires in 24 hours
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "24h" });
}

// Verifies a token and returns the payload, or null if invalid/expired
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

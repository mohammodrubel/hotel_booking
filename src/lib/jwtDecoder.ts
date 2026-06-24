import { jwtDecode } from "jwt-decode";

export interface DecodedUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin" | "manager";
  avatar?: string;
  exp: number;
  iat: number;
}

export function decodeUser(token: string): DecodedUser | null {
  try {
    return jwtDecode<DecodedUser>(token);
  } catch {
    return null;
  }
}

export function isTokenValid(token: string | null | undefined): boolean {
  if (!token) return false;
  const decoded = decodeUser(token);
  if (!decoded) return false;
  return decoded.exp * 1000 > Date.now();
}

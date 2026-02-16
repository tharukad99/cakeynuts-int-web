import { http } from "./http";

export async function login(email: string, password: string) {
  const res = await http.post("/api/v1/auth/login", { email, password });
  return res.data as { accessToken: string };
}

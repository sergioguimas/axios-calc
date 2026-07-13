"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) return { error: "Informe usuário e senha." };

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return { error: "Usuário ou senha inválidos." };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { error: "Usuário ou senha inválidos." };

  if (user.status !== "ACTIVE") return { error: "Esta conta está bloqueada. Fale com o administrador." };

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession(user.id);
  redirect("/");
}

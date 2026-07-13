"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hashPassword, requireAdmin, TRIAL_DAYS } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createUserAction(formData: FormData) {
  await requireAdmin();
  const username = text(formData, "username");
  const password = text(formData, "password");
  const role = text(formData, "role") === "ADMIN" ? "ADMIN" : "USER";

  if (username.length < 3) redirect("/admin?error=Informe um usuário com pelo menos 3 caracteres");
  if (password.length < 4) redirect("/admin?error=A senha deve ter pelo menos 4 caracteres");

  const passwordHash = await hashPassword(password);
  const subscriptionEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

  try {
    await prisma.user.create({ data: { username, passwordHash, role, subscriptionEndsAt } });
  } catch {
    redirect("/admin?error=Já existe um usuário com esse nome");
  }
  revalidatePath("/admin");
  redirect("/admin?created=1");
}

export async function toggleUserStatusAction(formData: FormData) {
  const session = await requireAdmin();
  const id = Number(formData.get("id"));
  if (id === session.id) redirect("/admin?error=Você não pode bloquear a própria conta");

  const user = await prisma.user.findUnique({ where: { id }, select: { status: true } });
  if (user) {
    await prisma.user.update({ where: { id }, data: { status: user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE" } });
  }
  revalidatePath("/admin");
}

export async function updateUserSubscriptionAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const raw = text(formData, "subscriptionEndsAt");
  const subscriptionEndsAt = raw ? new Date(`${raw}T23:59:59`) : null;
  await prisma.user.update({ where: { id }, data: { subscriptionEndsAt } });
  revalidatePath("/admin");
}

import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { StudentWorkspace } from "@/lib/repository";
import { getActiveSeason, getStudentWorkspace, getUserById } from "@/lib/repository";

const SESSION_COOKIE = "vote_session";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "vote-local-session-secret";

function signSessionValue(value: string) {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

function createSessionToken(userId: number) {
  const value = String(userId);
  return `${value}.${signSessionValue(value)}`;
}

function parseSessionToken(token: string) {
  const [value, signature] = token.split(".");

  if (!value || !signature) {
    return null;
  }

  const expected = signSessionValue(value);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  const userId = Number(value);

  return Number.isInteger(userId) ? userId : null;
}

export async function getSessionUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const userId = parseSessionToken(token);

  if (!userId) {
    return null;
  }

  return getUserById(userId);
}

export async function setSession(userId: number) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function requireAdminUser() {
  const user = await getSessionUser();

  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  if (user.mustChangePin) {
    redirect("/pin");
  }

  return user;
}

export async function requireStudentUser() {
  const user = await getSessionUser();
  const activeSeason = getActiveSeason();

  if (
    !user ||
    user.role !== "student" ||
    !user.seasonId ||
    !activeSeason ||
    activeSeason.id !== user.seasonId
  ) {
    await clearSession();
    redirect("/login");
  }

  if (user.mustChangePin) {
    redirect("/pin");
  }

  return user;
}

export async function requireStudentWorkspace(): Promise<StudentWorkspace> {
  const user = await requireStudentUser();
  const workspace = getStudentWorkspace(user.id);

  if (!workspace) {
    await clearSession();
    redirect("/login");
  }

  return workspace;
}

export function getUserHomePath(role: "admin" | "student") {
  return role === "admin" ? "/admin/seasons" : "/student/teams";
}

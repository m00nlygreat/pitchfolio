import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

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

const getSessionUserCached = cache(async () => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const userId = parseSessionToken(token);

  if (!userId) {
    return null;
  }

  const user = getUserById(userId);

  if (!user) {
    return null;
  }

  if (user.role === "student") {
    const activeSeason = getActiveSeason();

    if (!user.seasonId || !activeSeason || activeSeason.id !== user.seasonId) {
      return null;
    }
  }

  return user;
});

export async function getSessionUser() {
  return getSessionUserCached();
}

async function shouldUseSecureSessionCookie() {
  const headerStore = await headers();
  const forwardedProto = headerStore.get("x-forwarded-proto");

  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() === "https";
  }

  const origin = headerStore.get("origin");

  if (origin) {
    return origin.startsWith("https://");
  }

  return process.env.NODE_ENV === "production";
}

export async function setSession(userId: number) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: await shouldUseSecureSessionCookie(),
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

const requireAdminUserCached = cache(async () => {
  const user = await getSessionUser();

  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  if (user.mustChangePin) {
    redirect("/pin");
  }

  return user;
});

export async function requireAdminUser() {
  return requireAdminUserCached();
}

const requireStudentUserCached = cache(async () => {
  const user = await getSessionUser();

  if (!user || user.role !== "student") {
    redirect("/login");
  }

  if (user.mustChangePin) {
    redirect("/pin");
  }

  return user;
});

export async function requireStudentUser() {
  return requireStudentUserCached();
}

const requireStudentWorkspaceCached = cache(async (): Promise<StudentWorkspace> => {
  const user = await requireStudentUser();
  const workspace = getStudentWorkspace(user.id);

  if (!workspace) {
    redirect("/login");
  }

  return workspace;
});

export async function requireStudentWorkspace(): Promise<StudentWorkspace> {
  return requireStudentWorkspaceCached();
}

export function getUserHomePath(role: "admin" | "student") {
  return role === "admin" ? "/admin/seasons" : "/student/teams";
}

import { redirect } from "next/navigation";

import { getSessionUser, getUserHomePath } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();

  redirect(user ? getUserHomePath(user.role) : "/login");
}

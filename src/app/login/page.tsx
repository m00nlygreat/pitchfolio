import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { getSessionUser, getUserHomePath } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getSessionUser();

  if (user) {
    redirect(getUserHomePath(user.role));
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="page-intro p-8 sm:p-10">
          <p className="eyebrow">Pitchfolio</p>
          <div className="mt-6 max-w-2xl space-y-6">
            <h1 className="display text-5xl leading-none text-[color:var(--foreground)] sm:text-6xl">
              로그인하고 시작하세요.
            </h1>
          </div>
          <p className="mt-8 text-sm text-[color:var(--muted)]">
            Pitchfolio의 기본 PIN은 0000입니다.
          </p>
        </section>

        <section className="card rounded-[2rem] p-8 sm:p-10">
          <p className="eyebrow">로그인</p>
          <h2 className="display mt-4 text-4xl">입장하기</h2>
          <div className="mt-8">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}

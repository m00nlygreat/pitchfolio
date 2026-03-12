import { redirect } from "next/navigation";

import { PinChangeForm } from "@/components/pin-change-form";
import { getSessionUser, getUserHomePath } from "@/lib/auth";

export default async function PinPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.mustChangePin) {
    redirect(getUserHomePath(user.role));
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="card w-full rounded-[2rem] p-8 sm:p-10">
        <p className="eyebrow">PIN 변경</p>
        <h1 className="display mt-4 text-4xl">처음 로그인했으니 PIN을 바꿔주세요</h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
          {user.name} 계정은 기본 PIN으로 생성되었습니다. 안전하게 사용하려면 다른 숫자 PIN으로 변경해야 합니다.
        </p>
        <div className="mt-8">
          <PinChangeForm />
        </div>
      </section>
    </main>
  );
}

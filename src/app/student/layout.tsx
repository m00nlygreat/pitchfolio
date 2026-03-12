import { logoutAction } from "@/app/actions";
import { NavLink } from "@/components/nav-link";
import { SubmitButton } from "@/components/submit-button";
import { requireStudentUser } from "@/lib/auth";

const studentLinks = [
  { href: "/student/teams", label: "팀" },
  { href: "/student/invest", label: "투자" },
  { href: "/student/results", label: "결과" },
];

export default async function StudentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireStudentUser();

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="card mb-6 rounded-[2rem] p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Pitchfolio</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="display text-4xl">
                {user.seasonName ?? "현재 시즌"}
              </h1>
              {user.teamName ? (
                <span className="panel-soft rounded-full px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]">
                  소속 팀: {user.teamName}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              {user.name}님으로 로그인했습니다. 이번 시즌 수익을 확인해 보세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <form action={logoutAction}>
              <SubmitButton className="btn-primary text-sm">
                로그아웃
              </SubmitButton>
            </form>
          </div>
        </div>
        <nav className="mt-6 flex flex-wrap gap-3">
          {studentLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}

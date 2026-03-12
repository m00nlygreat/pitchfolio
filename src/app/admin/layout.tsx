import { logoutAction } from "@/app/actions";
import { NavLink } from "@/components/nav-link";
import { SubmitButton } from "@/components/submit-button";
import { requireAdminUser } from "@/lib/auth";
import { getActiveSeason } from "@/lib/repository";

const adminLinks = [
  { href: "/admin/seasons", label: "시즌" },
  { href: "/admin/setup", label: "설정" },
  { href: "/admin/stage", label: "단계" },
  { href: "/admin/performance", label: "성과" },
  { href: "/admin/winners", label: "우승" },
  { href: "/admin/results", label: "결과" },
];

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdminUser();
  const activeSeason = getActiveSeason();

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="card mb-6 rounded-[2rem] p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">관리자 작업공간</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="display text-4xl">Pitchfolio</h1>
              {activeSeason ? (
                <span className="rounded-full bg-[color:var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)]">
                  현재 시즌: {activeSeason.name}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              {user.name}님으로 로그인했습니다. Pitchfolio 운영을 계속하세요.
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
          {adminLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}

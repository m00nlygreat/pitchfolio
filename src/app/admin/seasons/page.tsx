import { activateSeasonAction } from "@/app/actions";
import { AdminSeasonForm } from "@/components/admin-season-form";
import { SubmitButton } from "@/components/submit-button";
import { formatCurrency } from "@/lib/format";
import { getActiveSeason, getAllSeasons } from "@/lib/repository";

export default function AdminSeasonsPage() {
  const seasons = getAllSeasons();
  const activeSeason = getActiveSeason();

  return (
    <main className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="card rounded-[2rem] p-6">
        <p className="eyebrow">시즌 생성</p>
        <h2 className="display mt-3 text-3xl">다음 시즌 열기</h2>
        <AdminSeasonForm />
      </section>

      <section className="card rounded-[2rem] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">시즌 목록</p>
            <h2 className="display mt-3 text-3xl">현재 시즌 전환</h2>
          </div>
          {activeSeason ? (
            <span className="rounded-full bg-[color:var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)]">
              진행 중: {activeSeason.name}
            </span>
          ) : null}
        </div>
        <div className="mt-6 grid gap-4">
          {seasons.map((season) => (
            <div key={season.id} className="panel-soft rounded-[1.5rem] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="display text-2xl">{season.name}</h3>
                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
                      {season.statusLabel}
                    </span>
                    {season.isActive ? (
                      <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--accent)]">
                        활성
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm text-[color:var(--muted)]">
                    팀 {season.teamCount}개 · 참가자 {season.studentCount}명 · 기본 투자금 {formatCurrency(season.investmentBudget)}
                  </p>
                </div>
                {!season.isActive ? (
                  <form action={activateSeasonAction}>
                    <input type="hidden" name="seasonId" value={season.id} />
                    <SubmitButton className="btn-secondary">
                      활성화
                    </SubmitButton>
                  </form>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

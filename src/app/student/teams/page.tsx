import { requireStudentWorkspace } from "@/lib/auth";

export default async function StudentTeamsPage() {
  const workspace = await requireStudentWorkspace();
  const isResultVisible =
    workspace.season.status === "investment_closed" || workspace.season.status === "results";

  return (
    <main className="space-y-6">
      <section className="page-intro px-1 py-2">
        <p className="eyebrow">현재 시즌</p>
        <h2 className="display mt-3 text-3xl">투자 전 팀을 먼저 살펴보세요</h2>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
          자기 팀에는 투자할 수 없습니다. 나머지 정보는 투자 판단에 필요한 범위에서만 보여줍니다.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workspace.eligibleTeams.map((team) => (
          <div key={team.id} className="card rounded-[1.75rem] p-5">
            <p className="text-sm font-semibold text-[color:var(--accent)]">{team.name}</p>
            <h3 className="display mt-2 text-2xl">{team.projectName}</h3>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{team.description}</p>
              <div className="mt-5 flex items-center justify-between text-sm text-[color:var(--muted)]">
                <span>구성원 {team.studentCount}명</span>
                <span>
                  {isResultVisible
                    ? `전환율 ${(team.conversionRate * 100).toFixed(1)}% · 손익률 ${team.payoutRate > 0 ? "+" : team.payoutRate < 0 ? "-" : ""}${(Math.abs(team.payoutRate) * 100).toFixed(1)}%`
                    : "세부 정보는 이후 공개"}
                </span>
              </div>
            </div>
          ))}
        </div>
    </main>
  );
}

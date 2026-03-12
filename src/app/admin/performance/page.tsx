import { savePerformanceAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { getActiveSeason, getTeamsBySeason } from "@/lib/repository";

export default function AdminPerformancePage() {
  const activeSeason = getActiveSeason();

  if (!activeSeason) {
    return null;
  }

  const teams = getTeamsBySeason(activeSeason.id);

    return (
      <main className="space-y-6">
      <section className="page-intro px-1 py-2">
        <p className="eyebrow">성과 입력</p>
        <h2 className="display mt-3 text-3xl">방문자 수와 대기 신청 수 입력</h2>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
          전환율은 대기 신청 수를 방문자 수로 나누어 자동 계산됩니다.
        </p>
      </section>

      <div className="grid gap-4">
        {teams.map((team) => (
          <form key={team.id} action={savePerformanceAction} className="card rounded-[1.75rem] p-5">
            <input type="hidden" name="seasonId" value={activeSeason.id} />
            <input type="hidden" name="teamId" value={team.id} />
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[color:var(--accent)]">{team.name}</p>
                <h3 className="display text-2xl">{team.projectName}</h3>
                <p className="text-sm text-[color:var(--muted)]">{team.description}</p>
              </div>
              <div className="grid w-full gap-4 md:grid-cols-3 lg:max-w-2xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[color:var(--muted)]" htmlFor={`visitors-${team.id}`}>
                    방문자 수
                  </label>
                  <input
                    id={`visitors-${team.id}`}
                    name="visitors"
                    defaultValue={team.visitors}
                    className="field"
                    inputMode="numeric"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[color:var(--muted)]" htmlFor={`waitlist-${team.id}`}>
                    대기 신청 수
                  </label>
                  <input
                    id={`waitlist-${team.id}`}
                    name="waitlist"
                    defaultValue={team.waitlist}
                    className="field"
                    inputMode="numeric"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[color:var(--muted)]">전환율</p>
                  <div className="field flex h-[54px] items-center justify-between">
                    <span>{(team.conversionRate * 100).toFixed(1)}%</span>
                    <SubmitButton className="btn-secondary px-4 py-2 text-sm">저장</SubmitButton>
                  </div>
                </div>
              </div>
            </div>
          </form>
        ))}
      </div>
    </main>
  );
}

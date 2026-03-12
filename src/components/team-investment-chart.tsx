import { formatCurrency } from "@/lib/format";
import type { TeamSummary } from "@/lib/repository";

type TeamInvestmentChartProps = {
  teams: TeamSummary[];
  title: string;
  description: string;
};

export function TeamInvestmentChart({ teams, title, description }: TeamInvestmentChartProps) {
  const total = teams.reduce((sum, team) => sum + team.totalInvestment, 0);
  const max = teams.reduce((current, team) => Math.max(current, team.totalInvestment), 0);

  return (
    <section className="card panel-highlight rounded-[2rem] p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">실시간 투자 현황</p>
          <h2 className="display mt-3 text-3xl">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{description}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[color:var(--muted)]">전체 누적 투자금</p>
          <p className="display mt-2 text-3xl">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {teams.map((team) => {
          const width = max > 0 ? Math.max((team.totalInvestment / max) * 100, 4) : 4;
          const share = total > 0 ? (team.totalInvestment / total) * 100 : 0;

          return (
            <div key={team.id} className="panel-soft rounded-[1.5rem] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--accent)]">{team.name}</p>
                  <p className="mt-1 text-base font-semibold text-[color:var(--foreground)]">
                    {team.projectName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[color:var(--muted)]">점유율 {share.toFixed(1)}%</p>
                  <p className="text-lg font-semibold text-[color:var(--foreground)]">
                    {formatCurrency(team.totalInvestment)}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#8cc0ff_0%,#3d84ff_100%)]"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

import { updateStageAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { TeamInvestmentChart } from "@/components/team-investment-chart";
import { STAGE_LABELS, type SeasonStage } from "@/lib/constants";
import { getActiveSeason, getTeamsBySeason } from "@/lib/repository";

const stages: SeasonStage[] = ["setup", "investment_open", "investment_closed", "results"];

export default function AdminStagePage() {
  const activeSeason = getActiveSeason();

  if (!activeSeason) {
    return null;
  }

  const teams = getTeamsBySeason(activeSeason.id);

  return (
    <main className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="card rounded-[2rem] p-6">
          <p className="eyebrow">시즌 상태</p>
          <h2 className="display mt-3 text-3xl">현재 진행 상태</h2>
          <div className="panel-soft mt-8 rounded-[1.5rem] p-5">
            <p className="text-sm text-[color:var(--muted)]">현재 단계</p>
            <p className="display mt-2 text-4xl">{STAGE_LABELS[activeSeason.status]}</p>
          </div>
        </section>

        <section className="grid gap-4">
          {stages.map((stage) => (
            <div key={stage} className="card rounded-[1.75rem] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--accent)]">{STAGE_LABELS[stage]}</p>
                </div>
                <form action={updateStageAction}>
                  <input type="hidden" name="seasonId" value={activeSeason.id} />
                  <input type="hidden" name="stage" value={stage} />
                  <SubmitButton className={activeSeason.status === stage ? "btn-primary" : "btn-secondary"}>
                    {activeSeason.status === stage ? "현재 단계" : `${STAGE_LABELS[stage]}로 변경`}
                  </SubmitButton>
                </form>
              </div>
            </div>
          ))}
        </section>
      </div>

      <TeamInvestmentChart
        teams={teams}
        title="실시간 팀별 자금 유입"
        description="팀별 누적 투자금입니다."
      />
    </main>
  );
}

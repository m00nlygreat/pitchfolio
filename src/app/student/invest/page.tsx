import Link from "next/link";

import { InvestmentForm } from "@/components/investment-form";
import { TeamInvestmentChart } from "@/components/team-investment-chart";
import { formatCurrency } from "@/lib/format";
import { requireStudentWorkspace } from "@/lib/auth";
import { getTeamsBySeason } from "@/lib/repository";

export default async function StudentInvestPage() {
  const workspace = await requireStudentWorkspace();
  const allTeams = getTeamsBySeason(workspace.season.id);

  if (workspace.season.status !== "investment_open") {
    return (
      <section className="card rounded-[2rem] p-6">
        <p className="eyebrow">투자 마감</p>
        <h2 className="display mt-3 text-3xl">지금은 투자 제출이 열려 있지 않습니다</h2>
        <p className="mt-3 text-sm text-[color:var(--muted)]">
          관리자가 투자 단계를 열 때까지 기다려 주세요. 그동안 팀 정보는 확인할 수 있습니다.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/student/teams" className="btn-secondary">
            팀 보기
          </Link>
        </div>
      </section>
    );
  }

  return (
    <main className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["총 투자 한도", formatCurrency(workspace.season.investmentBudget)],
          ["현재 매수 금액", formatCurrency(workspace.totalInvested)],
          ["추가 매수 가능", formatCurrency(workspace.remainingBudget)],
        ].map(([label, value]) => (
          <div key={label} className="card rounded-[1.75rem] p-5">
            <p className="text-sm text-[color:var(--muted)]">{label}</p>
            <p className="display mt-3 text-4xl">{value}</p>
          </div>
        ))}
      </section>

      <section className="page-intro px-1 py-2">
        <p className="eyebrow">개별 투자 주문</p>
        <h2 className="display mt-3 text-3xl">프로젝트를 선택해 투자하세요</h2>
      </section>

      <TeamInvestmentChart
        teams={allTeams}
        title="지금 많이 담기는 프로젝트"
        description="팀별 누적 투자금입니다."
      />

      <InvestmentForm
        teams={workspace.eligibleTeams}
        currentInvestments={workspace.currentInvestmentDetails}
        totalInvested={workspace.totalInvested}
        remainingBudget={workspace.remainingBudget}
      />
    </main>
  );
}

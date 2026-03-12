import {
  formatCurrency,
  formatPercent,
  formatSignedPercent,
  getProfitTone,
} from "@/lib/format";
import { requireStudentWorkspace } from "@/lib/auth";

export default async function StudentResultsPage() {
  const workspace = await requireStudentWorkspace();
  const totalProfitRate =
    workspace.totalInvested > 0 ? workspace.totalDividend / workspace.totalInvested : 0;
  const isResultVisible =
    workspace.season.status === "investment_closed" || workspace.season.status === "results";

  if (!isResultVisible) {
    return (
      <section className="card rounded-[2rem] p-6">
        <p className="eyebrow">결과 비공개</p>
        <h2 className="display mt-3 text-3xl">투자 마감 후 결과를 확인할 수 있습니다</h2>
      </section>
    );
  }

  return (
    <main className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["자본금", formatCurrency(workspace.totalInvested)],
          ["손익률", formatSignedPercent(totalProfitRate)],
          ["수익금", formatCurrency(workspace.finalTotal)],
        ].map(([label, value]) => (
          <div key={label} className="metric-card rounded-[1.75rem] p-5">
            <p className="text-sm text-[color:var(--muted)]">{label}</p>
            <p
              className={`display mt-3 text-4xl ${
                label === "손익률"
                  ? getProfitTone(totalProfitRate)
                  : label === "수익금"
                    ? getProfitTone(workspace.totalDividend)
                    : ""
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </section>

      <section className="card panel-highlight rounded-[2rem] p-6">
        <p className="eyebrow">결과 상세</p>
        <h2 className="display mt-3 text-3xl">투자한 팀별 결과를 확인하세요</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[color:var(--muted)]">
              <tr>
                <th className="pb-3 pr-6">팀</th>
                <th className="pb-3 pr-6">자본금</th>
                <th className="pb-3 pr-6">전환율</th>
                <th className="pb-3 pr-6">손익률</th>
                <th className="pb-3">수익금</th>
              </tr>
            </thead>
            <tbody>
              {workspace.resultRows.map((row) => (
                <tr key={row.teamId} className="border-t border-[color:var(--line)]">
                  <td className="py-4 pr-6">
                    <div>
                      <p className="font-semibold">{row.teamName}</p>
                      <p className="text-[color:var(--muted)]">{row.projectName}</p>
                    </div>
                  </td>
                  <td className="py-4 pr-6">{formatCurrency(row.amount)}</td>
                  <td className="py-4 pr-6">{formatPercent(row.conversionRate)}</td>
                  <td className={`py-4 pr-6 font-semibold ${getProfitTone(row.payoutRate)}`}>
                    {formatSignedPercent(row.payoutRate)}
                  </td>
                  <td className={`py-4 font-semibold ${getProfitTone(row.dividendAmount)}`}>
                    {formatCurrency(row.finalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

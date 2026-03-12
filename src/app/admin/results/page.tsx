import {
  formatCurrency,
  formatPercent,
  formatSignedPercent,
  getProfitTone,
} from "@/lib/format";
import { getActiveSeason, getAdminResults } from "@/lib/repository";

export default function AdminResultsPage() {
  const activeSeason = getActiveSeason();

  if (!activeSeason) {
    return null;
  }

  const { teams, students } = getAdminResults(activeSeason.id);

  return (
    <main className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["팀 수", String(teams.length)],
          ["참가자 수", String(students.length)],
          [
            "평균 전환율",
            teams.length > 0
              ? formatPercent(
                  teams.reduce((sum, team) => sum + team.conversionRate, 0) / teams.length,
                )
              : formatPercent(0),
          ],
        ].map(([label, value]) => (
          <div key={label} className="metric-card rounded-[1.75rem] p-5">
            <p className="text-sm text-[color:var(--muted)]">{label}</p>
            <p className="display mt-3 text-4xl">{value}</p>
          </div>
        ))}
      </section>

      <section className="card panel-highlight rounded-[2rem] p-6">
        <p className="eyebrow">팀 현황</p>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[color:var(--muted)]">
              <tr>
                <th className="pb-3 pr-6">팀</th>
                <th className="pb-3 pr-6">자본금</th>
                <th className="pb-3 pr-6">방문자 수</th>
                <th className="pb-3 pr-6">대기 신청 수</th>
                <th className="pb-3">전환율</th>
                <th className="pb-3 pl-6">손익률</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} className="border-t border-[color:var(--line)]">
                  <td className="py-4 pr-6">
                    <div>
                      <p className="font-semibold">{team.name}</p>
                      <p className="text-[color:var(--muted)]">{team.projectName}</p>
                    </div>
                  </td>
                  <td className="py-4 pr-6">{formatCurrency(team.totalInvestment)}</td>
                  <td className="py-4 pr-6">{team.visitors.toLocaleString("ko-KR")}</td>
                  <td className="py-4 pr-6">{team.waitlist.toLocaleString("ko-KR")}</td>
                  <td className="py-4">{formatPercent(team.conversionRate)}</td>
                  <td className={`py-4 pl-6 font-semibold ${getProfitTone(team.payoutRate)}`}>
                    {formatSignedPercent(team.payoutRate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card rounded-[2rem] p-6">
        <p className="eyebrow">참가자 합계</p>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[color:var(--muted)]">
              <tr>
                <th className="pb-3 pr-6">이름</th>
                <th className="pb-3 pr-6">소속 팀</th>
                <th className="pb-3 pr-6">자본금</th>
                <th className="pb-3 pr-6">손익률</th>
                <th className="pb-3">수익금</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.studentId} className="border-t border-[color:var(--line)]">
                  <td className="py-4 pr-6 font-semibold">{student.studentName}</td>
                  <td className="py-4 pr-6">{student.teamName}</td>
                  <td className="py-4 pr-6">{formatCurrency(student.investedAmount)}</td>
                  <td className={`py-4 pr-6 font-semibold ${getProfitTone(student.dividendAmount)}`}>
                    {formatSignedPercent(
                      student.investedAmount > 0 ? student.dividendAmount / student.investedAmount : 0,
                    )}
                  </td>
                  <td className={`py-4 font-semibold ${getProfitTone(student.dividendAmount)}`}>
                    {formatCurrency(student.finalAmount)}
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

import {
  formatCurrency,
  formatPercent,
  formatSignedPercent,
  getProfitTone,
} from "@/lib/format";
import { getActiveSeason, getAdminWinners } from "@/lib/repository";

export default function AdminWinnersPage() {
  const activeSeason = getActiveSeason();

  if (!activeSeason) {
    return null;
  }

  const winners = getAdminWinners(activeSeason.id);

  return (
    <main className="space-y-6">
      <section className="page-intro px-1 py-2">
        <p className="eyebrow">우승</p>
        <h2 className="display mt-3 text-4xl">이번 시즌 하이라이트</h2>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <WinnerCard
          tone="gold"
          eyebrow="투자 우승팀"
          title={winners.investmentTeam?.teamName ?? "-"}
          subtitle={winners.investmentTeam?.projectName ?? "기록 없음"}
          value={
            winners.investmentTeam
              ? formatCurrency(winners.investmentTeam.value)
              : "-"
          }
          note="가장 많은 자금을 모은 팀"
          stats={
            winners.investmentTeam
              ? [
                  ["투자 획득 건수", `${winners.investmentTeam.orderCount}건`],
                  [
                    "평균 투자금액",
                    formatCurrency(
                      winners.investmentTeam.averageInvestmentAmount,
                    ),
                  ],
                  [
                    "방문자",
                    winners.investmentTeam.visitors.toLocaleString("ko-KR"),
                  ],
                  [
                    "대기신청",
                    winners.investmentTeam.waitlist.toLocaleString("ko-KR"),
                  ],
                ]
              : []
          }
        />
        <WinnerCard
          tone="blue"
          eyebrow="성과 우승팀"
          title={winners.performanceTeam?.teamName ?? "-"}
          subtitle={winners.performanceTeam?.projectName ?? "기록 없음"}
          value={
            winners.performanceTeam
              ? `${formatPercent(winners.performanceTeam.conversionRate)} / ${formatSignedPercent(winners.performanceTeam.payoutRate)}`
              : "-"
          }
          note="가장 높은 손익률을 만든 팀"
          valueClassName={
            winners.performanceTeam
              ? getProfitTone(winners.performanceTeam.payoutRate)
              : undefined
          }
          stats={
            winners.performanceTeam
              ? [
                  ["투자 획득 건수", `${winners.performanceTeam.orderCount}건`],
                  [
                    "평균 투자금액",
                    formatCurrency(
                      winners.performanceTeam.averageInvestmentAmount,
                    ),
                  ],
                  ["손익률", formatSignedPercent(winners.performanceTeam.payoutRate)],
                  [
                    "방문자",
                    winners.performanceTeam.visitors.toLocaleString("ko-KR"),
                  ],
                  [
                    "대기신청",
                    winners.performanceTeam.waitlist.toLocaleString("ko-KR"),
                  ],
                ]
              : []
          }
        />
        <WinnerCard
          tone="green"
          eyebrow="수익 우승 멤버"
          title={winners.investmentMember?.studentName ?? "-"}
          subtitle={
            winners.investmentMember
              ? `${winners.investmentMember.teamName} 소속`
              : "기록 없음"
          }
          value={
            winners.investmentMember
              ? formatCurrency(winners.investmentMember.value)
              : "-"
          }
          note="가장 큰 수익을 거둔 참가자"
          stats={
            winners.investmentMember
              ? [
                  ["투자 횟수", `${winners.investmentMember.orderCount}건`],
                  [
                    "평균 투자금액",
                    formatCurrency(
                      winners.investmentMember.averageInvestmentAmount,
                    ),
                  ],
                  [
                    "손익률",
                    formatSignedPercent(
                      winners.investmentMember.value > 0
                        ? winners.investmentMember.dividendAmount / winners.investmentMember.value
                        : 0,
                    ),
                  ],
                  [
                    "수익금",
                    formatCurrency(winners.investmentMember.finalAmount),
                  ],
                ]
              : []
          }
        />
      </section>
    </main>
  );
}

type WinnerCardProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  value: string;
  note: string;
  tone: "gold" | "blue" | "green";
  stats: Array<[string, string]>;
  valueClassName?: string;
};

function WinnerCard({
  eyebrow,
  title,
  subtitle,
  value,
  note,
  tone,
  stats,
  valueClassName,
}: WinnerCardProps) {
  const toneClassName =
    tone === "gold"
      ? "from-[#4d3400]/95 via-[#8d6420]/55 to-[#18110a]/95 border-[#d7a94a]/35"
      : tone === "blue"
        ? "from-[#10284f]/95 via-[#214d91]/45 to-[#0a1326]/95 border-[#5e9fff]/30"
        : "from-[#0f3024]/95 via-[#1d6f56]/38 to-[#081a15]/95 border-[#59d99c]/28";

  return (
    <section
      className={`rounded-[2rem] border bg-gradient-to-br p-6 shadow-[0_30px_70px_rgba(0,0,0,0.35)] ${toneClassName}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3 className="display mt-4 text-3xl">{title}</h3>
          <p className="mt-2 text-sm text-[color:var(--muted)]">{subtitle}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          Winner
        </span>
      </div>

      <div className="mt-10 rounded-[1.5rem] border border-white/8 bg-black/15 p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-white/55">
          Highlight
        </p>
        <p className={`display mt-3 text-4xl ${valueClassName ?? ""}`}>
          {value}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="rounded-[1.25rem] border border-white/8 bg-black/12 p-4"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-white/48">
              {label}
            </p>
            <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
              {value}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-5 text-sm text-white/68">{note}</p>
    </section>
  );
}

import { WinnersBoard } from "@/components/winners-board";
import { requireStudentUser } from "@/lib/auth";
import { getActiveSeason, getSeasonWinners } from "@/lib/repository";

export default async function StudentWinnersPage() {
  await requireStudentUser();
  const activeSeason = getActiveSeason();

  if (!activeSeason) {
    return null;
  }

  const winners = getSeasonWinners(activeSeason.id);

  return (
    <main className="space-y-6">
      <section className="page-intro px-1 py-2">
        <p className="eyebrow">우승</p>
        <h2 className="display mt-3 text-4xl">이번 시즌 하이라이트</h2>
      </section>

      <WinnersBoard seasonStatus={activeSeason.status} winners={winners} />
    </main>
  );
}

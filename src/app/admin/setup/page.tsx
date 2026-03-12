import { AdminStudentInlineForm } from "@/components/admin-student-inline-form";
import { AdminTeamForm } from "@/components/admin-team-form";
import {
  getActiveSeason,
  getStudentsBySeason,
  getTeamsBySeason,
} from "@/lib/repository";

export default function AdminSetupPage() {
  const activeSeason = getActiveSeason();

  if (!activeSeason) {
    return (
      <section className="card rounded-[2rem] p-6">
        <h2 className="display text-3xl">먼저 시즌을 생성하세요</h2>
      </section>
    );
  }

  const teams = getTeamsBySeason(activeSeason.id);
  const students = getStudentsBySeason(activeSeason.id);
  const studentsByTeam = new Map<number, typeof students>();

  students.forEach((student) => {
    const current = studentsByTeam.get(student.teamId) ?? [];
    current.push(student);
    studentsByTeam.set(student.teamId, current);
  });

  return (
    <main className="space-y-6">
      <section className="page-intro px-1 py-2">
        <p className="eyebrow">참가자 관리</p>
        <h2 className="display mt-3 text-3xl">
          팀 아래에서 참가자를 추가하세요
        </h2>
      </section>

      <section className="card rounded-[2rem] p-6">
        <p className="eyebrow">팀</p>
        <h2 className="display mt-3 text-3xl">시즌 구성 만들기</h2>
        <AdminTeamForm />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teams.map((team) => (
          <div key={team.id} className="card rounded-[1.75rem] p-5">
            <p className="text-sm font-semibold text-[color:var(--accent)]">
              {team.name}
            </p>
            <h3 className="display mt-2 text-2xl">{team.projectName}</h3>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              {team.description}
            </p>
            <p className="mt-4 text-sm text-[color:var(--muted)]">
              참가자 {team.studentCount}명 생성
            </p>

            <AdminStudentInlineForm teamId={team.id} />

            <div className="mt-4 space-y-2">
              {(studentsByTeam.get(team.id) ?? []).map((student) => (
                <div
                  key={student.id}
                  className="panel-soft flex items-center justify-between rounded-[1rem] px-3 py-2"
                >
                  <span className="text-sm font-medium text-[color:var(--foreground)]">
                    {student.name}
                  </span>
                  <span className="text-xs text-[color:var(--muted)]">
                    PIN {student.pin}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { saveInvestmentOrderAction, type FormState } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { formatCurrency } from "@/lib/format";
import type { TeamSummary } from "@/lib/repository";

type InvestmentFormProps = {
  teams: TeamSummary[];
  currentInvestments: Array<{
    orderId: number;
    teamId: number;
    teamName: string;
    projectName: string;
    amount: number;
    createdAt: string;
  }>;
  totalInvested: number;
  remainingBudget: number;
};

const initialState: FormState = {};

export function InvestmentForm({
  teams,
  currentInvestments,
  totalInvested,
  remainingBudget,
}: InvestmentFormProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVersion, setModalVersion] = useState(0);

  return (
    <div className="space-y-6">
      <section className="card rounded-[2rem] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">내 투자 목록</p>
            <h3 className="display mt-3 text-3xl">내가 투자한 프로젝트</h3>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setModalVersion((current) => current + 1);
              setIsModalOpen(true);
            }}
          >
            새 투자
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          {currentInvestments.length === 0 ? (
            <div className="panel-soft rounded-[1.5rem] p-5 text-sm text-[color:var(--muted)]">
              아직 투자한 프로젝트가 없습니다. `새 투자`를 눌러 첫 주문을 추가하세요.
            </div>
          ) : (
            currentInvestments.map((investment) => (
              <div
                key={investment.orderId}
                className="panel-soft flex flex-col gap-3 rounded-[1.5rem] p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-[color:var(--accent)]">{investment.teamName}</p>
                  <h4 className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">
                    {investment.projectName}
                  </h4>
                  <p className="mt-2 text-xs text-[color:var(--muted)]">주문 #{investment.orderId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[color:var(--muted)]">이 주문 금액</p>
                  <p className="display text-2xl">{formatCurrency(investment.amount)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="card flex flex-col gap-3 rounded-[1.5rem] p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-[color:var(--accent)]">투자 현황</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[color:var(--muted)]">현재 저장 합계</p>
          <p className="display text-3xl">{formatCurrency(totalInvested)}</p>
          <p className="mt-1 text-xs text-[color:var(--muted)]">남은 금액 {formatCurrency(remainingBudget)}</p>
        </div>
      </div>

      {isModalOpen ? (
        <InvestmentModal
          key={modalVersion}
          teams={teams}
          totalInvested={totalInvested}
          remainingBudget={remainingBudget}
          onClose={() => setIsModalOpen(false)}
        />
      ) : null}
    </div>
  );
}

type InvestmentModalProps = {
  teams: TeamSummary[];
  totalInvested: number;
  remainingBudget: number;
  onClose: () => void;
};

function InvestmentModal({ teams, totalInvested, remainingBudget, onClose }: InvestmentModalProps) {
  const router = useRouter();
  const [selectedTeamId, setSelectedTeamId] = useState(String(teams[0]?.id ?? ""));
  const [amount, setAmount] = useState("");
  const [state, formAction] = useActionState(saveInvestmentOrderAction, initialState);

  const selectedTeam = useMemo(
    () => teams.find((team) => String(team.id) === selectedTeamId) ?? null,
    [selectedTeamId, teams],
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  if (state.success) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="card w-full max-w-2xl rounded-[2rem] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">새 투자</p>
            <h3 className="display mt-3 text-3xl">프로젝트와 금액을 선택하세요</h3>
          </div>
          <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={onClose}>
            닫기
          </button>
        </div>

        <form action={formAction} className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--muted)]" htmlFor="teamId">
                프로젝트 선택
              </label>
              <select
                id="teamId"
                name="teamId"
                className="field"
                value={selectedTeamId}
                onChange={(event) => {
                  const nextTeamId = event.target.value;
                  setSelectedTeamId(nextTeamId);
                  setAmount("");
                }}
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} - {team.projectName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--muted)]" htmlFor="amount">
                투자 금액
              </label>
              <input
                id="amount"
                name="amount"
                className="field text-right"
                inputMode="numeric"
                value={amount}
                onChange={(event) => setAmount(event.target.value.replace(/[^0-9]/g, ""))}
                placeholder="예: 30000000"
              />
            </div>
          </div>

          {selectedTeam ? (
            <div className="panel-soft rounded-[1.5rem] p-4">
              <p className="text-sm font-semibold text-[color:var(--accent)]">선택한 프로젝트</p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                {selectedTeam.projectName}
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{selectedTeam.description}</p>
              <p className="mt-3 text-xs text-[color:var(--muted)]">
                내 누적 투자금: {formatCurrency(selectedTeam.myInvestmentTotal)}
              </p>
            </div>
          ) : null}

          {state.error ? (
            <p className="rounded-2xl bg-[color:var(--danger-soft)] px-4 py-3 text-sm text-[color:var(--danger)]">
              {state.error}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-[color:var(--muted)]">
              현재 누적 투자금 {formatCurrency(totalInvested)} / 남은 금액 {formatCurrency(remainingBudget)}
            </div>
            <SubmitButton>투자 완료</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}

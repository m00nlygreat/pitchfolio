"use client";

import { useActionState } from "react";

import { createSeasonAction, type FormState } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { DEFAULT_SEASON_INVESTMENT_BUDGET } from "@/lib/constants";

const initialState: FormState = {};

export function AdminSeasonForm() {
  const [state, formAction] = useActionState(createSeasonAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[color:var(--muted)]" htmlFor="season-name">
          시즌 이름
        </label>
        <input id="season-name" name="name" className="field" placeholder="2026 가을" />
      </div>
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-[color:var(--muted)]"
          htmlFor="season-investment-budget"
        >
          기본 투자금
        </label>
        <input
          id="season-investment-budget"
          name="investmentBudget"
          className="field"
          inputMode="numeric"
          defaultValue={DEFAULT_SEASON_INVESTMENT_BUDGET}
        />
      </div>
      {state.error ? (
        <p className="rounded-2xl bg-[color:var(--danger-soft)] px-4 py-3 text-sm text-[color:var(--danger)]">
          {state.error}
        </p>
      ) : null}
      <SubmitButton>시즌 생성</SubmitButton>
    </form>
  );
}

"use client";

import { useActionState } from "react";

import { createStudentAction, type FormState } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

type AdminStudentInlineFormProps = {
  teamId: number;
};

export function AdminStudentInlineForm({ teamId }: AdminStudentInlineFormProps) {
  const [state, formAction] = useActionState(createStudentAction, initialState);

  return (
    <form action={formAction} className="mt-5 space-y-3 border-t border-[color:var(--line)] pt-5">
      <input type="hidden" name="teamId" value={teamId} />
      <div className="space-y-2">
        <label className="text-sm font-medium text-[color:var(--muted)]" htmlFor={`student-${teamId}`}>
          참가자 이름
        </label>
        <input id={`student-${teamId}`} name="name" className="field" placeholder="예: Mina" />
      </div>
      {state.error ? (
        <p className="rounded-2xl bg-[color:var(--danger-soft)] px-4 py-3 text-sm text-[color:var(--danger)]">
          {state.error}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3 text-xs text-[color:var(--muted)]">
        <span>초기 PIN 0000</span>
        <SubmitButton className="btn-secondary px-4 py-2 text-sm">참가자 추가</SubmitButton>
      </div>
    </form>
  );
}

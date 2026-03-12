"use client";

import { useActionState } from "react";

import { createTeamAction, type FormState } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

export function AdminTeamForm() {
  const [state, formAction] = useActionState(createTeamAction, initialState);

  return (
    <form action={formAction} className="mt-6 grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[color:var(--muted)]" htmlFor="team-name">
          팀 이름
        </label>
        <input id="team-name" name="name" className="field" placeholder="Northstar" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-[color:var(--muted)]" htmlFor="project-name">
          프로젝트 이름
        </label>
        <input id="project-name" name="projectName" className="field" placeholder="Northstar Notes" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium text-[color:var(--muted)]" htmlFor="description">
          한 줄 설명
        </label>
        <textarea
          id="description"
          name="description"
          className="field min-h-28"
          placeholder="이 팀이 무엇을 만들고 있나요?"
        />
      </div>
      {state.error ? (
        <p className="rounded-2xl bg-[color:var(--danger-soft)] px-4 py-3 text-sm text-[color:var(--danger)] md:col-span-2">
          {state.error}
        </p>
      ) : null}
      <SubmitButton>팀 생성</SubmitButton>
    </form>
  );
}

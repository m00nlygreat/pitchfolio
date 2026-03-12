"use client";

import { useActionState } from "react";

import { loginAction, type FormState } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[color:var(--muted)]" htmlFor="name">
          이름
        </label>
        <input id="name" name="name" className="field" placeholder="예: Mina" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-[color:var(--muted)]" htmlFor="pin">
          PIN
        </label>
        <input
          id="pin"
          name="pin"
          className="field"
          inputMode="numeric"
          placeholder="예: 1111"
          type="password"
        />
      </div>
      {state.error ? (
        <p className="rounded-2xl bg-[color:var(--danger-soft)] px-4 py-3 text-sm text-[color:var(--danger)]">
          {state.error}
        </p>
      ) : null}
      <SubmitButton className="btn-primary w-full">입장하기</SubmitButton>
    </form>
  );
}

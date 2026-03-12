"use client";

import { useActionState } from "react";

import { changePinAction, type FormState } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

export function PinChangeForm() {
  const [state, formAction] = useActionState(changePinAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="rounded-2xl bg-[color:var(--accent-soft)] px-4 py-3 text-sm text-[color:var(--foreground)]">
        현재 계정은 기본 PIN `0000`을 사용 중입니다. 계속하려면 새로운 PIN으로 변경해야 합니다.
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-[color:var(--muted)]" htmlFor="pin">
          새 PIN
        </label>
        <input id="pin" name="pin" className="field" inputMode="numeric" type="password" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-[color:var(--muted)]" htmlFor="confirmPin">
          새 PIN 확인
        </label>
        <input
          id="confirmPin"
          name="confirmPin"
          className="field"
          inputMode="numeric"
          type="password"
        />
      </div>
      {state.error ? (
        <p className="rounded-2xl bg-[color:var(--danger-soft)] px-4 py-3 text-sm text-[color:var(--danger)]">
          {state.error}
        </p>
      ) : null}
      <SubmitButton className="btn-primary w-full">PIN 변경하고 계속하기</SubmitButton>
    </form>
  );
}

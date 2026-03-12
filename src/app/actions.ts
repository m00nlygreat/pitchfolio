"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  clearSession,
  getSessionUser,
  getUserHomePath,
  requireAdminUser,
  requireStudentWorkspace,
  setSession,
} from "@/lib/auth";
import {
  STAGES,
  type SeasonStage,
} from "@/lib/constants";
import {
  activateSeason,
  authenticateUser,
  createSeason,
  createStudent,
  createTeam,
  getActiveSeason,
  saveInvestmentOrder,
  savePerformance,
  updateUserPin,
  updateSeasonStage,
} from "@/lib/repository";

export type FormState = {
  error?: string;
  success?: string;
  notice?: string;
};

const loginSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력하세요."),
  pin: z.string().trim().min(4, "4자리 이상의 PIN을 입력하세요."),
});

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    name: formData.get("name"),
    pin: formData.get("pin"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "로그인 입력값이 올바르지 않습니다." };
  }

  const user = authenticateUser(parsed.data.name, parsed.data.pin);

  if (!user) {
    return { error: "현재 활성 시즌에서 일치하는 계정을 찾을 수 없습니다." };
  }

  await setSession(user.id);
  if (user.mustChangePin) {
    redirect("/pin");
  }
  redirect(getUserHomePath(user.role));
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function createSeasonAction(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdminUser();

  const parsed = z
    .object({
      name: z.string().trim().min(1, "시즌 이름을 입력하세요."),
      investmentBudget: z.coerce.number().int().min(1, "기본 투자금은 1원 이상의 정수여야 합니다."),
    })
    .safeParse({
      name: formData.get("name"),
      investmentBudget: formData.get("investmentBudget"),
    });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "시즌 정보를 확인하세요." };
  }

  createSeason(parsed.data.name, parsed.data.investmentBudget);

  revalidatePath("/admin/seasons");
  redirect("/admin/seasons");
}

export async function activateSeasonAction(formData: FormData) {
  await requireAdminUser();
  const seasonId = z.coerce.number().int().positive().parse(formData.get("seasonId"));

  activateSeason(seasonId);

  revalidatePath("/admin");
  revalidatePath("/student");
  redirect("/admin/setup");
}

export async function createTeamAction(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdminUser();
  const activeSeason = getActiveSeason();

  if (!activeSeason) {
    redirect("/admin/seasons");
  }

  const schema = z.object({
    name: z.string().trim().min(1, "팀 이름을 입력하세요."),
    projectName: z.string().trim().min(1, "프로젝트 이름을 입력하세요."),
    description: z.string().trim().min(1, "한 줄 설명을 입력하세요."),
  });
  const parsed = schema.safeParse({
    name: formData.get("name"),
    projectName: formData.get("projectName"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "팀 정보를 다시 확인하세요." };
  }

  createTeam({ seasonId: activeSeason.id, ...parsed.data });

  revalidatePath("/admin/setup");
  revalidatePath("/student/teams");
  redirect("/admin/setup");
}

export async function createStudentAction(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdminUser();
  const activeSeason = getActiveSeason();

  if (!activeSeason) {
    redirect("/admin/seasons");
  }

  const schema = z.object({
    teamId: z.coerce.number().int().positive("팀 정보가 올바르지 않습니다."),
    name: z.string().trim().min(1, "참가자 이름을 입력하세요."),
  });
  const parsed = schema.safeParse({
    teamId: formData.get("teamId"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "참가자 정보를 다시 확인하세요." };
  }

  createStudent({ seasonId: activeSeason.id, ...parsed.data });

  revalidatePath("/admin/setup");
  redirect("/admin/setup");
}

export async function changePinAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const schema = z
    .object({
      pin: z
        .string()
        .trim()
        .regex(/^\d{4,12}$/, "PIN은 숫자 4~12자리여야 합니다."),
      confirmPin: z.string().trim(),
    })
    .refine((data) => data.pin === data.confirmPin, {
      message: "새 PIN과 확인 PIN이 일치해야 합니다.",
      path: ["confirmPin"],
    })
    .refine((data) => data.pin !== "0000", {
      message: "기본 PIN 0000은 사용할 수 없습니다.",
      path: ["pin"],
    });

  const parsed = schema.safeParse({
    pin: formData.get("pin"),
    confirmPin: formData.get("confirmPin"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "PIN을 다시 확인하세요." };
  }

  updateUserPin(user.id, parsed.data.pin);
  await setSession(user.id);
  redirect(getUserHomePath(user.role));
}

export async function updateStageAction(formData: FormData) {
  await requireAdminUser();

  const seasonId = z.coerce.number().int().positive().parse(formData.get("seasonId"));
  const nextStage = z.enum(STAGES).parse(formData.get("stage")) as SeasonStage;
  updateSeasonStage(seasonId, nextStage);

  revalidatePath("/admin/stage");
  revalidatePath("/student/invest");
  revalidatePath("/student/results");
  redirect("/admin/stage");
}

export async function savePerformanceAction(formData: FormData) {
  await requireAdminUser();

  const schema = z.object({
    seasonId: z.coerce.number().int().positive(),
    teamId: z.coerce.number().int().positive(),
    visitors: z.coerce.number().int().min(0),
    waitlist: z.coerce.number().int().min(0),
  });
  const parsed = schema.parse({
    seasonId: formData.get("seasonId"),
    teamId: formData.get("teamId"),
    visitors: formData.get("visitors"),
    waitlist: formData.get("waitlist"),
  });

  savePerformance(parsed);

  revalidatePath("/admin/performance");
  revalidatePath("/admin/results");
  revalidatePath("/student/results");
  redirect("/admin/performance");
}

export async function saveInvestmentOrderAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const workspace = await requireStudentWorkspace();

  if (workspace.season.status !== "investment_open") {
    return { error: "이 시즌은 현재 투자 제출이 열려 있지 않습니다." };
  }

  const teamId = z.coerce.number().int().positive().safeParse(formData.get("teamId"));
  const amount = z.coerce.number().int().positive().safeParse(formData.get("amount"));

  if (!teamId.success) {
    return { error: "프로젝트 정보가 올바르지 않습니다." };
  }

  if (!amount.success) {
    return { error: "투자 금액은 1원 이상의 정수여야 합니다." };
  }

  const allowedTeamIds = new Set(workspace.eligibleTeams.map((team) => team.id));

  if (!allowedTeamIds.has(teamId.data)) {
    return { error: "자기 팀을 제외한 팀에만 투자할 수 있습니다." };
  }

  const projectedTotal = workspace.totalInvested + amount.data;
  const investmentBudget = workspace.season.investmentBudget;

  if (projectedTotal > investmentBudget) {
    return {
      error: `이 주문을 저장하면 총 투자금이 ${investmentBudget.toLocaleString("ko-KR")}원을 초과합니다.`,
    };
  }

  saveInvestmentOrder({
    seasonId: workspace.season.id,
    studentId: workspace.student.id,
    teamId: teamId.data,
    amount: amount.data,
  });

  revalidatePath("/student/invest");
  revalidatePath("/student/results");
  revalidatePath("/admin/results");

  const remainingBudget = investmentBudget - projectedTotal;

  return {
    success:
      remainingBudget === 0
        ? "투자 주문 1건이 저장되었습니다. 전체 투자금이 정확히 맞춰졌습니다."
        : `투자 주문 1건이 저장되었습니다. 아직 ${remainingBudget.toLocaleString("ko-KR")}원이 남아 있습니다.`,
  };
}

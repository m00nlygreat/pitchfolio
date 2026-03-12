import "server-only";

import { db } from "@/lib/db";
import {
  DEFAULT_SEASON_INVESTMENT_BUDGET,
  MAX_PAYOUT_RATE,
  PERFORMANCE_RATE_SMOOTHING_VISITORS,
  STAGE_LABELS,
  type SeasonStage,
} from "@/lib/constants";

export type Role = "admin" | "student";

export type SessionUser = {
  id: number;
  name: string;
  role: Role;
  mustChangePin: boolean;
  seasonId: number | null;
  seasonName: string | null;
  teamId: number | null;
  teamName: string | null;
};

export type SeasonSummary = {
  id: number;
  name: string;
  investmentBudget: number;
  status: SeasonStage;
  statusLabel: string;
  isActive: boolean;
  createdAt: string;
  teamCount: number;
  studentCount: number;
};

export type TeamSummary = {
  id: number;
  name: string;
  projectName: string;
  description: string;
  studentCount: number;
  totalInvestment: number;
  myInvestmentTotal: number;
  visitors: number;
  waitlist: number;
  conversionRate: number;
  payoutRate: number;
};

export type StudentSummary = {
  id: number;
  name: string;
  pin: string;
  teamId: number;
  teamName: string;
};

export type InvestmentRow = {
  teamId: number;
  teamName: string;
  projectName: string;
  amount: number;
  visitors: number;
  waitlist: number;
  conversionRate: number;
  payoutRate: number;
  dividendAmount: number;
  finalAmount: number;
};

export type StudentWorkspace = {
  student: SessionUser;
  season: SeasonSummary;
  averageConversionRate: number;
  ownTeamId: number;
  eligibleTeams: TeamSummary[];
  currentInvestments: Array<{ orderId: number; teamId: number; amount: number }>;
  currentInvestmentDetails: Array<{
    orderId: number;
    teamId: number;
    teamName: string;
    projectName: string;
    amount: number;
    createdAt: string;
  }>;
  totalInvested: number;
  remainingBudget: number;
  resultRows: InvestmentRow[];
  totalDividend: number;
  finalTotal: number;
};

type SessionRow = {
  id: number;
  name: string;
  role: Role;
  mustChangePin: number;
  seasonId: number | null;
  seasonName: string | null;
  teamId: number | null;
  teamName: string | null;
};

type SeasonRow = {
  id: number;
  name: string;
  investmentBudget: number;
  status: SeasonStage;
  isActive: number;
  createdAt: string;
  teamCount: number;
  studentCount: number;
};

type TeamRow = {
  id: number;
  name: string;
  projectName: string;
  description: string;
  studentCount: number;
  totalInvestment: number | null;
  visitors: number | null;
  waitlist: number | null;
};

type StudentRow = {
  id: number;
  name: string;
  pin: string;
  teamId: number;
  teamName: string;
};

type InvestmentQueryRow = {
  teamId: number;
  teamName: string;
  projectName: string;
  amount: number;
  visitors: number | null;
  waitlist: number | null;
};

type CurrentInvestmentDetailRow = {
  orderId: number;
  teamId: number;
  teamName: string;
  projectName: string;
  amount: number;
  createdAt: string;
};

type AggregatedInvestmentRow = {
  teamId: number;
  amount: number;
};

type StudentResultSummary = {
  studentId: number;
  studentName: string;
  teamName: string;
  investedAmount: number;
  dividendAmount: number;
  finalAmount: number;
};

export type AdminWinnerSummary = {
  investmentTeam: {
    teamId: number;
    teamName: string;
    projectName: string;
    value: number;
    orderCount: number;
    averageInvestmentAmount: number;
    visitors: number;
    waitlist: number;
  } | null;
  performanceTeam: {
    teamId: number;
    teamName: string;
    projectName: string;
    conversionRate: number;
    payoutRate: number;
    totalInvestment: number;
    orderCount: number;
    averageInvestmentAmount: number;
    visitors: number;
    waitlist: number;
  } | null;
  investmentMember: {
    studentId: number;
    studentName: string;
    teamName: string;
    value: number;
    orderCount: number;
    averageInvestmentAmount: number;
    dividendAmount: number;
    finalAmount: number;
  } | null;
};

type OrderStatRow = {
  entityId: number;
  orderCount: number;
  averageInvestmentAmount: number;
};

type SeasonTeamPayoutRow = {
  teamId: number;
  teamName: string;
  projectName: string;
  visitors: number;
  waitlist: number;
  conversionRate: number;
  payoutRate: number;
};

export function seasonExists(seasonId: number) {
  const row = db.prepare("SELECT id FROM seasons WHERE id = ? LIMIT 1").get(seasonId) as
    | { id: number }
    | undefined;

  return Boolean(row);
}

export function teamBelongsToSeason(teamId: number, seasonId: number) {
  const row = db
    .prepare("SELECT id FROM teams WHERE id = ? AND season_id = ? LIMIT 1")
    .get(teamId, seasonId) as { id: number } | undefined;

  return Boolean(row);
}

function mapSeason(row: SeasonRow): SeasonSummary {
  return {
    id: row.id,
    name: row.name,
    investmentBudget: row.investmentBudget,
    status: row.status,
    statusLabel: STAGE_LABELS[row.status],
    isActive: row.isActive === 1,
    createdAt: row.createdAt,
    teamCount: row.teamCount,
    studentCount: row.studentCount,
  };
}

function mapTeam(row: TeamRow): TeamSummary {
  const visitors = row.visitors ?? 0;
  const waitlist = row.waitlist ?? 0;
  const conversionRate = visitors > 0 ? waitlist / visitors : 0;

  return {
    id: row.id,
    name: row.name,
    projectName: row.projectName,
    description: row.description,
    studentCount: row.studentCount,
    totalInvestment: row.totalInvestment ?? 0,
    myInvestmentTotal: 0,
    visitors,
    waitlist,
    conversionRate,
    payoutRate: 0,
  };
}

function getAdjustedConversionRate(
  visitors: number,
  waitlist: number,
  seasonAverageConversionRate: number,
) {
  return (waitlist + PERFORMANCE_RATE_SMOOTHING_VISITORS * seasonAverageConversionRate) /
    (visitors + PERFORMANCE_RATE_SMOOTHING_VISITORS);
}

function applyPayoutScale<T extends { visitors: number; waitlist: number; conversionRate: number }>(
  rows: T[],
) {
  const averageConversionRate =
    rows.length > 0
      ? rows.reduce((sum, row) => sum + row.conversionRate, 0) / rows.length
      : 0;

  const adjustedConversionRates = rows.map((row) =>
    getAdjustedConversionRate(row.visitors, row.waitlist, averageConversionRate),
  );
  const averageAdjustedConversionRate =
    adjustedConversionRates.length > 0
      ? adjustedConversionRates.reduce((sum, rate) => sum + rate, 0) / adjustedConversionRates.length
      : 0;
  const rawDeltas = adjustedConversionRates.map((rate) => rate - averageAdjustedConversionRate);
  const worstDelta = rawDeltas.reduce((min, value) => Math.min(min, value), 0);
  const bestDelta = rawDeltas.reduce((max, value) => Math.max(max, value), 0);
  const negativeScale = worstDelta < 0 ? Math.abs(worstDelta) : 0;
  const positiveScale = bestDelta > 0 ? bestDelta : 0;

  return {
    averageConversionRate,
    rows: rows.map((row, index) => ({
      ...row,
      payoutRate:
        rawDeltas[index] < 0
          ? negativeScale > 0
            ? rawDeltas[index] / negativeScale
            : 0
          : rawDeltas[index] > 0
            ? positiveScale > 0
              ? (rawDeltas[index] / positiveScale) * MAX_PAYOUT_RATE
              : 0
            : 0,
    })),
  };
}

function mapSessionUser(row: SessionRow): SessionUser {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    mustChangePin: row.mustChangePin === 1,
    seasonId: row.seasonId,
    seasonName: row.seasonName,
    teamId: row.teamId,
    teamName: row.teamName,
  };
}

export function getAllSeasons() {
  const rows = db
    .prepare(
      `
        SELECT
          s.id,
          s.name,
          s.investment_budget AS investmentBudget,
          s.status,
          s.is_active AS isActive,
          s.created_at AS createdAt,
          COUNT(DISTINCT t.id) AS teamCount,
          COUNT(DISTINCT u.id) AS studentCount
        FROM seasons s
        LEFT JOIN teams t ON t.season_id = s.id
        LEFT JOIN users u ON u.season_id = s.id AND u.role = 'student'
        GROUP BY s.id
        ORDER BY s.is_active DESC, s.id DESC
      `,
    )
    .all() as SeasonRow[];

  return rows.map(mapSeason);
}

export function getActiveSeason() {
  const row = db
    .prepare(
      `
        SELECT
          s.id,
          s.name,
          s.investment_budget AS investmentBudget,
          s.status,
          s.is_active AS isActive,
          s.created_at AS createdAt,
          COUNT(DISTINCT t.id) AS teamCount,
          COUNT(DISTINCT u.id) AS studentCount
        FROM seasons s
        LEFT JOIN teams t ON t.season_id = s.id
        LEFT JOIN users u ON u.season_id = s.id AND u.role = 'student'
        WHERE s.is_active = 1
        GROUP BY s.id
        LIMIT 1
      `,
    )
    .get() as SeasonRow | undefined;

  return row ? mapSeason(row) : null;
}

export function createSeason(name: string, investmentBudget = DEFAULT_SEASON_INVESTMENT_BUDGET) {
  const seasonCount = getAllSeasons().length;
  db.prepare(
    "INSERT INTO seasons (name, investment_budget, status, is_active) VALUES (?, ?, 'setup', ?)",
  ).run(name, investmentBudget, seasonCount === 0 ? 1 : 0);
}

export function activateSeason(seasonId: number) {
  if (!seasonExists(seasonId)) {
    throw new Error("시즌을 찾을 수 없습니다.");
  }

  const transaction = db.transaction(() => {
    db.prepare("UPDATE seasons SET is_active = 0").run();
    db.prepare("UPDATE seasons SET is_active = 1 WHERE id = ?").run(seasonId);
  });

  transaction();
}

export function updateSeasonStage(seasonId: number, stage: SeasonStage) {
  if (!seasonExists(seasonId)) {
    throw new Error("시즌을 찾을 수 없습니다.");
  }

  db.prepare("UPDATE seasons SET status = ? WHERE id = ?").run(stage, seasonId);
}

export function createTeam(input: {
  seasonId: number;
  name: string;
  projectName: string;
  description: string;
}) {
  const result = db
    .prepare(
      "INSERT INTO teams (season_id, name, project_name, description) VALUES (?, ?, ?, ?)",
    )
    .run(input.seasonId, input.name, input.projectName, input.description);

  const teamId = Number(result.lastInsertRowid);
  db.prepare(
    "INSERT INTO performance_metrics (season_id, team_id, visitors, waitlist) VALUES (?, ?, 0, 0)",
  ).run(input.seasonId, teamId);
}

export function createStudent(input: {
  seasonId: number;
  teamId: number;
  name: string;
}) {
  if (!teamBelongsToSeason(input.teamId, input.seasonId)) {
    throw new Error("선택한 팀이 현재 시즌에 속하지 않습니다.");
  }

  db.prepare(
    "INSERT INTO users (season_id, team_id, role, name, pin) VALUES (?, ?, 'student', ?, ?)",
  ).run(input.seasonId, input.teamId, input.name, "0000");
}

export function updateUserPin(userId: number, pin: string) {
  db.prepare("UPDATE users SET pin = ? WHERE id = ?").run(pin, userId);
}

export function authenticateUser(name: string, pin: string) {
  const row = db
    .prepare(
      `
        SELECT
          u.id,
          u.name,
          u.role,
          CASE WHEN u.pin = '0000' THEN 1 ELSE 0 END AS mustChangePin,
          u.season_id AS seasonId,
          s.name AS seasonName,
          u.team_id AS teamId,
          t.name AS teamName
        FROM users u
        LEFT JOIN seasons s ON s.id = u.season_id
        LEFT JOIN teams t ON t.id = u.team_id
        WHERE LOWER(u.name) = LOWER(?)
          AND u.pin = ?
          AND (u.role = 'admin' OR s.is_active = 1)
        ORDER BY CASE WHEN u.role = 'admin' THEN 0 ELSE 1 END
        LIMIT 1
      `,
    )
    .get(name.trim(), pin.trim()) as SessionRow | undefined;

  return row ? mapSessionUser(row) : null;
}

export function getUserById(userId: number) {
  const row = db
    .prepare(
      `
        SELECT
          u.id,
          u.name,
          u.role,
          CASE WHEN u.pin = '0000' THEN 1 ELSE 0 END AS mustChangePin,
          u.season_id AS seasonId,
          s.name AS seasonName,
          u.team_id AS teamId,
          t.name AS teamName
        FROM users u
        LEFT JOIN seasons s ON s.id = u.season_id
        LEFT JOIN teams t ON t.id = u.team_id
        WHERE u.id = ?
        LIMIT 1
      `,
    )
    .get(userId) as SessionRow | undefined;

  return row ? mapSessionUser(row) : null;
}

function getSeasonTeamPayoutRows(seasonId: number): SeasonTeamPayoutRow[] {
  const rows = db
    .prepare(
      `
        SELECT
          t.id,
          t.name,
          t.project_name AS projectName,
          t.description,
          (
            SELECT COUNT(*)
            FROM users u
            WHERE u.team_id = t.id AND u.role = 'student'
          ) AS studentCount,
          (
            SELECT COALESCE(SUM(i.amount), 0)
            FROM investment_orders i
            WHERE i.season_id = t.season_id
              AND i.team_id = t.id
              AND i.amount > 0
          ) AS totalInvestment,
          pm.visitors,
          pm.waitlist
        FROM teams t
        LEFT JOIN performance_metrics pm ON pm.team_id = t.id AND pm.season_id = t.season_id
        WHERE t.season_id = ?
        ORDER BY t.name ASC
      `,
    )
    .all(seasonId) as TeamRow[];

  return applyPayoutScale(rows.map(mapTeam)).rows.map((row) => ({
    teamId: row.id,
    teamName: row.name,
    projectName: row.projectName,
    visitors: row.visitors,
    waitlist: row.waitlist,
    conversionRate: row.conversionRate,
    payoutRate: row.payoutRate,
  }));
}

export function getTeamsBySeason(seasonId: number) {
  const payoutRows = new Map(getSeasonTeamPayoutRows(seasonId).map((row) => [row.teamId, row]));
  const rows = db
    .prepare(
      `
        SELECT
          t.id,
          t.name,
          t.project_name AS projectName,
          t.description,
          (
            SELECT COUNT(*)
            FROM users u
            WHERE u.team_id = t.id AND u.role = 'student'
          ) AS studentCount,
          (
            SELECT COALESCE(SUM(i.amount), 0)
            FROM investment_orders i
            WHERE i.season_id = t.season_id
              AND i.team_id = t.id
              AND i.amount > 0
          ) AS totalInvestment,
          pm.visitors,
          pm.waitlist
        FROM teams t
        LEFT JOIN performance_metrics pm ON pm.team_id = t.id AND pm.season_id = t.season_id
        WHERE t.season_id = ?
        ORDER BY t.name ASC
      `,
    )
    .all(seasonId) as TeamRow[];

  return rows.map((row) => {
    const team = mapTeam(row);
    return {
      ...team,
      payoutRate: payoutRows.get(team.id)?.payoutRate ?? 0,
    };
  });
}

export function getAverageConversionRate(seasonId: number) {
  const teams = getTeamsBySeason(seasonId);
  return teams.length > 0
    ? teams.reduce((sum, team) => sum + team.conversionRate, 0) / teams.length
    : 0;
}

export function getStudentsBySeason(seasonId: number) {
  const rows = db
    .prepare(
      `
        SELECT
          u.id,
          u.name,
          u.pin,
          u.team_id AS teamId,
          t.name AS teamName
        FROM users u
        INNER JOIN teams t ON t.id = u.team_id
        WHERE u.season_id = ? AND u.role = 'student'
        ORDER BY t.name ASC, u.name ASC
      `,
    )
    .all(seasonId) as StudentRow[];

  return rows;
}

export function getCurrentInvestments(studentId: number, seasonId: number) {
  return db
    .prepare(
      `
        SELECT io.id AS orderId, io.team_id AS teamId, io.amount
        FROM investment_orders io
        WHERE io.amount > 0
          AND io.student_id = ?
          AND io.season_id = ?
        ORDER BY io.id DESC
      `,
    )
    .all(studentId, seasonId) as Array<{ orderId: number; teamId: number; amount: number }>;
}

export function getAggregatedInvestmentsByTeam(studentId: number, seasonId: number) {
  return db
    .prepare(
      `
        SELECT io.team_id AS teamId, COALESCE(SUM(io.amount), 0) AS amount
        FROM investment_orders io
        WHERE io.student_id = ?
          AND io.season_id = ?
          AND io.amount > 0
        GROUP BY io.team_id
      `,
    )
    .all(studentId, seasonId) as AggregatedInvestmentRow[];
}

export function getCurrentInvestmentDetails(studentId: number, seasonId: number) {
  return db
    .prepare(
      `
        SELECT
          io.id AS orderId,
          io.team_id AS teamId,
          t.name AS teamName,
          t.project_name AS projectName,
          io.amount,
          io.created_at AS createdAt
        FROM investment_orders io
        INNER JOIN teams t ON t.id = io.team_id
        WHERE io.amount > 0
          AND io.student_id = ?
          AND io.season_id = ?
        ORDER BY io.id DESC
      `,
    )
    .all(studentId, seasonId) as CurrentInvestmentDetailRow[];
}

export function saveInvestmentOrder(input: {
  seasonId: number;
  studentId: number;
  teamId: number;
  amount: number;
}) {
  if (!teamBelongsToSeason(input.teamId, input.seasonId)) {
    throw new Error("투자 대상 팀이 현재 시즌에 속하지 않습니다.");
  }

  db.prepare(
    `
      INSERT INTO investment_orders (season_id, student_id, team_id, amount)
      VALUES (?, ?, ?, ?)
    `,
  ).run(input.seasonId, input.studentId, input.teamId, input.amount);
}

export function savePerformance(input: {
  seasonId: number;
  teamId: number;
  visitors: number;
  waitlist: number;
}) {
  if (!teamBelongsToSeason(input.teamId, input.seasonId)) {
    throw new Error("선택한 팀이 현재 시즌에 속하지 않습니다.");
  }

  db.prepare(
    `
      INSERT INTO performance_metrics (season_id, team_id, visitors, waitlist)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(season_id, team_id)
      DO UPDATE SET visitors = excluded.visitors, waitlist = excluded.waitlist
    `,
  ).run(input.seasonId, input.teamId, input.visitors, input.waitlist);
}

export function getStudentWorkspace(studentId: number): StudentWorkspace | null {
  const student = getUserById(studentId);

  if (!student || student.role !== "student" || !student.seasonId || !student.teamId) {
    return null;
  }

  const season = getActiveSeason();

  if (!season || season.id !== student.seasonId) {
    return null;
  }

  const eligibleTeams = getTeamsBySeason(student.seasonId).filter(
    (team) => team.id !== student.teamId,
  );
  const averageConversionRate = getAverageConversionRate(student.seasonId);
  const currentInvestments = getCurrentInvestments(student.id, student.seasonId);
  const currentInvestmentDetails = getCurrentInvestmentDetails(student.id, student.seasonId);
  const aggregatedInvestments = getAggregatedInvestmentsByTeam(student.id, student.seasonId);
  const currentMap = new Map(aggregatedInvestments.map((entry) => [entry.teamId, entry.amount]));
  const totalInvested = currentInvestments.reduce((sum, entry) => sum + entry.amount, 0);
  const resultRows = getStudentResultRows(student.id, student.seasonId);
  const totalDividend = resultRows.reduce((sum, row) => sum + row.dividendAmount, 0);
  const finalTotal = resultRows.reduce((sum, row) => sum + row.finalAmount, 0);

  return {
    student,
    season,
    averageConversionRate,
    ownTeamId: student.teamId,
    eligibleTeams: eligibleTeams.map((team) => ({
      ...team,
      myInvestmentTotal: currentMap.get(team.id) ?? 0,
    })),
    currentInvestments,
    currentInvestmentDetails,
    totalInvested,
    remainingBudget: season.investmentBudget - totalInvested,
    resultRows,
    totalDividend,
    finalTotal,
  };
}

export function getStudentResultRows(studentId: number, seasonId: number) {
  const payoutByTeamId = new Map(getSeasonTeamPayoutRows(seasonId).map((row) => [row.teamId, row]));
  const rows = db
    .prepare(
      `
        SELECT
          t.id AS teamId,
          t.name AS teamName,
          t.project_name AS projectName,
          COALESCE(SUM(io.amount), 0) AS amount,
          pm.visitors,
          pm.waitlist
        FROM investment_orders io
        INNER JOIN teams t ON t.id = io.team_id
        LEFT JOIN performance_metrics pm ON pm.team_id = io.team_id AND pm.season_id = io.season_id
        WHERE io.amount > 0
          AND io.student_id = ?
          AND io.season_id = ?
        GROUP BY t.id
        ORDER BY t.name ASC
      `,
    )
    .all(studentId, seasonId) as InvestmentQueryRow[];

  return rows.map((row) => {
    const teamPayout = payoutByTeamId.get(row.teamId);
    const visitors = teamPayout?.visitors ?? row.visitors ?? 0;
    const waitlist = teamPayout?.waitlist ?? row.waitlist ?? 0;
    const conversionRate = teamPayout?.conversionRate ?? (visitors > 0 ? waitlist / visitors : 0);
    const payoutRate = teamPayout?.payoutRate ?? 0;
    const dividendAmount = Math.round(row.amount * payoutRate);
    const finalAmount = row.amount + dividendAmount;

    return {
      teamId: row.teamId,
      teamName: row.teamName,
      projectName: row.projectName,
      amount: row.amount,
      visitors,
      waitlist,
      conversionRate,
      payoutRate,
      dividendAmount,
      finalAmount,
    } satisfies InvestmentRow;
  });
}

export function getAdminResults(seasonId: number) {
  const teams = getTeamsBySeason(seasonId);
  const resultRows = getStudentsBySeason(seasonId).map((student) => {
    const detailRows = getStudentResultRows(student.id, seasonId);
    const investedAmount = detailRows.reduce((sum, row) => sum + row.amount, 0);
    const dividendAmount = detailRows.reduce((sum, row) => sum + row.dividendAmount, 0);
    const finalAmount = detailRows.reduce((sum, row) => sum + row.finalAmount, 0);

    return {
      studentId: student.id,
      studentName: student.name,
      teamName: student.teamName,
      investedAmount,
      dividendAmount,
      finalAmount,
    } satisfies StudentResultSummary;
  });

  return {
    teams,
    students: resultRows,
  };
}

export function getAdminWinners(seasonId: number): AdminWinnerSummary {
  const { teams, students } = getAdminResults(seasonId);
  const teamOrderStats = new Map(
    (
      db
        .prepare(
          `
            SELECT
              team_id AS entityId,
              COUNT(*) AS orderCount,
              AVG(amount) AS averageInvestmentAmount
            FROM investment_orders
            WHERE season_id = ? AND amount > 0
            GROUP BY team_id
          `,
        )
        .all(seasonId) as OrderStatRow[]
    ).map((row) => [row.entityId, row]),
  );
  const studentOrderStats = new Map(
    (
      db
        .prepare(
          `
            SELECT
              student_id AS entityId,
              COUNT(*) AS orderCount,
              AVG(amount) AS averageInvestmentAmount
            FROM investment_orders
            WHERE season_id = ? AND amount > 0
            GROUP BY student_id
          `,
        )
        .all(seasonId) as OrderStatRow[]
    ).map((row) => [row.entityId, row]),
  );

  const investmentTeam =
    teams.length > 0
      ? teams.reduce((best, team) =>
          team.totalInvestment > best.totalInvestment ? team : best,
        )
      : null;

  const performanceTeam =
    teams.length > 0
      ? teams.reduce((best, team) =>
          team.payoutRate > best.payoutRate ? team : best,
        )
      : null;

  const investmentMember =
    students.length > 0
      ? students.reduce((best, student) =>
          student.finalAmount > best.finalAmount ? student : best,
        )
      : null;

  return {
    investmentTeam: investmentTeam
      ? {
          teamId: investmentTeam.id,
          teamName: investmentTeam.name,
          projectName: investmentTeam.projectName,
          value: investmentTeam.totalInvestment,
          orderCount: teamOrderStats.get(investmentTeam.id)?.orderCount ?? 0,
          averageInvestmentAmount:
            teamOrderStats.get(investmentTeam.id)?.averageInvestmentAmount ?? 0,
          visitors: investmentTeam.visitors,
          waitlist: investmentTeam.waitlist,
        }
      : null,
    performanceTeam: performanceTeam
      ? {
          teamId: performanceTeam.id,
          teamName: performanceTeam.name,
          projectName: performanceTeam.projectName,
          conversionRate: performanceTeam.conversionRate,
          payoutRate: performanceTeam.payoutRate,
          totalInvestment: performanceTeam.totalInvestment,
          orderCount: teamOrderStats.get(performanceTeam.id)?.orderCount ?? 0,
          averageInvestmentAmount:
            teamOrderStats.get(performanceTeam.id)?.averageInvestmentAmount ?? 0,
          visitors: performanceTeam.visitors,
          waitlist: performanceTeam.waitlist,
        }
      : null,
    investmentMember: investmentMember
      ? {
          studentId: investmentMember.studentId,
          studentName: investmentMember.studentName,
          teamName: investmentMember.teamName,
          value: investmentMember.finalAmount,
          orderCount: studentOrderStats.get(investmentMember.studentId)?.orderCount ?? 0,
          averageInvestmentAmount:
            studentOrderStats.get(investmentMember.studentId)?.averageInvestmentAmount ?? 0,
          dividendAmount: investmentMember.dividendAmount,
          finalAmount: investmentMember.finalAmount,
        }
      : null,
  };
}

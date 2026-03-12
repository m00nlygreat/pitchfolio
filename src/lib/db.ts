import "server-only";

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

import { DEFAULT_SEASON_INVESTMENT_BUDGET } from "@/lib/constants";

type DatabaseInstance = InstanceType<typeof Database>;

declare global {
  var __voteDb: DatabaseInstance | undefined;
}

function getDbFilePath() {
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  return path.join(dataDir, "vote.sqlite");
}

function initializeSchema(db: DatabaseInstance) {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS seasons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      investment_budget INTEGER NOT NULL DEFAULT 1000000,
      status TEXT NOT NULL DEFAULT 'setup',
      is_active INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      project_name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season_id INTEGER,
      team_id INTEGER,
      role TEXT NOT NULL CHECK(role IN ('admin', 'student')),
      name TEXT NOT NULL,
      pin TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      team_id INTEGER NOT NULL,
      amount INTEGER NOT NULL CHECK(amount >= 0),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (season_id, student_id, team_id),
      FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS investment_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      team_id INTEGER NOT NULL,
      amount INTEGER NOT NULL CHECK(amount >= 0),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS performance_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season_id INTEGER NOT NULL,
      team_id INTEGER NOT NULL,
      visitors INTEGER NOT NULL DEFAULT 0,
      waitlist INTEGER NOT NULL DEFAULT 0,
      UNIQUE (season_id, team_id),
      FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    );
  `);
}

function migrateSeasonInvestmentBudget(db: DatabaseInstance) {
  const columns = db
    .prepare("PRAGMA table_info(seasons)")
    .all() as Array<{ name: string }>;

  if (columns.some((column) => column.name === "investment_budget")) {
    return;
  }

  db.exec(
    `ALTER TABLE seasons ADD COLUMN investment_budget INTEGER NOT NULL DEFAULT ${DEFAULT_SEASON_INVESTMENT_BUDGET}`,
  );
}

function seedInitialData(db: DatabaseInstance) {
  const seasonCount = Number(
    (db.prepare("SELECT COUNT(*) AS count FROM seasons").get() as { count: number })
      .count,
  );
  const adminCount = Number(
    (
      db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'").get() as {
        count: number;
      }
    ).count,
  );

  const seed = db.transaction(() => {
    if (seasonCount === 0) {
      const seasonResult = db
        .prepare(
          "INSERT INTO seasons (name, investment_budget, status, is_active) VALUES (?, ?, ?, 1)",
        )
        .run(
          "Spring 2026",
          DEFAULT_SEASON_INVESTMENT_BUDGET,
          "investment_open",
        );

      const seasonId = Number(seasonResult.lastInsertRowid);

      const teamStatement = db.prepare(
        "INSERT INTO teams (season_id, name, project_name, description) VALUES (?, ?, ?, ?)",
      );

      const teams = [
        {
          name: "Northstar",
          projectName: "Northstar Notes",
          description: "A structured note app for lecture capture.",
        },
        {
          name: "Loom",
          projectName: "Loom Board",
          description: "A simple class planning board for team work.",
        },
        {
          name: "Orchard",
          projectName: "Orchard Waitlist",
          description: "A landing page builder focused on waitlist conversion.",
        },
      ];

      const teamIds = teams.map((team) =>
        Number(
          teamStatement.run(seasonId, team.name, team.projectName, team.description)
            .lastInsertRowid,
        ),
      );

      const performanceStatement = db.prepare(
        "INSERT INTO performance_metrics (season_id, team_id, visitors, waitlist) VALUES (?, ?, ?, ?)",
      );

      teamIds.forEach((teamId, index) => {
        const metrics = [
          { visitors: 410, waitlist: 52 },
          { visitors: 385, waitlist: 49 },
          { visitors: 460, waitlist: 71 },
        ][index];
        performanceStatement.run(seasonId, teamId, metrics.visitors, metrics.waitlist);
      });

      const studentStatement = db.prepare(
        "INSERT INTO users (season_id, team_id, role, name, pin) VALUES (?, ?, 'student', ?, ?)",
      );

      [
        ["Mina", "1111", teamIds[0]],
        ["Jisoo", "2222", teamIds[0]],
        ["Daniel", "3333", teamIds[1]],
        ["Hana", "4444", teamIds[1]],
        ["Theo", "5555", teamIds[2]],
        ["Yuna", "6666", teamIds[2]],
      ].forEach(([name, pin, teamId]) => {
        studentStatement.run(seasonId, teamId, name, pin);
      });
    }

    if (adminCount === 0) {
      db.prepare("INSERT INTO users (role, name, pin) VALUES ('admin', ?, ?)").run(
        "강사",
        "0000",
      );
    }
  });

  seed();
}

function migrateInvestmentsToOrders(db: DatabaseInstance) {
  const orderCount = Number(
    (db.prepare("SELECT COUNT(*) AS count FROM investment_orders").get() as { count: number })
      .count,
  );

  if (orderCount > 0) {
    return;
  }

  db.exec(`
    INSERT INTO investment_orders (season_id, student_id, team_id, amount, created_at)
    SELECT season_id, student_id, team_id, amount, created_at
    FROM investments
  `);
}

function createDatabase() {
  const db = new Database(getDbFilePath());
  db.pragma("journal_mode = WAL");
  initializeSchema(db);
  migrateSeasonInvestmentBudget(db);
  migrateInvestmentsToOrders(db);
  seedInitialData(db);
  return db;
}

export const db = global.__voteDb ?? createDatabase();

if (!global.__voteDb) {
  global.__voteDb = db;
}

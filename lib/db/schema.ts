import {
  pgTable,
  uuid,
  text,
  date,
  numeric,
  timestamp,
  jsonb,
  boolean,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const notifPrefsDefault = {
  cumple: true,
  gasto: true,
  resumen: false,
} as const;

export interface NotifPrefs {
  cumple: boolean;
  gasto: boolean;
  resumen: boolean;
}

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    username: text("username").notNull(),
    // Nullable: las cuentas de antes de este campo no lo tienen todavía. El
    // apodo (username) sigue siendo lo que se muestra en todos lados; el
    // nombre completo solo aparece al entrar al perfil de esa persona.
    fullName: text("full_name"),
    alias: text("alias").notNull(),
    // Nullable: el login viejo (usuario + PIN) queda como puente de
    // migración para cuentas que todavía no pasaron a mail + contraseña.
    pinHash: text("pin_hash"),
    email: text("email"),
    passwordHash: text("password_hash"),
    resetTokenHash: text("reset_token_hash"),
    resetTokenExpiresAt: timestamp("reset_token_expires_at", { withTimezone: true }),
    birthday: date("birthday", { mode: "string" }).notNull(),
    isAdmin: boolean("is_admin").notNull().default(false),
    themePref: text("theme_pref").notNull().default("claro"),
    notifPrefs: jsonb("notif_prefs")
      .notNull()
      .default(sql.raw(`'${JSON.stringify(notifPrefsDefault)}'::jsonb`))
      .$type<NotifPrefs>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("users_username_lower_idx").on(sql`lower(${table.username})`),
    uniqueIndex("users_alias_lower_idx").on(sql`lower(${table.alias})`),
    uniqueIndex("users_email_lower_idx").on(sql`lower(${table.email})`),
  ],
);

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2, mode: "number" }).notNull(),
  payerId: uuid("payer_id")
    .notNull()
    .references(() => users.id),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  expenseDate: date("expense_date", { mode: "string" })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const expenseParticipants = pgTable(
  "expense_participants",
  {
    expenseId: uuid("expense_id")
      .notNull()
      .references(() => expenses.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
  },
  (table) => [
    primaryKey({ columns: [table.expenseId, table.userId] }),
  ],
);

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromUserId: uuid("from_user_id")
    .notNull()
    .references(() => users.id),
  toUserId: uuid("to_user_id")
    .notNull()
    .references(() => users.id),
  amount: numeric("amount", { precision: 12, scale: 2, mode: "number" }).notNull(),
  note: text("note"),
  // Nullable: los pagos ya existentes en producción no tienen quién los
  // cargó. Todo pago nuevo lo completa siempre.
  recordedBy: uuid("recorded_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type", {
    enum: ["birthday", "expense_added", "payment_received", "weekly_summary", "payment_reminder"],
  }).notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  targetType: text("target_type", { enum: ["expense", "user"] }),
  targetId: uuid("target_id"),
  readAt: timestamp("read_at", { withTimezone: true }),
  dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("push_subscriptions_endpoint_idx").on(table.endpoint)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

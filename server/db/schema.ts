import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const citiesTable = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userFavoriteCitiesTable = pgTable("user_favorite_cities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  cityId: integer("city_id")
    .notNull()
    .references(() => citiesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertCity = typeof citiesTable.$inferInsert;
export type SelectCity = typeof citiesTable.$inferSelect;

export type InsertUserFavoriteCity =
  typeof userFavoriteCitiesTable.$inferInsert;
export type SelectUserFavoriteCity =
  typeof userFavoriteCitiesTable.$inferSelect;

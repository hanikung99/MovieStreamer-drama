import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const movies = pgTable("movies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  year: integer("year").notNull(),
  duration: integer("duration").notNull(), // in minutes
  rating: real("rating").notNull(),
  genre: text("genre").notNull(),
  posterUrl: text("poster_url").notNull(),
  backdropUrl: text("backdrop_url"),
  featured: integer("featured").default(0), // 0 = not featured, 1 = featured, 2 = hero
  category: text("category").notNull(), // "movie", "series", "short", "review"
});

export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
});

export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof movies.$inferSelect;

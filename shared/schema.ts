import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
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
  episodes: integer("episodes"), // for series - number of episodes
  director: text("director"),
  cast: text("cast").array(),
  
  // Video-related fields
  videoUrl: text("video_url"), // Main video URL
  videoFormat: text("video_format").default("horizontal"), // "horizontal", "vertical", "square"
  videoQuality: text("video_quality").default("1080p"), // "720p", "1080p", "4k"
  thumbnailUrl: text("thumbnail_url"), // Video thumbnail/preview
  trailerUrl: text("trailer_url"), // Trailer URL
  
  // Mobile optimization
  mobileOptimized: boolean("mobile_optimized").default(false),
  verticalPosterUrl: text("vertical_poster_url"), // 9:16 poster for mobile
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Analytics
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  
  // Additional metadata as JSON
  metadata: jsonb("metadata"), // Flexible field for additional data
});

// User favorites table
export const userFavorites = pgTable("user_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Will be implemented with auth
  movieId: varchar("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Video analytics table
export const videoAnalytics = pgTable("video_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  movieId: varchar("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  userId: varchar("user_id"), // Optional - for anonymous tracking
  sessionId: varchar("session_id"), // For anonymous users
  
  // View data
  viewStarted: timestamp("view_started").defaultNow(),
  viewEnded: timestamp("view_ended"),
  watchDuration: integer("watch_duration").default(0), // seconds watched
  completionRate: real("completion_rate").default(0), // percentage watched
  
  // Device info
  deviceType: text("device_type"), // "mobile", "tablet", "desktop"
  userAgent: text("user_agent"),
  screenSize: text("screen_size"), // "xs", "sm", "md", "lg", "xl"
  
  // Interaction data
  liked: boolean("liked").default(false),
  shared: boolean("shared").default(false),
  fullscreen: boolean("fullscreen").default(false),
});

export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  likeCount: true,
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});

export const insertVideoAnalyticsSchema = createInsertSchema(videoAnalytics).omit({
  id: true,
  viewStarted: true,
});

// Zod schemas for API validation
export const videoFormatSchema = z.enum(["horizontal", "vertical", "square"]);
export const videoQualitySchema = z.enum(["720p", "1080p", "4k"]);
export const deviceTypeSchema = z.enum(["mobile", "tablet", "desktop"]);
export const screenSizeSchema = z.enum(["xs", "sm", "md", "lg", "xl", "2xl"]);

// API request/response schemas
export const getVerticalVideosSchema = z.object({
  limit: z.number().min(1).max(50).default(10),
  offset: z.number().min(0).default(0),
  quality: videoQualitySchema.optional(),
});

export const trackVideoViewSchema = z.object({
  movieId: z.string(),
  sessionId: z.string().optional(),
  deviceType: deviceTypeSchema,
  screenSize: screenSizeSchema,
  userAgent: z.string().optional(),
  watchDuration: z.number().min(0).default(0),
  completionRate: z.number().min(0).max(100).default(0),
  liked: z.boolean().default(false),
  shared: z.boolean().default(false),
  fullscreen: z.boolean().default(false),
});

export const toggleFavoriteSchema = z.object({
  movieId: z.string(),
  userId: z.string(),
});

// Type exports
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof movies.$inferSelect;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type VideoAnalytics = typeof videoAnalytics.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type InsertVideoAnalytics = z.infer<typeof insertVideoAnalyticsSchema>;

// API types
export type GetVerticalVideosRequest = z.infer<typeof getVerticalVideosSchema>;
export type TrackVideoViewRequest = z.infer<typeof trackVideoViewSchema>;
export type ToggleFavoriteRequest = z.infer<typeof toggleFavoriteSchema>;

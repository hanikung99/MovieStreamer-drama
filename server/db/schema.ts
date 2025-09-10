import { pgTable, text, integer, boolean, timestamp, decimal, jsonb, uuid, varchar, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: varchar('display_name', { length: 100 }),
  avatar: text('avatar'),
  isActive: boolean('is_active').default(true),
  isVerified: boolean('is_verified').default(false),
  role: varchar('role', { length: 20 }).default('user'), // user, admin, moderator
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
}, (table) => ({
  usernameIdx: index('username_idx').on(table.username),
  emailIdx: index('email_idx').on(table.email),
}));

// Movies table (enhanced from previous schema)
export const movies = pgTable('movies', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  year: integer('year').notNull(),
  duration: integer('duration').notNull(), // in minutes
  rating: decimal('rating', { precision: 3, scale: 1 }).notNull(),
  genre: varchar('genre', { length: 255 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(), // movie, series, short
  
  // Media URLs
  posterUrl: text('poster_url').notNull(),
  backdropUrl: text('backdrop_url'),
  videoUrl: text('video_url'),
  trailerUrl: text('trailer_url'),
  thumbnailUrl: text('thumbnail_url'),
  verticalPosterUrl: text('vertical_poster_url'),
  
  // Video properties
  videoFormat: varchar('video_format', { length: 20 }).default('horizontal'), // horizontal, vertical, square
  videoQuality: varchar('video_quality', { length: 10 }).default('1080p'), // 720p, 1080p, 4k
  
  // Content metadata
  featured: integer('featured').default(0), // 0: normal, 1: featured, 2: hero
  episodes: integer('episodes'), // for series
  director: varchar('director', { length: 255 }),
  cast: jsonb('cast').$type<string[]>(),
  
  // Mobile optimization
  mobileOptimized: boolean('mobile_optimized').default(false),
  
  // Analytics
  viewCount: integer('view_count').default(0),
  likeCount: integer('like_count').default(0),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  
  // Additional metadata
  metadata: jsonb('metadata'),
}, (table) => ({
  titleIdx: index('title_idx').on(table.title),
  categoryIdx: index('category_idx').on(table.category),
  genreIdx: index('genre_idx').on(table.genre),
  featuredIdx: index('featured_idx').on(table.featured),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
}));

// User favorites
export const userFavorites = pgTable('user_favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  movieId: uuid('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userMovieIdx: index('user_movie_idx').on(table.userId, table.movieId),
  userIdIdx: index('user_id_idx').on(table.userId),
}));

// Video analytics
export const videoAnalytics = pgTable('video_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  movieId: uuid('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  sessionId: varchar('session_id', { length: 255 }),
  
  // View tracking
  viewStarted: timestamp('view_started').defaultNow(),
  viewEnded: timestamp('view_ended'),
  watchDuration: integer('watch_duration'), // in seconds
  completionRate: decimal('completion_rate', { precision: 5, scale: 2 }), // percentage
  
  // Device info
  deviceType: varchar('device_type', { length: 20 }), // mobile, tablet, desktop
  userAgent: text('user_agent'),
  screenSize: varchar('screen_size', { length: 10 }), // xs, sm, md, lg, xl, 2xl
  
  // Interaction tracking
  liked: boolean('liked').default(false),
  shared: boolean('shared').default(false),
  fullscreen: boolean('fullscreen').default(false),
  
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  movieIdIdx: index('movie_id_idx').on(table.movieId),
  userIdIdx: index('analytics_user_id_idx').on(table.userId),
  createdAtIdx: index('analytics_created_at_idx').on(table.createdAt),
}));

// User sessions for JWT management
export const userSessions = pgTable('user_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  refreshToken: text('refresh_token').notNull().unique(),
  deviceInfo: text('device_info'),
  ipAddress: varchar('ip_address', { length: 45 }),
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  lastUsedAt: timestamp('last_used_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('session_user_id_idx').on(table.userId),
  tokenIdx: index('token_idx').on(table.token),
  expiresAtIdx: index('expires_at_idx').on(table.expiresAt),
}));

// User profiles (extended user information)
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  
  // Profile info
  bio: text('bio'),
  dateOfBirth: timestamp('date_of_birth'),
  country: varchar('country', { length: 2 }), // ISO country code
  language: varchar('language', { length: 5 }).default('vi-VN'), // locale
  timezone: varchar('timezone', { length: 50 }),
  
  // Preferences
  preferences: jsonb('preferences').$type<{
    autoplay?: boolean;
    quality?: string;
    subtitles?: boolean;
    notifications?: {
      email?: boolean;
      push?: boolean;
      newMovies?: boolean;
      recommendations?: boolean;
    };
    privacy?: {
      showProfile?: boolean;
      showFavorites?: boolean;
      showWatchHistory?: boolean;
    };
  }>(),
  
  // Statistics
  totalWatchTime: integer('total_watch_time').default(0), // in minutes
  moviesWatched: integer('movies_watched').default(0),
  favoriteGenres: jsonb('favorite_genres').$type<string[]>(),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Watch history
export const watchHistory = pgTable('watch_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  movieId: uuid('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
  
  // Watch progress
  watchedDuration: integer('watched_duration').default(0), // in seconds
  totalDuration: integer('total_duration').notNull(), // in seconds
  progress: decimal('progress', { precision: 5, scale: 2 }).default('0'), // percentage
  completed: boolean('completed').default(false),
  
  // Timestamps
  firstWatchedAt: timestamp('first_watched_at').defaultNow(),
  lastWatchedAt: timestamp('last_watched_at').defaultNow(),
  
  // Device info
  deviceType: varchar('device_type', { length: 20 }),
  quality: varchar('quality', { length: 10 }),
}, (table) => ({
  userMovieIdx: index('watch_history_user_movie_idx').on(table.userId, table.movieId),
  userIdIdx: index('watch_history_user_id_idx').on(table.userId),
  lastWatchedIdx: index('last_watched_idx').on(table.lastWatchedAt),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  favorites: many(userFavorites),
  sessions: many(userSessions),
  analytics: many(videoAnalytics),
  watchHistory: many(watchHistory),
}));

export const moviesRelations = relations(movies, ({ many }) => ({
  favorites: many(userFavorites),
  analytics: many(videoAnalytics),
  watchHistory: many(watchHistory),
}));

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [userFavorites.movieId],
    references: [movies.id],
  }),
}));

export const videoAnalyticsRelations = relations(videoAnalytics, ({ one }) => ({
  movie: one(movies, {
    fields: [videoAnalytics.movieId],
    references: [movies.id],
  }),
  user: one(users, {
    fields: [videoAnalytics.userId],
    references: [users.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const watchHistoryRelations = relations(watchHistory, ({ one }) => ({
  user: one(users, {
    fields: [watchHistory.userId],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [watchHistory.movieId],
    references: [movies.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Movie = typeof movies.$inferSelect;
export type NewMovie = typeof movies.$inferInsert;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type NewUserFavorite = typeof userFavorites.$inferInsert;
export type VideoAnalytics = typeof videoAnalytics.$inferSelect;
export type NewVideoAnalytics = typeof videoAnalytics.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type WatchHistory = typeof watchHistory.$inferSelect;
export type NewWatchHistory = typeof watchHistory.$inferInsert;

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storageEnhanced as storage } from "./storage-enhanced";
import { 
  insertMovieSchema, 
  getVerticalVideosSchema,
  trackVideoViewSchema,
  toggleFavoriteSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Movie routes
  app.get("/api/movies", async (req, res) => {
    try {
      const movies = await storage.getAllMovies();
      res.json(movies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch movies" });
    }
  });

  app.get("/api/movies/featured", async (req, res) => {
    try {
      const movies = await storage.getFeaturedMovies();
      res.json(movies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured movies" });
    }
  });

  app.get("/api/movies/hero", async (req, res) => {
    try {
      const movies = await storage.getHeroMovies();
      res.json(movies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hero movies" });
    }
  });

  app.get("/api/movies/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const movies = await storage.getMoviesByCategory(category);
      res.json(movies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch movies by category" });
    }
  });

  app.get("/api/movies/genre/:genre", async (req, res) => {
    try {
      const { genre } = req.params;
      const movies = await storage.getMoviesByGenre(genre);
      res.json(movies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch movies by genre" });
    }
  });

  app.get("/api/movies/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      const movies = await storage.searchMovies(q);
      res.json(movies);
    } catch (error) {
      res.status(500).json({ message: "Failed to search movies" });
    }
  });

  app.get("/api/movies/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const movie = await storage.getMovieById(id);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json(movie);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch movie" });
    }
  });

  app.post("/api/movies", async (req, res) => {
    try {
      const validatedData = insertMovieSchema.parse(req.body);
      const movie = await storage.createMovie(validatedData);
      res.status(201).json(movie);
    } catch (error) {
      res.status(400).json({ message: "Invalid movie data" });
    }
  });

  // Vertical Videos API
  app.get("/api/videos/vertical", async (req, res) => {
    try {
      const params = getVerticalVideosSchema.parse({
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        quality: req.query.quality as string,
      });
      
      const videos = await storage.getVerticalVideos(params);
      res.json(videos);
    } catch (error) {
      res.status(400).json({ message: "Invalid request parameters" });
    }
  });

  // Video streaming endpoint
  app.get("/api/videos/:id/stream", async (req, res) => {
    try {
      const { id } = req.params;
      const movie = await storage.getMovieById(id);
      
      if (!movie || !movie.videoUrl) {
        return res.status(404).json({ message: "Video not found" });
      }

      // For now, redirect to the video URL
      // In production, this would handle video streaming with proper headers
      res.redirect(movie.videoUrl);
    } catch (error) {
      res.status(500).json({ message: "Failed to stream video" });
    }
  });

  // Video Analytics API
  app.post("/api/videos/:id/analytics", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = trackVideoViewSchema.parse({
        ...req.body,
        movieId: id,
      });
      
      const analytics = await storage.trackVideoView(validatedData);
      res.status(201).json(analytics);
    } catch (error) {
      res.status(400).json({ message: "Invalid analytics data" });
    }
  });

  // Get video analytics
  app.get("/api/videos/:id/analytics", async (req, res) => {
    try {
      const { id } = req.params;
      const analytics = await storage.getVideoAnalytics(id);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch video analytics" });
    }
  });

  // User Favorites API
  app.post("/api/users/:userId/favorites", async (req, res) => {
    try {
      const { userId } = req.params;
      const validatedData = toggleFavoriteSchema.parse({
        ...req.body,
        userId,
      });
      
      const favorite = await storage.toggleFavorite(validatedData);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(400).json({ message: "Invalid favorite data" });
    }
  });

  // Get user favorites
  app.get("/api/users/:userId/favorites", async (req, res) => {
    try {
      const { userId } = req.params;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user favorites" });
    }
  });

  // Delete favorite
  app.delete("/api/users/:userId/favorites/:movieId", async (req, res) => {
    try {
      const { userId, movieId } = req.params;
      await storage.removeFavorite(userId, movieId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Mobile-specific endpoints
  app.get("/api/mobile/movies", async (req, res) => {
    try {
      const movies = await storage.getMobileOptimizedMovies();
      res.json(movies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mobile-optimized movies" });
    }
  });

  // Update movie view count
  app.post("/api/movies/:id/view", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementViewCount(id);
      res.status(200).json({ message: "View count updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update view count" });
    }
  });

  // Update movie like count
  app.post("/api/movies/:id/like", async (req, res) => {
    try {
      const { id } = req.params;
      const { increment } = req.body; // true to increment, false to decrement
      await storage.updateLikeCount(id, increment);
      res.status(200).json({ message: "Like count updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update like count" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

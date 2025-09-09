import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMovieSchema } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}

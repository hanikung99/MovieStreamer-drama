import { 
  type Movie, 
  type InsertMovie, 
  type UserFavorite,
  type VideoAnalytics,
  type InsertUserFavorite,
  type InsertVideoAnalytics,
  type GetVerticalVideosRequest,
  type TrackVideoViewRequest,
  type ToggleFavoriteRequest
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorageEnhanced {
  getUser(id: string): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  
  // Movie methods
  getAllMovies(): Promise<Movie[]>;
  getMovieById(id: string): Promise<Movie | undefined>;
  getFeaturedMovies(): Promise<Movie[]>;
  getHeroMovies(): Promise<Movie[]>;
  getMoviesByCategory(category: string): Promise<Movie[]>;
  getMoviesByGenre(genre: string): Promise<Movie[]>;
  searchMovies(query: string): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  
  // Vertical video methods
  getVerticalVideos(params: GetVerticalVideosRequest): Promise<Movie[]>;
  getMobileOptimizedMovies(): Promise<Movie[]>;
  
  // Analytics methods
  trackVideoView(data: TrackVideoViewRequest): Promise<VideoAnalytics>;
  getVideoAnalytics(movieId: string): Promise<VideoAnalytics[]>;
  incrementViewCount(movieId: string): Promise<void>;
  updateLikeCount(movieId: string, increment: boolean): Promise<void>;
  
  // Favorites methods
  toggleFavorite(data: ToggleFavoriteRequest): Promise<UserFavorite>;
  getUserFavorites(userId: string): Promise<UserFavorite[]>;
  removeFavorite(userId: string, movieId: string): Promise<void>;
}

export class MemStorageEnhanced implements IStorageEnhanced {
  private users: Map<string, any>;
  private movies: Map<string, Movie>;
  private favorites: Map<string, UserFavorite>;
  private analytics: Map<string, VideoAnalytics>;

  constructor() {
    this.users = new Map();
    this.movies = new Map();
    this.favorites = new Map();
    this.analytics = new Map();
    this.initializeMovies();
  }

  private initializeMovies() {
    const sampleMovies: InsertMovie[] = [
      // PHIM LẺ - MOVIES
      {
        title: "The Dark Knight",
        description: "Khi mối đe dọa được gọi là Joker xuất hiện từ quá khứ bí ẩn của anh, tàn phá và tạo ra sự hỗn loạn cho người dân Gotham...",
        year: 2008,
        duration: 152,
        rating: 9.0,
        genre: "Hành động, Tội phạm",
        posterUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 2,
        category: "movie",
        director: "Christopher Nolan",
        cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        videoFormat: "horizontal",
        videoQuality: "1080p",
        thumbnailUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
        mobileOptimized: true
      },
      {
        title: "Blade Runner 2049",
        description: "Một thế giới tương lai đen tối nơi ranh giới giữa con người và máy móc trở nên mờ nhạt...",
        year: 2017,
        duration: 164,
        rating: 8.0,
        genre: "Khoa học viễn tưởng, Thriller",
        posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 1,
        category: "movie",
        director: "Denis Villeneuve",
        cast: ["Ryan Gosling", "Harrison Ford", "Ana de Armas"],
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
        videoFormat: "horizontal",
        videoQuality: "4k",
        mobileOptimized: true
      },
      
      // PHIM BỘ - SERIES
      {
        title: "Breaking Bad",
        description: "Một giáo viên hóa học trung học chuyển sang sản xuất và bán methamphetamine sau khi được chẩn đoán mắc bệnh ung thư phổi...",
        year: 2008,
        duration: 47,
        rating: 9.5,
        genre: "Tội phạm, Drama, Thriller",
        posterUrl: "https://images.unsplash.com/photo-1489599735188-3c9b1f2e8d8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1489599735188-3c9b1f2e8d8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 1,
        category: "series",
        episodes: 62,
        director: "Vince Gilligan",
        cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn"],
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        mobileOptimized: true
      },

      // PHIM NGẮN - SHORTS (Vertical Videos)
      {
        title: "Vertical Story #1",
        description: "Câu chuyện ngắn được tối ưu cho mobile, định dạng dọc như TikTok...",
        year: 2024,
        duration: 3,
        rating: 8.5,
        genre: "Drama, Short",
        posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=711",
        backdropUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=711",
        featured: 0,
        category: "short",
        director: "Mobile Creator",
        cast: ["Unknown Actor"],
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_360x640_1mb.mp4",
        videoFormat: "vertical",
        videoQuality: "1080p",
        thumbnailUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=711",
        verticalPosterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=711",
        mobileOptimized: true
      },
      {
        title: "Mobile Moment #2",
        description: "Khoảnh khắc đặc biệt được quay dọc, phù hợp với trải nghiệm mobile...",
        year: 2024,
        duration: 2,
        rating: 7.8,
        genre: "Comedy, Short",
        posterUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=711",
        backdropUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=711",
        featured: 0,
        category: "short",
        director: "TikTok Creator",
        cast: ["Social Media Star"],
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_360x640_2mb.mp4",
        videoFormat: "vertical",
        videoQuality: "720p",
        thumbnailUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=711",
        verticalPosterUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=711",
        mobileOptimized: true
      },
      {
        title: "Vertical Adventure #3",
        description: "Cuộc phiêu lưu ngắn trong định dạng dọc, tối ưu cho điện thoại...",
        year: 2024,
        duration: 4,
        rating: 8.2,
        genre: "Adventure, Short",
        posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=711",
        backdropUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=711",
        featured: 0,
        category: "short",
        director: "Mobile Filmmaker",
        cast: ["Adventure Seeker"],
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_360x640_1mb.mp4",
        videoFormat: "vertical",
        videoQuality: "1080p",
        thumbnailUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=711",
        verticalPosterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=711",
        mobileOptimized: true
      }
    ];

    sampleMovies.forEach(movieData => {
      this.createMovie(movieData);
    });
  }

  // User methods
  async getUser(id: string): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(user: any): Promise<any> {
    const id = randomUUID();
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Movie methods
  async getAllMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values());
  }

  async getMovieById(id: string): Promise<Movie | undefined> {
    return this.movies.get(id);
  }

  async getFeaturedMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values()).filter(movie => movie.featured === 1);
  }

  async getHeroMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values()).filter(movie => movie.featured === 2);
  }

  async getMoviesByCategory(category: string): Promise<Movie[]> {
    return Array.from(this.movies.values()).filter(movie => movie.category === category);
  }

  async getMoviesByGenre(genre: string): Promise<Movie[]> {
    return Array.from(this.movies.values()).filter(movie => 
      movie.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }

  async searchMovies(query: string): Promise<Movie[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.movies.values()).filter(movie =>
      movie.title.toLowerCase().includes(lowercaseQuery) ||
      movie.description.toLowerCase().includes(lowercaseQuery) ||
      movie.genre.toLowerCase().includes(lowercaseQuery)
    );
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const id = randomUUID();
    const now = new Date();
    const movie: Movie = {
      ...insertMovie,
      id,
      backdropUrl: insertMovie.backdropUrl || null,
      featured: insertMovie.featured || 0,
      episodes: insertMovie.episodes || null,
      director: insertMovie.director || null,
      cast: insertMovie.cast || null,
      // New fields with defaults
      videoUrl: insertMovie.videoUrl || null,
      videoFormat: insertMovie.videoFormat || "horizontal",
      videoQuality: insertMovie.videoQuality || "1080p",
      thumbnailUrl: insertMovie.thumbnailUrl || null,
      trailerUrl: insertMovie.trailerUrl || null,
      mobileOptimized: insertMovie.mobileOptimized || false,
      verticalPosterUrl: insertMovie.verticalPosterUrl || null,
      createdAt: now,
      updatedAt: now,
      viewCount: 0,
      likeCount: 0,
      metadata: insertMovie.metadata || null
    };
    this.movies.set(id, movie);
    return movie;
  }

  // Vertical video methods
  async getVerticalVideos(params: GetVerticalVideosRequest): Promise<Movie[]> {
    const allMovies = Array.from(this.movies.values());
    const verticalMovies = allMovies.filter(movie => 
      movie.videoFormat === "vertical" || 
      movie.category === "short" ||
      movie.mobileOptimized
    );
    
    // Apply quality filter if specified
    const filteredMovies = params.quality 
      ? verticalMovies.filter(movie => movie.videoQuality === params.quality)
      : verticalMovies;
    
    // Apply pagination
    return filteredMovies
      .slice(params.offset, params.offset + params.limit);
  }

  async getMobileOptimizedMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values()).filter(movie => movie.mobileOptimized);
  }

  // Analytics methods
  async trackVideoView(data: TrackVideoViewRequest): Promise<VideoAnalytics> {
    const id = randomUUID();
    const now = new Date();
    
    const analytics: VideoAnalytics = {
      id,
      movieId: data.movieId,
      userId: null, // Will be set when auth is implemented
      sessionId: data.sessionId || null,
      viewStarted: now,
      viewEnded: null,
      watchDuration: data.watchDuration,
      completionRate: data.completionRate,
      deviceType: data.deviceType,
      userAgent: data.userAgent || null,
      screenSize: data.screenSize,
      liked: data.liked,
      shared: data.shared,
      fullscreen: data.fullscreen
    };
    
    this.analytics.set(id, analytics);
    return analytics;
  }

  async getVideoAnalytics(movieId: string): Promise<VideoAnalytics[]> {
    return Array.from(this.analytics.values()).filter(analytics => 
      analytics.movieId === movieId
    );
  }

  async incrementViewCount(movieId: string): Promise<void> {
    const movie = this.movies.get(movieId);
    if (movie) {
      movie.viewCount = (movie.viewCount || 0) + 1;
      movie.updatedAt = new Date();
      this.movies.set(movieId, movie);
    }
  }

  async updateLikeCount(movieId: string, increment: boolean): Promise<void> {
    const movie = this.movies.get(movieId);
    if (movie) {
      movie.likeCount = (movie.likeCount || 0) + (increment ? 1 : -1);
      movie.likeCount = Math.max(0, movie.likeCount); // Prevent negative likes
      movie.updatedAt = new Date();
      this.movies.set(movieId, movie);
    }
  }

  // Favorites methods
  async toggleFavorite(data: ToggleFavoriteRequest): Promise<UserFavorite> {
    // Check if favorite already exists
    const existingFavorite = Array.from(this.favorites.values()).find(fav => 
      fav.userId === data.userId && fav.movieId === data.movieId
    );

    if (existingFavorite) {
      // Remove existing favorite
      this.favorites.delete(existingFavorite.id);
      throw new Error("Favorite removed"); // This will be handled in the route
    }

    // Create new favorite
    const id = randomUUID();
    const favorite: UserFavorite = {
      id,
      userId: data.userId,
      movieId: data.movieId,
      createdAt: new Date()
    };
    
    this.favorites.set(id, favorite);
    return favorite;
  }

  async getUserFavorites(userId: string): Promise<UserFavorite[]> {
    return Array.from(this.favorites.values()).filter(favorite => 
      favorite.userId === userId
    );
  }

  async removeFavorite(userId: string, movieId: string): Promise<void> {
    const favorite = Array.from(this.favorites.values()).find(fav => 
      fav.userId === userId && fav.movieId === movieId
    );
    
    if (favorite) {
      this.favorites.delete(favorite.id);
    }
  }
}

export const storageEnhanced = new MemStorageEnhanced();

import { type Movie, type InsertMovie } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
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
}

export class MemStorage implements IStorage {
  private users: Map<string, any>;
  private movies: Map<string, Movie>;

  constructor() {
    this.users = new Map();
    this.movies = new Map();
    this.initializeMovies();
  }

  private initializeMovies() {
    const sampleMovies: InsertMovie[] = [
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
        category: "movie"
      },
      {
        title: "Blade Runner 2049",
        description: "Một thế giới tương lai đen tối nơi ranh giới giữa con người và máy móc trở nên mờ nhạt...",
        year: 2017,
        duration: 164,
        rating: 8.7,
        genre: "Khoa học viễn tưởng",
        posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 2,
        category: "movie"
      },
      {
        title: "La La Land",
        description: "Một câu chuyện tình yêu hiện đại giữa tham vọng và ước mơ tại thành phố Los Angeles...",
        year: 2016,
        duration: 128,
        rating: 8.0,
        genre: "Nhạc kịch, Lãng mạn",
        posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 2,
        category: "movie"
      },
      {
        title: "Inception",
        description: "Một thế giới nơi công nghệ cho phép truy cập vào tiềm thức con người thông qua việc chia sẻ giấc mơ...",
        year: 2010,
        duration: 148,
        rating: 8.8,
        genre: "Hành động, Khoa học viễn tưởng",
        posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 1,
        category: "movie"
      },
      {
        title: "Interstellar",
        description: "Một nhóm các nhà thám hiểm thực hiện nhiệm vụ quan trọng nhất trong lịch sử loài người...",
        year: 2014,
        duration: 169,
        rating: 8.6,
        genre: "Khoa học viễn tưởng, Chính kịch",
        posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 1,
        category: "movie"
      },
      {
        title: "The Conjuring",
        description: "Những nhà điều tra siêu nhiên Ed và Lorraine Warren làm việc để giúp đỡ một gia đình...",
        year: 2013,
        duration: 112,
        rating: 7.5,
        genre: "Kinh dị, Bí ẩn",
        posterUrl: "https://images.unsplash.com/photo-1509564324749-471bd272e1ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1509564324749-471bd272e1ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 1,
        category: "movie"
      },
      {
        title: "The Grand Budapest Hotel",
        description: "Cuộc phiêu lưu của một huyền thoại khách sạn concierge và protégé của ông...",
        year: 2014,
        duration: 99,
        rating: 8.1,
        genre: "Hài, Chính kịch",
        posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 1,
        category: "movie"
      },
      {
        title: "Mad Max: Fury Road",
        description: "Trong một thế giới hoang tàn hậu tận thế, Max hợp tác với Furiosa để trốn thoát...",
        year: 2015,
        duration: 120,
        rating: 8.1,
        genre: "Hành động, Phiêu lưu",
        posterUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 1,
        category: "movie"
      },
      {
        title: "Parasite",
        description: "Câu chuyện về sự bất bình đẳng xã hội qua gia đình nghèo xâm nhập vào cuộc sống của gia đình giàu có...",
        year: 2019,
        duration: 132,
        rating: 8.6,
        genre: "Chính kịch, Thriller",
        posterUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 1,
        category: "movie"
      },
      {
        title: "Avengers: Endgame",
        description: "Sau những sự kiện tàn khốc của Infinity War, các siêu anh hùng tập hợp để đảo ngược thiệt hại...",
        year: 2019,
        duration: 181,
        rating: 8.4,
        genre: "Hành động, Phiêu lưu",
        posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 0,
        category: "movie"
      },
      {
        title: "Shutter Island",
        description: "Hai thám tử U.S. Marshal điều tra vụ mất tích của một bệnh nhân tại bệnh viện tâm thần...",
        year: 2010,
        duration: 138,
        rating: 8.2,
        genre: "Bí ẩn, Thriller",
        posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 0,
        category: "movie"
      },
      {
        title: "Spirited Away",
        description: "Một cô bé 10 tuổi phải làm việc tại nhà tắm thần linh để cứu cha mẹ mình...",
        year: 2001,
        duration: 125,
        rating: 9.3,
        genre: "Hoạt hình, Gia đình",
        posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 0,
        category: "movie"
      }
    ];

    sampleMovies.forEach(movie => {
      const id = randomUUID();
      this.movies.set(id, { ...movie, id });
    });
  }

  async getUser(id: string): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = randomUUID();
    const user: any = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

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
    const movie: Movie = { ...insertMovie, id };
    this.movies.set(id, movie);
    return movie;
  }
}

export const storage = new MemStorage();

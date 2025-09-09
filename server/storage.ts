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
        cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"]
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
        category: "movie",
        director: "Denis Villeneuve",
        cast: ["Ryan Gosling", "Harrison Ford", "Ana de Armas"]
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
        category: "movie",
        director: "Damien Chazelle",
        cast: ["Ryan Gosling", "Emma Stone", "John Legend"]
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
        category: "movie",
        director: "Christopher Nolan",
        cast: ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy"]
      },

      // PHIM BỘ - SERIES
      {
        title: "Breaking Bad",
        description: "Một giáo viên hóa học trung học bắt đầu sản xuất và bán methamphetamine sau khi được chẩn đoán mắc bệnh ung thư phổi...",
        year: 2008,
        duration: 47,
        rating: 9.5,
        genre: "Tội phạm, Chính kịch, Thriller",
        posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 2,
        category: "series",
        episodes: 62,
        director: "Vince Gilligan",
        cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn"]
      },
      {
        title: "Stranger Things",
        description: "Khi một cậu bé biến mất, thị trấn nhỏ của anh ta phát hiện ra một bí ẩn liên quan đến các thí nghiệm bí mật...",
        year: 2016,
        duration: 51,
        rating: 8.7,
        genre: "Khoa học viễn tưởng, Kinh dị, Chính kịch",
        posterUrl: "https://images.unsplash.com/photo-1509564324749-471bd272e1ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1509564324749-471bd272e1ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 1,
        category: "series",
        episodes: 42,
        director: "Duffer Brothers",
        cast: ["Millie Bobby Brown", "Finn Wolfhard", "David Harbour"]
      },
      {
        title: "Game of Thrones",
        description: "Các gia tộc quý족 tranh giành quyền lực để kiểm soát Bảy Vương quốc của Westeros...",
        year: 2011,
        duration: 57,
        rating: 9.3,
        genre: "Hành động, Phiêu lưu, Chính kịch",
        posterUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 1,
        category: "series",
        episodes: 73,
        director: "David Benioff, D.B. Weiss",
        cast: ["Emilia Clarke", "Kit Harington", "Peter Dinklage"]
      },

      // PHIM NGẮN - SHORT FILMS
      {
        title: "The Present",
        description: "Một câu chuyện cảm động về một cậu bé và chú chó con khuyết tật, khám phá chủ đề về sự chấp nhận bản thân...",
        year: 2014,
        duration: 4,
        rating: 8.1,
        genre: "Hoạt hình, Gia đình",
        posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 1,
        category: "short",
        director: "Jacob Frey",
        cast: ["Samantha Brown"]
      },
      {
        title: "Paperman",
        description: "Một bộ phim hoạt hình ngắn kể về cuộc gặp gỡ ngẫu nhiên giữa một người đàn ông và một người phụ nữ...",
        year: 2012,
        duration: 7,
        rating: 8.3,
        genre: "Hoạt hình, Lãng mạn",
        posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 0,
        category: "short",
        director: "John Kahrs",
        cast: []
      },
      {
        title: "Bao",
        description: "Một người mẹ cô đơn tìm thấy niềm vui mới khi một chiếc bánh bao mà bà làm trở thành sống...",
        year: 2018,
        duration: 8,
        rating: 7.5,
        genre: "Hoạt hình, Gia đình",
        posterUrl: "https://images.unsplash.com/photo-1509564324749-471bd272e1ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1509564324749-471bd272e1ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 0,
        category: "short",
        director: "Domee Shi",
        cast: []
      },

      // REVIEW PHIM - MOVIE REVIEWS
      {
        title: "Đánh Giá: The Dark Knight - Kiệt Tác Siêu Anh Hùng",
        description: "Phân tích chi tiết về The Dark Knight, từ diễn xuất của Heath Ledger đến kỹ thuật quay phim độc đáo của Christopher Nolan...",
        year: 2023,
        duration: 15,
        rating: 9.2,
        genre: "Review, Phân tích phim",
        posterUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 1,
        category: "review",
        director: "CinemaHub Review Team",
        cast: ["Reviewer A"]
      },
      {
        title: "Đánh Giá: Parasite - Kiệt Tác Xã Hội",
        description: "Phân tích sâu sắc về bộ phim Parasite của Bong Joon-ho, khám phá các tầng lớp ý nghĩa xã hội và nghệ thuật...",
        year: 2023,
        duration: 18,
        rating: 8.8,
        genre: "Review, Phân tích phim",
        posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        backdropUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        featured: 0,
        category: "review",
        director: "CinemaHub Review Team",
        cast: ["Reviewer B"]
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

import { db } from './connection';
import { users, movies, userProfiles } from './schema';
import { hashPassword } from '../auth/utils';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create admin user
    const adminPasswordHash = await hashPassword('Admin123!@#');
    const adminUser = await db
      .insert(users)
      .values({
        username: 'admin',
        email: 'admin@moviestreamer.com',
        passwordHash: adminPasswordHash,
        displayName: 'Administrator',
        role: 'admin',
        isVerified: true,
      })
      .returning({ id: users.id });

    console.log('✅ Admin user created');

    // Create admin profile
    await db.insert(userProfiles).values({
      userId: adminUser[0].id,
      bio: 'System Administrator',
      preferences: {
        autoplay: true,
        quality: '1080p',
        subtitles: false,
        notifications: {
          email: true,
          push: true,
          newMovies: true,
          recommendations: true
        },
        privacy: {
          showProfile: true,
          showFavorites: true,
          showWatchHistory: true
        }
      }
    });

    // Create demo user
    const demoPasswordHash = await hashPassword('Demo123!@#');
    const demoUser = await db
      .insert(users)
      .values({
        username: 'demo',
        email: 'demo@moviestreamer.com',
        passwordHash: demoPasswordHash,
        displayName: 'Demo User',
        role: 'user',
        isVerified: true,
      })
      .returning({ id: users.id });

    console.log('✅ Demo user created');

    // Create demo profile
    await db.insert(userProfiles).values({
      userId: demoUser[0].id,
      bio: 'Demo user for testing',
      preferences: {
        autoplay: true,
        quality: '720p',
        subtitles: true,
        notifications: {
          email: false,
          push: true,
          newMovies: true,
          recommendations: false
        },
        privacy: {
          showProfile: false,
          showFavorites: false,
          showWatchHistory: false
        }
      }
    });

    // Seed movies with enhanced data
    const sampleMovies = [
      {
        title: 'The Matrix',
        description: 'A computer programmer discovers that reality as he knows it is a simulation controlled by machines.',
        year: 1999,
        duration: 136,
        rating: '8.7',
        genre: 'Sci-Fi, Action',
        category: 'movie',
        posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/w1280/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        verticalPosterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
        videoFormat: 'horizontal',
        videoQuality: '1080p',
        featured: 2, // Hero movie
        director: 'The Wachowskis',
        cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
        mobileOptimized: true,
        viewCount: 1250000,
        likeCount: 98500,
      },
      {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
        year: 2010,
        duration: 148,
        rating: '8.8',
        genre: 'Sci-Fi, Thriller',
        category: 'movie',
        posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        verticalPosterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
        videoFormat: 'horizontal',
        videoQuality: '1080p',
        featured: 1, // Featured movie
        director: 'Christopher Nolan',
        cast: ['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy'],
        mobileOptimized: true,
        viewCount: 2100000,
        likeCount: 156000,
      },
      {
        title: 'Mobile Short #1',
        description: 'A vertical short film optimized for mobile viewing experience.',
        year: 2024,
        duration: 2,
        rating: '7.5',
        genre: 'Short, Drama',
        category: 'short',
        posterUrl: 'https://picsum.photos/400/600?random=1',
        backdropUrl: 'https://picsum.photos/800/450?random=1',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        verticalPosterUrl: 'https://picsum.photos/400/600?random=1',
        videoFormat: 'vertical',
        videoQuality: '720p',
        featured: 0,
        director: 'Mobile Creator',
        cast: ['Actor One', 'Actor Two'],
        mobileOptimized: true,
        viewCount: 45000,
        likeCount: 3200,
      },
      {
        title: 'Mobile Short #2',
        description: 'Another engaging vertical video for the mobile-first experience.',
        year: 2024,
        duration: 3,
        rating: '8.1',
        genre: 'Short, Comedy',
        category: 'short',
        posterUrl: 'https://picsum.photos/400/600?random=2',
        backdropUrl: 'https://picsum.photos/800/450?random=2',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        verticalPosterUrl: 'https://picsum.photos/400/600?random=2',
        videoFormat: 'vertical',
        videoQuality: '1080p',
        featured: 0,
        director: 'Comedy Creator',
        cast: ['Comedian One', 'Comedian Two'],
        mobileOptimized: true,
        viewCount: 67000,
        likeCount: 5400,
      },
      {
        title: 'Mobile Short #3',
        description: 'A stunning vertical video showcasing mobile cinematography.',
        year: 2024,
        duration: 1,
        rating: '7.8',
        genre: 'Short, Visual',
        category: 'short',
        posterUrl: 'https://picsum.photos/400/600?random=3',
        backdropUrl: 'https://picsum.photos/800/450?random=3',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        verticalPosterUrl: 'https://picsum.photos/400/600?random=3',
        videoFormat: 'vertical',
        videoQuality: '720p',
        featured: 0,
        director: 'Visual Artist',
        cast: ['Model One', 'Model Two'],
        mobileOptimized: true,
        viewCount: 32000,
        likeCount: 2800,
      },
      {
        title: 'Breaking Bad',
        description: 'A high school chemistry teacher turned methamphetamine manufacturer.',
        year: 2008,
        duration: 47, // Average episode length
        rating: '9.5',
        genre: 'Crime, Drama, Thriller',
        category: 'series',
        posterUrl: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        verticalPosterUrl: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
        videoFormat: 'horizontal',
        videoQuality: '1080p',
        featured: 1,
        episodes: 62,
        director: 'Vince Gilligan',
        cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn'],
        mobileOptimized: true,
        viewCount: 3500000,
        likeCount: 287000,
      }
    ];

    await db.insert(movies).values(sampleMovies);
    console.log('✅ Sample movies created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Created accounts:');
    console.log('👤 Admin: admin@moviestreamer.com / Admin123!@#');
    console.log('👤 Demo: demo@moviestreamer.com / Demo123!@#');
    console.log('\n🎬 Created movies:');
    console.log('- 2 Feature films (The Matrix, Inception)');
    console.log('- 3 Vertical shorts for mobile');
    console.log('- 1 TV Series (Breaking Bad)');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run seeding
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log('✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error);
      process.exit(1);
    });
}

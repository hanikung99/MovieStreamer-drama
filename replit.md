# CinemaHub - Movie Streaming Platform

## Overview

CinemaHub is a modern movie streaming platform built with React, TypeScript, and Express.js. The application provides a Netflix-like interface for browsing, searching, and discovering movies with features including hero carousels, featured content sections, category browsing, and advanced search functionality. The platform supports Vietnamese language content and includes a comprehensive movie database with ratings, genres, and detailed metadata.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with CSS custom properties for theming, configured for dark mode
- **Forms**: React Hook Form with Hookform Resolvers for form validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling and request logging middleware
- **Data Layer**: In-memory storage implementation with interface for future database integration
- **Development Setup**: Hot reload with Vite integration for seamless development experience

### Database Architecture
- **ORM**: Drizzle ORM configured for PostgreSQL with schema-first approach
- **Schema**: Movie-centric data model with support for categories, genres, ratings, and featured content
- **Migrations**: Drizzle Kit for database migrations and schema management
- **Validation**: Zod schemas for runtime type validation integrated with Drizzle

### Component Structure
- **Layout Components**: Header with navigation, hero sections, and responsive grid layouts
- **Feature Components**: Movie cards, carousels, search overlays, and category sections
- **UI Components**: Complete shadcn/ui component library with custom theming
- **Hooks**: Custom hooks for mobile detection and toast notifications

### API Endpoints
- **Movie Operations**: CRUD operations for movies with filtering by category, genre, and featured status
- **Search**: Full-text search functionality across movie titles and descriptions
- **Content Management**: Support for hero movies, featured content, and categorized browsing

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless database driver
- **drizzle-orm** and **drizzle-kit**: Database ORM and migration toolkit
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React routing library

### UI and Styling Dependencies
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework with PostCSS integration
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Icon library for consistent iconography

### Development and Build Tools
- **vite**: Fast build tool and development server
- **@vitejs/plugin-react**: React plugin for Vite
- **tsx**: TypeScript execution environment for Node.js
- **esbuild**: Fast JavaScript bundler for production builds

### Validation and Utilities
- **zod**: TypeScript-first schema validation
- **date-fns**: Modern JavaScript date utility library
- **clsx** and **tailwind-merge**: Utility functions for conditional CSS classes

### Session and State Management
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **express-session**: Session middleware for user authentication (prepared for future implementation)

The architecture is designed for scalability with clear separation between frontend and backend, proper abstraction layers for data access, and a component-based UI structure that supports easy maintenance and feature expansion.
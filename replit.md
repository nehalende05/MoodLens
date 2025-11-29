# MoodLens - AI Mental Wellness Monitor

## Overview

MoodLens is an AI-powered mental wellness monitoring system that provides real-time emotional analysis through facial expression recognition. The application uses webcam-based emotion detection to identify early signs of stress, fatigue, and low mood, offering personalized wellness recommendations through an agentic AI approach. The system continuously monitors emotional states without requiring constant user input and provides context-aware support including breathing exercises, meditation prompts, and wellness breaks.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for component-based UI development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching
- Tailwind CSS with custom "Starry Night" theme for styling
- Shadcn UI component library (New York variant) for consistent UI elements

**Design Philosophy:**
The interface follows a cosmic/space-inspired theme with a calming starry night aesthetic. The design prioritizes tranquility while housing sophisticated monitoring tools, creating an immersive experience that promotes mental wellness. Typography uses Space Grotesk and Inter fonts, with consistent spacing based on Tailwind units (3, 4, 6, 8, 12).

**Key UI Components:**
- **Split-Screen Dashboard**: Left panel (40%) displays live webcam feed with emotion overlays; right panel (60%) shows analytics and recommendations
- **Emotion Monitor**: Real-time facial expression analysis using face-api library with confidence visualization
- **Analytics Dashboard**: Emotion distribution charts, timeline views, and statistical breakdowns
- **Breathing Exercise Component**: Interactive guided breathing with phase-based animations
- **Wellness Recommendations**: AI-generated personalized suggestions based on detected emotional states
- **Mood History**: Timeline visualization showing emotion patterns over time
- **Starry Background**: Animated canvas-based cosmic background with twinkling stars and moon

**State Management:**
- Local component state for real-time emotion tracking and UI interactions
- Session-based emotion storage with periodic API synchronization
- Query client for caching and managing server-side data

### Backend Architecture

**Technology Stack:**
- Express.js server with TypeScript
- Node.js runtime with ESNext module system
- HTTP server created via Node's native `createServer`
- Custom logging middleware for request tracking
- Static file serving for production builds

**API Structure:**
- `POST /api/emotions` - Batch save emotion entries for a session
- `GET /api/emotions/:sessionId` - Retrieve emotion history for a specific session
- `GET /api/recommendations` - Fetch AI-generated wellness recommendations based on current emotional state

**Data Storage Pattern:**
The application uses an abstraction layer (`IStorage` interface) that currently implements in-memory storage (`MemStorage`) but is designed to support database persistence. The schema is defined using Zod validators, allowing for type-safe data validation.

**Emotion Detection Pipeline:**
1. Client-side facial recognition using @vladmandic/face-api
2. Real-time emotion classification (happy, sad, angry, neutral, fearful, surprised, disgusted)
3. Confidence scoring for each detection
4. Batched transmission to server for persistence
5. Session-based aggregation and analysis

**AI Recommendation System:**
- Primary: Google Gemini integration for context-aware wellness suggestions
- Fallback: Predefined recommendation sets per emotion type
- Recommendation types: breathing exercises, meditation, breaks, affirmations, stretches
- Priority-based sorting to surface most relevant suggestions first

### Data Storage Solutions

**Current Implementation:**
- In-memory storage using Map data structures
- Session-based organization with unique session IDs
- Emotion entries stored as arrays per session
- No persistence across server restarts

**Prepared Database Integration:**
- Drizzle ORM configured with PostgreSQL dialect
- Database configuration expects `DATABASE_URL` environment variable
- Schema defined in `shared/schema.ts` with Zod validators
- Migration system ready via `drizzle-kit`
- Neon Database serverless driver included in dependencies

**Data Models:**
- **EmotionEntry**: Individual emotion detection with type, confidence, and timestamp
- **MoodSession**: Session container with start/end times, emotion array, and computed statistics (dominant emotion, average confidence)
- **WellnessRecommendation**: AI-generated or templated wellness suggestions with type, priority, and duration

### Authentication and Authorization

The current implementation does not include authentication or authorization mechanisms. The system tracks sessions by generated session IDs but does not associate them with user accounts. User schema definitions exist in `shared/schema.ts` (with username field) suggesting planned future implementation.

## External Dependencies

**AI and Machine Learning:**
- `@vladmandic/face-api` - Client-side facial expression recognition and landmark detection
- `@google/generative-ai` - Google Gemini API integration for generating personalized wellness recommendations

**Database and ORM:**
- `drizzle-orm` - TypeScript ORM for database operations
- `drizzle-zod` - Zod schema integration with Drizzle
- `@neondatabase/serverless` - Serverless PostgreSQL driver for Neon Database
- `connect-pg-simple` - PostgreSQL session store for Express (prepared for session persistence)

**Frontend Libraries:**
- `@tanstack/react-query` - Server state management and caching
- `@radix-ui/*` - Headless UI primitives (22+ component packages for dialogs, dropdowns, tooltips, etc.)
- `class-variance-authority` & `clsx` - Utility-first CSS composition
- `cmdk` - Command palette component
- `wouter` - Minimalist router
- `recharts` - Charting library for emotion analytics visualization
- `date-fns` - Date manipulation and formatting

**Build and Development Tools:**
- `vite` - Build tool and dev server with HMR
- `esbuild` - Fast JavaScript bundler for server code
- `tsx` - TypeScript execution for build scripts and development
- `@replit/vite-plugin-*` - Replit-specific development enhancements (runtime error overlay, cartographer, dev banner)

**Backend Infrastructure:**
- `express` - Web application framework
- `express-session` - Session management middleware
- `express-rate-limit` - API rate limiting
- `cors` - Cross-origin resource sharing
- `multer` - File upload handling (available but not actively used)
- `ws` - WebSocket support (available for future real-time features)

**Utilities:**
- `nanoid` - Unique ID generation
- `uuid` - UUID generation
- `zod` - Schema validation
- `zod-validation-error` - Human-readable validation error messages

**Payment Processing (Available):**
- `stripe` - Payment processing infrastructure (included but not implemented)

**Email (Available):**
- `nodemailer` - Email sending capabilities (included but not implemented)

**Authentication Libraries (Available):**
- `passport` & `passport-local` - Authentication middleware (included but not implemented)
- `jsonwebtoken` - JWT token management (included but not implemented)

**Session Storage Options:**
- `memorystore` - In-memory session store for development
- `connect-pg-simple` - PostgreSQL session store for production
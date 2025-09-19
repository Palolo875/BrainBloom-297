# BrainBloom - Digital Garden Note-Taking App

## Project Overview
- **Type**: Next.js React Application with TypeScript
- **Purpose**: A beautiful note-taking app called "BrainBloom" with organic design and fluid interactions
- **Status**: Successfully imported and configured for Replit environment

## Technology Stack
- **Framework**: Next.js 14.2.16
- **Language**: TypeScript
- **UI Components**: Radix UI components with custom styling
- **Styling**: Tailwind CSS with custom animations
- **Fonts**: Lexend, Lora, and Geist Mono
- **Analytics**: Vercel Analytics
- **Package Manager**: npm (converted from pnpm)

## Project Structure
- `app/` - Next.js app directory with layout, page, and global styles
- `components/` - React components including UI components and feature modules
- `hooks/` - Custom React hooks (e.g., use-notes.ts)
- `lib/` - Utility functions
- `public/` - Static assets and images
- `styles/` - Additional CSS files

## Key Features
- Note-taking system with rich text editing
- Graph visualization of note connections
- Task management system
- Journaling functionality
- Learning system modules
- Animated search interface
- Theme support (light/dark)
- Modular screen system (notes, editor, graph, modules, settings, etc.)

## Configuration
- **Development Server**: Runs on port 5000 with 0.0.0.0 binding for Replit
- **Next.js Config**: Secure headers, unoptimized images, and proper Content-Security-Policy for iframe embedding
- **Deployment**: Configured for autoscale deployment with build and start scripts

## Development Workflow
- Primary workflow: "Development Server" runs `npm run dev -- --hostname 0.0.0.0 --port 5000`
- Hot reload and Fast Refresh enabled
- TypeScript compilation with some build error tolerance

## Recent Changes (September 19, 2025)
- Successfully imported from GitHub repository
- Installed npm dependencies (all dependencies installed successfully)  
- Fixed Next.js configuration for secure Replit environment compatibility:
  - Added proper Content-Security-Policy headers for both development and production
  - Removed insecure configuration and resolved security vulnerabilities
  - Made build error ignoring conditional to development only
- Resolved package manager conflicts by removing pnpm lockfile
- Set up development workflow on port 5000 with 0.0.0.0 host binding
- Configured autoscale deployment for production with proper build/start scripts
- Added .env.local to .gitignore for environment variable security
- **Implemented complete backend architecture following architectural prompt**:
  - Configured Supabase client files for server and client-side usage
  - Set up AI embedding API endpoint using Hugging Face sentence-transformers/all-MiniLM-L6-v2
  - Created server actions following Next.js 14 App Router patterns
  - Built test architecture page demonstrating Server Components + Server Actions
  - All components properly validated and security-compliant
- Application verified as running and accessible through Replit proxy
- Backend architecture ready for API key configuration and database setup

## User Preferences
- Project follows existing code conventions and structure
- Uses the original v0.app design and component architecture
- Maintains soft UI design aesthetics with organic feel
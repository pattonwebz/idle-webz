# 🎮 Incremental Clicker Game

A modern, responsive incremental clicker game built with React, TypeScript, and Vite. Click to produce resources, purchase upgrades, and watch your production empire grow!

![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![React](https://img.shields.io/badge/React-19.2.0-61dafb)

## 🚀 Features

- **Incremental Gameplay**: Click to produce resources and purchase upgrades
- **Auto-Production**: Unlock automatic resource generation
- **Save System**: Automatic save every 5 seconds with localStorage persistence
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop
- **Clean Architecture**: Well-organized code with Context API for state management
- **Type Safety**: Full TypeScript implementation
- **Performance**: Optimized game loop using requestAnimationFrame

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Game Mechanics](#game-mechanics)
- [Architecture](#architecture)
- [Development](#development)
- [Building](#building)
- [Documentation](#documentation)
- [Deploy to GitHub Pages](#deploy-to-github-pages)

## 🎯 Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd untitled

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:5173`

## 🎲 Game Mechanics

### Resources
- Start by manually clicking the "Produce Resource" button (+1 per click)
- Purchase upgrades to generate resources automatically
- Resources accumulate even when you're not actively playing

### Upgrades
The game features 5 tiers of production upgrades:

1. **Auto Clicker** (10 resources) - Produces 1/sec
2. **Factory** (100 resources) - Produces 5/sec
3. **Industrial Complex** (1,000 resources) - Produces 25/sec
4. **Mega Factory** (10,000 resources) - Produces 100/sec

Each upgrade's cost increases by 15% with each purchase, following the formula:
```
Cost = BaseCost × (1.15 ^ Quantity)
```

### Saving
- Game auto-saves every 5 seconds to localStorage
- Progress persists across browser sessions
- Manual reset available in Settings menu

## 🏗️ Architecture

### Project Structure

```
src/
├── components/          # React UI components
│   ├── ClickButton.tsx       # Main click button
│   ├── ResourceDisplay.tsx   # Resource counter display
│   ├── UpgradeList.tsx       # Upgrade cards grid
│   └── GameControls.tsx      # Settings menu
├── context/            # React Context providers
│   └── GameContext.tsx       # Game state management
├── game/               # Core game logic
│   └── GameEngine.ts         # Game state & calculations
├── utils/              # Utility functions (to be added)
├── types/              # TypeScript type definitions (to be added)
├── App.tsx             # Main app component
└── main.tsx            # App entry point
```

### Tech Stack

- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool and dev server
- **Context API** - State management
- **CSS3** - Styling with gradients and animations

### Design Patterns

- **Context + Provider Pattern**: Centralized game state management
- **Game Loop Pattern**: RAF-based update loop for smooth performance
- **Separation of Concerns**: Game logic isolated from UI components
- **Immutable Updates**: State updates follow immutability principles

## 💻 Development

### Available Scripts

```bash
# Development server with HMR
npm run dev

# Type checking
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Maintain separation between UI and business logic
- Add JSDoc comments for public APIs
- Keep components small and focused

### Adding New Features

See [docs/suggestions.md](./docs/suggestions.md) for a comprehensive list of feature ideas and implementation notes.

## 🔨 Building

```bash
# Build for production
npm run build

# Output will be in the `dist/` directory
```

The production build is optimized and minified, ready for deployment to any static hosting service.

## 📚 Documentation

### Quick Links
- **[QUICKSTART.md](./QUICKSTART.md)** - ⚡ Start here! Quick reference guide
- **[docs/IMPROVEMENTS.md](./docs/IMPROVEMENTS.md)** - 📋 Summary of all improvements made

### Detailed Guides
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - 🏗️ Technical architecture and design patterns
- **[docs/API.md](./docs/API.md)** - 📖 Complete API reference
- **[docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)** - 🤝 How to contribute to the project
- **[docs/suggestions.md](./docs/suggestions.md)** - 💡 Feature ideas and roadmap

## 🎨 Responsive Design

The game is fully responsive with breakpoints for:
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

## 🐛 Known Issues

- None currently tracked

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

Built with modern web technologies and best practices for game development.

## 🚀 Deploy to GitHub Pages

This project includes an automated GitHub Actions workflow to deploy the production build to GitHub Pages on every push to `main`.

### Setup Steps
1. Push your code to a GitHub repository and set the default branch to `main`.
2. Enable GitHub Pages:
   - Go to Settings → Pages → Build and deployment
   - Source: GitHub Actions
3. Verify the workflow file at `.github/workflows/deploy.yml` is present in your repo.
4. If your repository is served from a subpath (like `https://<user>.github.io/<repo>`), set the Vite base path:
   - Edit `vite.config.ts` and set `base: '/<repo>/'` (replace `<repo>` with your repository name).
   - Example:
     ```ts
     // vite.config.ts
     import { defineConfig } from 'vite'
     import react from '@vitejs/plugin-react'

     export default defineConfig({
       base: '/my-repo/',
       plugins: [react()],
     })
     ```

### Manual Deployment Trigger
- You can trigger a manual deploy via the Actions tab → "Deploy to GitHub Pages" → "Run workflow".

### Notes
- The workflow uses Node.js 18, builds to `dist/`, and publishes using `actions/deploy-pages`.
- Ensure `npm run build` succeeds locally before pushing.

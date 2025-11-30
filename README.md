# 🕸️ Idle Webz

A modern, responsive idle/incremental web dev-themed game built with React, TypeScript, and Vite. Click or type to produce resources, purchase upgrades, and scale your automation pipeline!

![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![React](https://img.shields.io/badge/React-19.2.0-61dafb)

## 🚀 Features

- **Idle/Incremental Gameplay**: Click or type to produce resources and purchase upgrades
- **Auto-Production**: Unlock automatic resource generation and speed upgrades
- **Save System**: Automatic save with localStorage persistence
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Clean Architecture**: Context API for state management and a framework-agnostic game engine
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
- Start by manually clicking the main button or typing characters to earn resources
- Purchase producers to generate resources automatically
- Resources accumulate based on production rate

### Upgrades
The game features a dedicated Upgrades tab:

- **Typing Mechanic** (cost: 3000) – Unlock typing-based resource generation with word/streak bonuses
- **Auto-Buy** (cost: 5000) – Unlock automatic purchases of the best value producer
- **Code Challenges** (cost: 20000) – Unlock mini typing challenges for big rewards (visible after Typing is purchased)
- **Repeatables** – Click Power (doubles per level, cost doubles each time), Auto-Buy Speed (-2s per level, min 2s)

Producers follow exponential cost scaling:
```
Cost = BaseCost × (multiplier ^ Quantity)
```

### Saving
- Game auto-saves at a fixed interval to localStorage
- Progress persists across sessions
- Manual reset available via Game Controls

## 🏗️ Architecture

### Project Structure

```
src/
├── components/          # React UI components
│   ├── ClickButton.tsx       # Main click button
│   ├── ResourceDisplay.tsx   # Resource & rate display
│   ├── Upgrades.tsx          # Upgrades tab
│   ├── AutoBuy.tsx           # Auto-buy toggle
│   ├── TypingPanel.tsx       # Typing mechanics & challenges
│   └── ProducerList.tsx      # Producer cards grid
├── context/            # React Context providers
│   └── GameContext.tsx       # Game state management
├── game/               # Core game logic
│   └── GameEngine.ts         # Game state & calculations
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── App.tsx             # Main app component
└── main.tsx            # App entry point
```

### Tech Stack

- **React 19** – UI framework
- **TypeScript 5.9** – Type safety
- **Vite 7** – Build tool and dev server
- **Context API** – State management
- **SCSS** – Styling with gradients and animations

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

# Type checking & build
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
- **[QUICKSTART.md](./QUICKSTART.md)** – ⚡ Quick reference guide
- **[docs/IMPROVEMENTS.md](./docs/IMPROVEMENTS.md)** – 📋 Summary of improvements

### Detailed Guides
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** – 🏗️ Technical architecture and design patterns
- **[docs/API.md](./docs/API.md)** – 📖 API reference
- **[docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)** – 🤝 Contributing guidelines
- **[docs/suggestions.md](./docs/suggestions.md)** – 💡 Feature ideas and roadmap

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

This project can be deployed to GitHub Pages via an Actions workflow.

### Setup Steps
1. Push your code to a GitHub repository and set the default branch to `main`.
2. Enable GitHub Pages:
   - Go to Settings → Pages → Build and deployment
   - Source: GitHub Actions
3. Verify the workflow file at `.github/workflows/deploy.yml` is present in your repo.
4. If your repository is served from a subpath (like `https://<user>.github.io/<repo>`), set the Vite base path:
   - Edit `vite.config.ts` and set `base: '/<repo>/'` (replace `<repo>` with your repository name).

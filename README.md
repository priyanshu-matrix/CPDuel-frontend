# CP Duel

CP Duel is a modern, competitive programming duel platform where users can challenge each other to real-time coding battles, view live leaderboards, and experience a LeetCode-like problem-solving interface.

---

## 🚀 Features

- **1v1 Coding Duels** with real-time status tracking
- **Tournament Bracket Playoffs** with bracket visualization
- **Multi-tier Leaderboards** (Round, Semi-final, Final, and Winner)
- **LeetCode-style Problem Solving UI** with integrated code editor
- **Real-time Timer** and opponent status monitoring
- **Firebase Authentication** with protected routes
- **Practice Sheets** for different algorithmic topics (DP, Graphs, Trees, Range Queries)
- **Contest Management** with create/join functionality
- **Statistics Dashboard** for performance tracking
- **Responsive, dark-themed UI** optimized for all devices
- **Fast Global Access** deployed on Vercel

---

## 📁 Project Structure

```
cp-duel/
├── 📄 README.md                    # Project documentation
├── 📄 package.json                 # Node.js dependencies and scripts
├── 📄 vite.config.js               # Vite build configuration
├── 📄 eslint.config.js             # ESLint linting configuration
├── 📄 vercel.json                  # Vercel deployment configuration
├── 📄 index.html                   # Main HTML entry point
│
├── 📁 public/                      # Static assets served directly
│   ├── 🖼️ images.png               # Platform images/screenshots
│   ├── 🖼️ react.svg                # React logo
│   └── 🖼️ vite.svg                 # Vite logo
│
└── 📁 src/                         # Source code directory
    ├── 📄 App.jsx                  # Main application component with routing
    ├── 📄 main.jsx                 # React application entry point
    ├── 📄 index.css                # Global CSS styles and Tailwind imports
    │
    ├── 📁 assets/                  # Static assets used in components
    │   ├── 🖼️ gfg.svg              # GeeksforGeeks logo
    │   └── 🖼️ lc.svg               # LeetCode logo
    │
    ├── 📁 components/              # Reusable React components
    │   ├── 🔐 login.jsx            # User login form component
    │   ├── 🔐 Signup.jsx           # User registration form component
    │   ├── 🛡️ ProtectedRoute.jsx   # Route protection wrapper component
    │   ├── 🧭 Navbar.jsx           # Navigation header component
    │   ├── 🦶 Footer.jsx           # Site footer component
    │   ├── 🏆 ContestList.jsx      # Display list of available contests
    │   ├── 🎯 ContestCard.jsx      # Individual contest display card
    │   ├── 🏁 ContestBracket.jsx   # Tournament bracket visualization
    │   ├── 📊 LeaderboardCard.jsx  # Individual leaderboard entry
    │   ├── ➕ CreateContest.jsx    # Contest creation form
    │   ├── 📝 CreateProblem.jsx    # Problem creation form
    │   ├── 📋 ProblemForm.jsx      # Problem input/editing form
    │   ├── 📜 ProblemList.jsx      # List of problems display
    │   ├── ⭐ FavoriteList.jsx     # User's favorite problems
    │   ├── 👁️ ViewQuestionComponent.tsx # Problem viewing interface
    │   └── 📁 ui/                  # UI component library (Radix UI components)
    │
    ├── 📁 pages/                   # Page-level components (route destinations)
    │   ├── 🏠 HomePage.jsx         # Landing page with platform overview
    │   ├── 🏆 ContestPage.jsx      # Contest lobby and management
    │   ├── 🥊 ContestStartPage.tsx # Live contest interface with code editor
    │   ├── 🏁 ContestBracketPage.jsx # Tournament bracket view
    │   ├── 📊 ContestLeaderboardPage.jsx # Contest-specific leaderboards
    │   ├── 🏅 LeaderboardPage.jsx  # Global platform leaderboards
    │   ├── 📚 SheetsPage.jsx       # Practice sheets overview
    │   ├── 🧠 DPSheetPage.jsx      # Dynamic Programming practice sheet
    │   ├── 🕸️ GraphSheetPage.jsx   # Graph algorithms practice sheet
    │   ├── 🌳 TreeSheetPage.jsx    # Tree algorithms practice sheet
    │   ├── 📊 RangeQuerySheetPage.jsx # Range query algorithms practice sheet
    │   ├── 📈 StatsPage.jsx        # User statistics and analytics
    │   └── 💻 ProblemSolvingPage.tsx # Individual problem solving interface
    │
    ├── 📁 contexts/                # React Context providers
    │   └── 🔐 AuthContext.jsx      # Authentication state management
    │
    ├── 📁 hooks/                   # Custom React hooks
    │   └── 🔗 useApi.js            # API interaction custom hook
    │
    ├── 📁 config/                  # Configuration files
    │   └── 🌐 server.js            # Server configuration settings
    │
    ├── 📁 utils/                   # Utility functions and helpers
    │   ├── 🌐 apiClient.js         # HTTP client for API requests
    │   ├── 📊 contestLeaderboardData.js # Contest leaderboard data handlers
    │   ├── 🧠 dpSections.js        # Dynamic Programming section data
    │   ├── 🏅 leaderboardData.js   # Global leaderboard data handlers
    │   ├── 📝 problemData.js       # Problem data management
    │   ├── 🛠️ utils.jsx            # General utility functions
    │   └── 📁 firebase/            # Firebase integration
    │       └── 🔥 firebase.js      # Firebase configuration and initialization
    │
    ├── 📁 styles/                  # Component-specific stylesheets
    │   └── 🎨 login.css            # Login component specific styles
    │
    ├── 📁 data/                    # Static data files and mock data
    └── 📁 lib/                     # Third-party library configurations
```

---

## 🏗️ Architecture Overview

### **Frontend Framework**
- **React 19.1.0** with functional components and hooks
- **Vite 6.3.5** for fast development and optimized builds
- **React Router DOM 7.6.0** for client-side routing and navigation

### **State Management**
- **React Context API** for global authentication state
- **Custom hooks** for API interactions and data fetching
- **Local storage** for token persistence

### **Styling & UI**
- **Tailwind CSS 4.1.6** for utility-first styling
- **Radix UI** components for accessible, unstyled UI primitives
- **React Icons** for consistent iconography
- **Responsive design** with mobile-first approach

### **Code Editor Integration**
- **Monaco Editor** (VS Code editor) for in-browser code editing
- **React Monaco Editor** wrapper for React integration
- **Syntax highlighting** and IntelliSense support

### **Authentication & Security**
- **Firebase Authentication** for user management
- **Protected routes** with authentication guards
- **token** management with automatic refresh
- **Secure API** communication with token-based auth

### **Data Visualization**
- **Recharts** for statistics and performance charts
- **React Circular Progressbar** for timer and progress indicators
- **Custom tournament brackets** with SVG-based visualization

### **Development Tools**
- **ESLint** for code quality and consistency
- **TypeScript** support for select components
- **Hot Module Replacement** for fast development
- **Environment variables** for configuration management

---

## 🔧 Key Components Breakdown

### **Authentication System**
- `AuthContext.jsx`: Centralized authentication state with Firebase integration
- `login.jsx` & `Signup.jsx`: User authentication forms with validation
- `ProtectedRoute.jsx`: Route guard component for authenticated access

### **Contest Management**
- `ContestPage.jsx`: Main contest interface with lobby functionality
- `ContestStartPage.tsx`: Live contest environment with real-time features
- `CreateContest.jsx`: Contest creation with customizable parameters
- `ContestBracket.jsx`: Tournament bracket visualization and progression

### **Problem Solving Interface**
- `ProblemSolvingPage.tsx`: Full-featured coding environment
- `ViewQuestionComponent.tsx`: Problem statement renderer with LaTeX support
- Monaco Editor integration for code editing with syntax highlighting

### **Practice Sheets System**
- Topic-specific practice sheets (DP, Graphs, Trees, Range Queries)
- Curated problem sets for algorithmic learning
- Progress tracking and difficulty progression

### **Leaderboard System**
- Global and contest-specific leaderboards
- Real-time ranking updates during contests
- Performance statistics and user analytics

### **Responsive Navigation**
- `Navbar.jsx`: Adaptive navigation with authentication state
- `Footer.jsx`: Site-wide footer with links and information

---

## 🛠️ Tech Stack

### **Core Technologies**
- **React 19.1.0** - Modern UI library with latest features
- **Vite 6.3.5** - Next-generation frontend tooling
- **Tailwind CSS 4.1.6** - Utility-first CSS framework
- **React Router DOM 7.6.0** - Declarative routing

### **Development & Build Tools**
- **ESLint** - Code linting and quality assurance
- **TypeScript** - Type safety for critical components
- **Vercel** - Deployment and hosting platform

### **Authentication & Backend**
- **Firebase Auth** - User authentication and management
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client for API requests

### **UI & Visualization Libraries**
- **Monaco Editor** - In-browser code editor
- **Radix UI** - Primitive UI components
- **Recharts** - Data visualization and charts
- **React Icons** - Icon library
- **React Toastify** - Toast notifications
- **KaTeX & React KaTeX** - Mathematical notation rendering

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn package manager
- Firebase account for authentication setup

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd cp-duel

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Configure Firebase credentials in .env

# Start development server
npm run dev
```

### **Available Scripts**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

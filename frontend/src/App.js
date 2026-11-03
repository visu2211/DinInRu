import React from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { useTheme } from "./hooks/useTheme";
import AddReview from "./components/add-review";
import Restaurant from "./components/restaurants";
import RestaurantsList from "./components/restaurants-list";
import Login from "./components/login";
import Signup from "./components/signup";
import { LogoMark, Wordmark } from "./components/logo";

function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}

function Nav({ theme, toggleTheme }) {
  const { user, logout } = useAuth();
  const navLinkClass = ({ isActive }) =>
    `whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition sm:px-3 ${
      isActive
        ? "text-scarlet"
        : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/70 bg-white/80 backdrop-blur-lg dark:border-neutral-800/70 dark:bg-neutral-950/80">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/restaurants" className="flex items-center gap-2.5" aria-label="DinInRu home">
          <LogoMark className="h-8 w-8" />
          <Wordmark />
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/restaurants" className={(state) => `hidden sm:block ${navLinkClass(state)}`}>
            Restaurants
          </NavLink>
          {user ? (
            <>
              <span className="hidden items-center gap-2 px-2 text-sm text-neutral-600 dark:text-neutral-400 md:flex">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-scarlet-light text-xs font-bold text-scarlet-dark dark:bg-scarlet/20 dark:text-rose-300">
                  {user.name?.[0]?.toUpperCase()}
                </span>
                {user.name}
              </span>
              <button onClick={logout} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Log in
              </NavLink>
              <Link to="/signup" className="btn-primary whitespace-nowrap px-3.5 py-2">
                Sign up
              </Link>
            </>
          )}
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </nav>
    </header>
  );
}

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
        <Nav theme={theme} toggleTheme={toggleTheme} />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          <Routes>
            <Route path="/" element={<RestaurantsList />} />
            <Route path="/restaurants" element={<RestaurantsList />} />
            <Route path="/restaurants/:id/review" element={<AddReview />} />
            <Route path="/restaurants/:id" element={<Restaurant />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>

        <footer className="border-t border-neutral-200/70 dark:border-neutral-800/70">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-neutral-500 sm:flex-row sm:px-6">
            <span className="flex items-center gap-2">
              <LogoMark className="h-5 w-5" />
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">DinInRu</span>
            </span>
            <span className="text-center">Restaurant reviews for Scarlet Knights &middot; New Brunswick, NJ</span>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;

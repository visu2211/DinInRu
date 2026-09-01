import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { useTheme } from "./hooks/useTheme";
import AddReview from "./components/add-review";
import Restaurant from "./components/restaurants";
import RestaurantsList from "./components/restaurants-list";
import Login from "./components/login";
import Signup from "./components/signup";

function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="rounded-md p-1.5 text-lg leading-none opacity-90 hover:opacity-100"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

function Nav({ theme, toggleTheme }) {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-scarlet text-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link to="/restaurants" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span role="img" aria-label="fork and knife">🍽️</span> RU Eats
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium">
          <Link to="/restaurants" className="opacity-90 hover:opacity-100 hover:underline">
            Restaurants
          </Link>
          {user ? (
            <button
              onClick={logout}
              className="opacity-90 hover:opacity-100 hover:underline"
            >
              Logout {user.name}
            </button>
          ) : (
            <>
              <Link to="/login" className="opacity-90 hover:opacity-100 hover:underline">
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-white px-3 py-1.5 text-scarlet-dark hover:bg-scarlet-light"
              >
                Sign up
              </Link>
            </>
          )}
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
    </nav>
  );
}

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
        <Nav theme={theme} toggleTheme={toggleTheme} />

        <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          <Routes>
            <Route path="/" element={<RestaurantsList />} />
            <Route path="/restaurants" element={<RestaurantsList />} />
            <Route path="/restaurants/:id/review" element={<AddReview />} />
            <Route path="/restaurants/:id" element={<Restaurant />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>

        <footer className="py-6 text-center text-sm text-neutral-500 dark:text-neutral-500">
          Rutgers Restaurant Reviews &middot; built for Scarlet Knights
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;

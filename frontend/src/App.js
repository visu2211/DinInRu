import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import AddReview from "./components/add-review";
import Restaurant from "./components/restaurants";
import RestaurantsList from "./components/restaurants-list";
import Login from "./components/login";

function App() {
  const [user, setUser] = React.useState(null);

  async function login(user = null) {
    setUser(user);
  }

  async function logout() {
    setUser(null);
  }

  return (
    <div>
      <nav className="navbar navbar-expand navbar-dark app-navbar">
        <Link to="/restaurants" className="navbar-brand">
          <span role="img" aria-label="fork and knife">🍽️</span> RU Eats
        </Link>
        <div className="navbar-nav ms-auto flex-row">
          <li className="nav-item">
            <Link to={"/restaurants"} className="nav-link">
              Restaurants
            </Link>
          </li>
          <li className="nav-item">
            {user ? (
              <button
                onClick={logout}
                className="nav-link btn btn-link"
                style={{ cursor: "pointer" }}
              >
                Logout {user.name}
              </button>
            ) : (
              <Link to={"/login"} className="nav-link">
                Login
              </Link>
            )}
          </li>
        </div>
      </nav>

      <div className="page-container">
        <Routes>
          <Route
            path="/"
            element={<RestaurantsList />}
          />
          <Route
            path="/restaurants"
            element={<RestaurantsList />}
          />
          <Route
            path="/restaurants/:id/review"
            element={<AddReview user={user} />}
          />
          <Route
            path="/restaurants/:id"
            element={<Restaurant user={user} />}
          />
          <Route
            path="/login"
            element={<Login login={login} />}
          />
        </Routes>
      </div>

      <footer className="app-footer">
        Rutgers Restaurant Reviews &middot; built for Scarlet Knights
      </footer>
    </div>
  );
}

export default App;
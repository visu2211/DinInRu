import axios from "axios";

// The backend (Express) listens on its own port (see backend/.env, default 8000).
// The CRA dev server already owns port 3000, so pointing here would just call
// the frontend itself. Override with REACT_APP_API_URL if the backend runs
// somewhere else (e.g. in production).
const baseURL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1/restaurants";

export default axios.create({
  baseURL,
  headers: {
    "Content-type": "application/json",
  },
});

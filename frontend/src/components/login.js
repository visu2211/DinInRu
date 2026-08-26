import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Use useNavigate instead of useHistory

const Login = (props) => {
  const initialUserState = {
    name: "",
    id: "",
  };

  const [user, setUser] = useState(initialUserState);
  const navigate = useNavigate(); // Get the navigate function

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUser({ ...user, [name]: value });
  };

  const login = () => {
    props.login(user); // Call the login function from props
    navigate("/"); // Navigate to the home page
  };

  return (
    <div className="submit-form">
      <h4 className="mb-3">Login</h4>
      <div>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            required
            value={user.name}
            onChange={handleInputChange}
            name="name"
            placeholder="e.g. Jane Doe"
          />
        </div>

        <div className="form-group">
          <label htmlFor="id">ID</label>
          <input
            type="text"
            className="form-control"
            id="id"
            required
            value={user.id}
            onChange={handleInputChange}
            name="id"
            placeholder="e.g. jd123"
          />
        </div>

        <button
          onClick={login}
          className="btn btn-primary"
          disabled={!user.name || !user.id}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
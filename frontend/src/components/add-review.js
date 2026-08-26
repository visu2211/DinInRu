import React, { useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import RestaurantDataService from "../services/restaurant";

function AddReview({ user }) {
  const { id } = useParams(); // restaurant id
  const navigate = useNavigate();
  const location = useLocation();

  const currentReview = location.state?.currentReview || null;
  const isEditing = Boolean(currentReview);

  const [text, setText] = useState(currentReview?.text || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="form-card">
        <h5>You need to be logged in to leave a review.</h5>
        <Link to="/login" className="btn btn-primary mt-2">
          Go to Login
        </Link>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!text.trim()) {
      setError("Please write something before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (isEditing) {
        await RestaurantDataService.updateReview(currentReview._id, {
          text,
          user_id: user.id,
        });
      } else {
        await RestaurantDataService.createReview({
          restaurant_id: id,
          text,
          name: user.name,
          user_id: user.id,
        });
      }
      navigate(`/restaurants/${id}`);
    } catch (e) {
      console.error(e);
      setError("Something went wrong submitting your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-card">
      <h4>{isEditing ? "Edit Review" : "Add Review"}</h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="review-text">Your review</label>
          <textarea
            id="review-text"
            className="form-control"
            rows="5"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What did you think of this restaurant?"
          />
        </div>

        {error && <p className="text-danger mt-2">{error}</p>}

        <div className="row mt-3">
          <button
            type="submit"
            className="btn btn-primary col-lg-3 mx-1 mb-1"
            disabled={submitting}
          >
            {submitting ? "Saving..." : isEditing ? "Save Changes" : "Submit Review"}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary col-lg-3 mx-1 mb-1"
            onClick={() => navigate(`/restaurants/${id}`)}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddReview;

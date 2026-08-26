import React, { useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import RestaurantDataService from "../services/restaurant";
import { useAuth } from "../context/AuthContext";

function AddReview() {
  const { id } = useParams(); // restaurant id
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const currentReview = location.state?.currentReview || null;
  const isEditing = Boolean(currentReview);

  const [text, setText] = useState(currentReview?.text || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="mx-auto max-w-sm rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h1 className="mb-4 text-lg font-semibold text-neutral-900">
          You need to be logged in to leave a review.
        </h1>
        <Link
          to="/login"
          className="inline-block rounded-md bg-scarlet px-4 py-2 text-sm font-medium text-white hover:bg-scarlet-dark"
        >
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
        await RestaurantDataService.updateReview(currentReview._id, { text });
      } else {
        await RestaurantDataService.createReview({ restaurant_id: id, text });
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
    <div className="mx-auto max-w-lg rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-xl font-bold">{isEditing ? "Edit Review" : "Add Review"}</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="review-text" className="mb-1 block text-sm font-medium text-neutral-700">
          Your review
        </label>
        <textarea
          id="review-text"
          rows="5"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What did you think of this restaurant?"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-scarlet focus:outline-none focus:ring-1 focus:ring-scarlet"
        />

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-scarlet px-4 py-2 text-sm font-semibold text-white hover:bg-scarlet-dark disabled:opacity-60"
          >
            {submitting ? "Saving..." : isEditing ? "Save Changes" : "Submit Review"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/restaurants/${id}`)}
            disabled={submitting}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddReview;

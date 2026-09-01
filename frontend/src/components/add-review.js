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
      <div className="mx-auto max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <span className="text-3xl">🔒</span>
        <h1 className="mt-3 mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
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
    <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="h-1.5 bg-scarlet" />
      <div className="p-8">
        <div className="mb-6 text-center">
          <span className="text-3xl" role="img" aria-label="writing hand">
            ✍️
          </span>
          <h1 className="mt-2 text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {isEditing ? "Edit Review" : "Add Review"}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {isEditing
              ? "Update your thoughts below."
              : "Share your experience with other Scarlet Knights."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="review-text" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Your review
          </label>
          <textarea
            id="review-text"
            rows="5"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What did you think of this restaurant?"
            className="min-h-[140px] w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-scarlet focus:outline-none focus:ring-1 focus:ring-scarlet dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
          />

          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row-reverse sm:justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-scarlet px-6 py-2.5 text-sm font-semibold text-white hover:bg-scarlet-dark disabled:opacity-60 sm:w-auto"
            >
              {submitting ? "Saving..." : isEditing ? "Save Changes" : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/restaurants/${id}`)}
              disabled={submitting}
              className="text-sm font-medium text-neutral-500 hover:text-neutral-700 disabled:opacity-60 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddReview;

import React, { useState, useEffect } from "react";
import RestaurantDataService from "../services/restaurant";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Restaurant = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [error, setError] = useState("");

  const getRestaurant = (id) => {
    setError("");
    RestaurantDataService.get(id)
      .then((response) => {
        setRestaurant(response.data);
      })
      .catch((e) => {
        console.error(e);
        setError(
          e.response?.status === 404
            ? "We couldn't find that restaurant."
            : "We couldn't reach the server. Please try again."
        );
      });
  };

  useEffect(() => {
    getRestaurant(id);
  }, [id]);

  const deleteReview = (reviewId, index) => {
    RestaurantDataService.deleteReview(reviewId)
      .then(() => {
        setRestaurant((prevState) => {
          const reviews = [...prevState.reviews];
          reviews.splice(index, 1);
          return { ...prevState, reviews };
        });
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const backLink = (
    <Link
      to="/restaurants"
      className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-neutral-500 hover:text-scarlet dark:text-neutral-400"
    >
      <span aria-hidden="true">&larr;</span> All restaurants
    </Link>
  );

  if (error) {
    return (
      <div>
        {backLink}
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <span className="text-4xl">😕</span>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">{error}</p>
          <button onClick={() => getRestaurant(id)} className="btn-primary mt-5">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="animate-pulse">
        <div className="mb-5 h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="card h-48 p-8" />
      </div>
    );
  }

  const address = restaurant.address || {};
  const reviews = restaurant.reviews || [];
  const mapQuery = `${restaurant.name}, ${address.building || ""} ${address.street || ""}, New Brunswick, NJ ${
    address.zipcode || ""
  }`;

  return (
    <div>
      {backLink}

      <div className="card mb-10 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-scarlet to-scarlet-dark" />
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            {restaurant.cuisine && (
              <span className="mb-3 inline-block rounded-full bg-scarlet-light px-3 py-1 text-xs font-semibold text-scarlet-dark dark:bg-scarlet/20 dark:text-rose-300">
                {restaurant.cuisine}
              </span>
            )}
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
              {restaurant.name}
            </h1>
            <p className="mt-2 text-neutral-500 dark:text-neutral-400">
              {[address.building, address.street].filter(Boolean).join(" ")}
              {address.zipcode ? `, ${address.zipcode}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
              className="btn-secondary"
            >
              Directions
            </a>
            <Link to={`/restaurants/${id}/review`} className="btn-primary">
              Write a review
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-5 flex items-baseline gap-2">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Reviews</h2>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">({reviews.length})</span>
      </div>

      {reviews.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <div key={review._id || index} className="card flex flex-col p-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-scarlet-light text-sm font-bold text-scarlet-dark dark:bg-scarlet/20 dark:text-rose-300">
                  {review.name?.[0]?.toUpperCase() || "?"}
                </span>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{review.name}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date(review.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {review.text}
              </p>
              {user && user.id === review.user_id && (
                <div className="mt-auto flex gap-2 pt-4">
                  <Link
                    to={`/restaurants/${id}/review`}
                    state={{ currentReview: review }}
                    className="btn-secondary flex-1 py-1.5"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteReview(review._id, index)}
                    className="btn-secondary flex-1 py-1.5 text-red-600 hover:border-red-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <span className="text-4xl">✍️</span>
          <p className="mt-3 font-semibold text-neutral-800 dark:text-neutral-200">No reviews yet</p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Be the first to share what you thought.</p>
          <Link to={`/restaurants/${id}/review`} className="btn-primary mt-5">
            Write a review
          </Link>
        </div>
      )}
    </div>
  );
};

export default Restaurant;

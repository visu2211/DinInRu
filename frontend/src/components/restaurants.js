import React, { useState, useEffect } from "react";
import RestaurantDataService from "../services/restaurant";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Restaurant = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const initialRestaurantState = {
    id: null,
    name: "",
    address: {},
    cuisine: "",
    reviews: [],
  };
  const [restaurant, setRestaurant] = useState(initialRestaurantState);

  const getRestaurant = (id) => {
    RestaurantDataService.get(id)
      .then((response) => {
        setRestaurant(response.data);
      })
      .catch((e) => {
        console.error(e);
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

  if (!restaurant?.name) {
    return <p className="py-16 text-center text-neutral-500">Loading restaurant&hellip;</p>;
  }

  return (
    <div>
      <div className="mb-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <span className="mb-2 inline-block w-fit rounded-full bg-scarlet-light px-2.5 py-0.5 text-xs font-semibold text-scarlet-dark">
          {restaurant.cuisine}
        </span>
        <h1 className="text-2xl font-bold text-neutral-900">{restaurant.name}</h1>
        <p className="mt-1 mb-4 text-sm text-neutral-500">
          {restaurant.address.building} {restaurant.address.street}, {restaurant.address.zipcode}
        </p>
        <Link
          to={`/restaurants/${id}/review`}
          className="inline-block rounded-md bg-scarlet px-4 py-2 text-sm font-medium text-white hover:bg-scarlet-dark"
        >
          Add Review
        </Link>
      </div>

      <h2 className="mb-4 text-lg font-bold text-neutral-900">Reviews</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {restaurant.reviews.length > 0 ? (
          restaurant.reviews.map((review, index) => (
            <div key={index} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-neutral-800">{review.text}</p>
              <p className="mt-3 text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700">{review.name}</span> &middot;{" "}
                {new Date(review.date).toLocaleDateString()}
              </p>
              {user && user.id === review.user_id && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => deleteReview(review._id, index)}
                    className="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                  >
                    Delete
                  </button>
                  <Link
                    to={`/restaurants/${id}/review`}
                    state={{ currentReview: review }}
                    className="flex-1 rounded-md bg-scarlet px-3 py-1.5 text-center text-sm font-medium text-white hover:bg-scarlet-dark"
                  >
                    Edit
                  </Link>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-neutral-500 sm:col-span-2 lg:col-span-3">
            No reviews yet. Be the first to leave one!
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurant;

import React, { useState, useEffect } from "react";
import RestaurantDataService from "../services/restaurant";
import { Link, useParams } from "react-router-dom";
const Restaurant = (props) => {
  const { id } = useParams(); // Use useParams to access route params

  const initialRestaurantState = {
    id: null,
    name: "",
    address: {},
    cuisine: "",
    reviews: [],
  };
  const [restaurant, setRestaurant] = useState(initialRestaurantState);

  const getRestaurant = (id) => {
    console.log("Getting restaurant with id: ", id);
    RestaurantDataService.get(id)
      .then((response) => {
        setRestaurant(response.data);
        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    getRestaurant(id); // Use id from useParams
  }, [id]);

  const deleteReview = (reviewId, index) => {
    RestaurantDataService.deleteReview(reviewId, props.user.id)
      .then(response => {
        setRestaurant((prevState) => {
          prevState.reviews.splice(index, 1)
          return({
            ...prevState
          })
        })
      })
      .catch(e => {
        console.log(e);
      });
  };

  return (
    <div>
      {restaurant?.name ? (
        <div>
          <div className="restaurant-header">
            <span className="cuisine-badge">{restaurant.cuisine}</span>
            <h3>{restaurant.name}</h3>
            <p className="review-meta mb-3">
              {restaurant.address.building} {restaurant.address.street},{" "}
              {restaurant.address.zipcode}
            </p>
            <Link to={`/restaurants/${id}/review`} className="btn btn-primary">
              Add Review
            </Link>
          </div>

          <h4>Reviews</h4>
          <div className="row">
            {restaurant.reviews.length > 0 ? (
              restaurant.reviews.map((review, index) => {
                return (
                  <div className="col-lg-4 pb-3" key={index}>
                    <div className="card">
                      <div className="card-body">
                        <p className="card-text">{review.text}</p>
                        <p className="review-meta mb-2">
                          <strong>{review.name}</strong> &middot;{" "}
                          {new Date(review.date).toLocaleDateString()}
                        </p>
                        {props.user && props.user.id === review.user_id && (
                          <div className="row">
                            <button
                              onClick={() => deleteReview(review._id, index)}
                              className="btn btn-outline-secondary col-lg-5 mx-1 mb-1"
                            >
                              Delete
                            </button>
                            <Link
                              to={`/restaurants/${id}/review`}
                              state={{ currentReview: review }}
                              className="btn btn-primary col-lg-5 mx-1 mb-1"
                            >
                              Edit
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <p>No reviews yet. Be the first to leave one!</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="empty-state">Loading restaurant&hellip;</p>
      )}
    </div>
  );
};

export default Restaurant;

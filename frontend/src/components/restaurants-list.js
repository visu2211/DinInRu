import React, { useState, useEffect } from "react";
import RestaurantDataService from "../services/restaurant";
import { Link } from "react-router-dom";

const RestaurantsList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchZip, setSearchZip] = useState("");
  const [searchCuisine, setSearchCuisine] = useState("All Cuisines");
  const [cuisines, setCuisines] = useState(["All Cuisines"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    retrieveRestaurants();
    retrieveCuisines();
  }, []);

  const onChangeSearchName = (e) => setSearchName(e.target.value);
  const onChangeSearchZip = (e) => setSearchZip(e.target.value);
  const onChangeSearchCuisine = (e) => setSearchCuisine(e.target.value);

  const retrieveRestaurants = async () => {
    setLoading(true);
    try {
      const response = await RestaurantDataService.getAll();
      setRestaurants(response.data?.restaurants || []);
    } catch (error) {
      console.error("Failed to retrieve restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const retrieveCuisines = async () => {
    try {
      const response = await RestaurantDataService.getCuisines();
      setCuisines(["All Cuisines", ...(response.data || [])]);
    } catch (error) {
      console.error("Failed to retrieve cuisines:", error);
    }
  };

  const refreshList = () => retrieveRestaurants();

  const find = async (query, by) => {
    setLoading(true);
    try {
      const response = await RestaurantDataService.find(query, by);
      setRestaurants(response.data?.restaurants || []);
    } catch (error) {
      console.error(`Failed to search restaurants by ${by}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const findByName = () => searchName && find(searchName, "name");
  const findByZip = () => searchZip && find(searchZip, "zipcode");
  const findByCuisine = () => {
    if (searchCuisine === "All Cuisines") {
      refreshList();
    } else {
      find(searchCuisine, "cuisine");
    }
  };

  return (
    <div>
      <h2 className="mb-3">Find a Restaurant</h2>
      <div className="search-bar row">
        <div className="input-group col-lg-4 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name"
            value={searchName}
            onChange={onChangeSearchName}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={findByName}
            >
              Search
            </button>
          </div>
        </div>
        <div className="input-group col-lg-4 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by zip"
            value={searchZip}
            onChange={onChangeSearchZip}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={findByZip}
            >
              Search
            </button>
          </div>
        </div>
        <div className="input-group col-lg-4 mb-2">
          <select
            className="form-control"
            onChange={onChangeSearchCuisine}
            value={searchCuisine}
          >
            {cuisines.map((cuisine, index) => (
              <option key={index} value={cuisine}>
                {cuisine.substr(0, 20)}
              </option>
            ))}
          </select>
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={findByCuisine}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="empty-state">Loading restaurants&hellip;</p>
      ) : restaurants.length === 0 ? (
        <div className="empty-state">
          <h5>No restaurants found</h5>
          <p>Try a different name, zip code, or cuisine.</p>
        </div>
      ) : (
        <div className="row">
          {restaurants.map((restaurant, index) => {
            const address = `${restaurant?.address?.building || ""} ${
              restaurant?.address?.street || ""
            }, ${restaurant?.address?.zipcode || ""}`;
            return (
              <div key={index} className="col-lg-4 pb-3">
                <div className="card restaurant-card">
                  <div className="card-body">
                    <span className="cuisine-badge">{restaurant?.cuisine}</span>
                    <h5 className="card-title">{restaurant?.name}</h5>
                    <p className="card-text review-meta">{address}</p>
                    <div className="row">
                      <Link
                        to={`/restaurants/${restaurant?._id}`}
                        className="btn btn-primary col-lg-5 mx-1 mb-1"
                      >
                        View Reviews
                      </Link>
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://www.google.com/maps/place/${encodeURIComponent(
                          address
                        )}`}
                        className="btn btn-outline-secondary col-lg-5 mx-1 mb-1"
                      >
                        View Map
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RestaurantsList;

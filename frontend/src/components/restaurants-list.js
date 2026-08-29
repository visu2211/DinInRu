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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const inputClass =
    "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-scarlet focus:outline-none focus:ring-1 focus:ring-scarlet";
  const searchButtonClass =
    "rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100";

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Find a Restaurant</h1>

      <div className="mb-8 grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:grid-cols-3">
        <div className="flex gap-2">
          <input
            type="text"
            className={inputClass}
            placeholder="Search by name"
            value={searchName}
            onChange={onChangeSearchName}
          />
          <button type="button" className={searchButtonClass} onClick={findByName}>
            Go
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            className={inputClass}
            placeholder="Search by zip"
            value={searchZip}
            onChange={onChangeSearchZip}
          />
          <button type="button" className={searchButtonClass} onClick={findByZip}>
            Go
          </button>
        </div>

        <div className="flex gap-2">
          <select className={inputClass} onChange={onChangeSearchCuisine} value={searchCuisine}>
            {cuisines.map((cuisine, index) => (
              <option key={index} value={cuisine}>
                {cuisine.substr(0, 20)}
              </option>
            ))}
          </select>
          <button type="button" className={searchButtonClass} onClick={findByCuisine}>
            Go
          </button>
        </div>
      </div>

      {loading ? (
        <p className="py-16 text-center text-neutral-500">Loading restaurants&hellip;</p>
      ) : restaurants.length === 0 ? (
        <div className="py-16 text-center text-neutral-500">
          <h5 className="text-lg font-medium text-neutral-700">No restaurants found</h5>
          <p className="mt-1">Try a different name, zip code, or cuisine.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant, index) => {
            const address = `${restaurant?.address?.building || ""} ${
              restaurant?.address?.street || ""
            }, ${restaurant?.address?.zipcode || ""}`;
            const mapQuery = `${restaurant?.name || ""}, ${restaurant?.address?.building || ""} ${
              restaurant?.address?.street || ""
            }, New Brunswick, NJ ${restaurant?.address?.zipcode || ""}`;
            return (
              <div
                key={index}
                className="flex flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="mb-2 inline-block w-fit rounded-full bg-scarlet-light px-2.5 py-0.5 text-xs font-semibold text-scarlet-dark">
                  {restaurant?.cuisine}
                </span>
                <h5 className="text-base font-semibold text-neutral-900">{restaurant?.name}</h5>
                <p className="mt-1 text-sm text-neutral-500">{address}</p>
                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/restaurants/${restaurant?._id}`}
                    className="flex-1 rounded-md bg-scarlet px-3 py-2 text-center text-sm font-medium text-white hover:bg-scarlet-dark"
                  >
                    View Reviews
                  </Link>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                    className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-center text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                  >
                    View Map
                  </a>
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

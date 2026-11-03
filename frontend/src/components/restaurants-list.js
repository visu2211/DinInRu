import React, { useState, useEffect, useRef } from "react";
import RestaurantDataService from "../services/restaurant";
import { Link } from "react-router-dom";

// Free-tier API hosts sleep when idle; after this long we tell the user why it's slow.
const SLOW_REQUEST_MS = 4000;

const CUISINE_EMOJI = {
  american: "🍔",
  pizza: "🍕",
  italian: "🍝",
  chinese: "🥡",
  japanese: "🍣",
  sushi: "🍣",
  mexican: "🌮",
  indian: "🍛",
  thai: "🍜",
  korean: "🥘",
  vietnamese: "🍜",
  mediterranean: "🥙",
  greek: "🥙",
  "middle eastern": "🧆",
  cafe: "☕",
  coffee: "☕",
  bakery: "🥐",
  dessert: "🍰",
  "ice cream": "🍦",
  sandwich: "🥪",
  deli: "🥪",
  bagel: "🥯",
  burger: "🍔",
  chicken: "🍗",
  seafood: "🦞",
  breakfast: "🥞",
  vegetarian: "🥗",
  vegan: "🥗",
  salad: "🥗",
  bar: "🍺",
};

function cuisineEmoji(cuisine = "") {
  const c = cuisine.toLowerCase();
  const match = Object.keys(CUISINE_EMOJI).find((key) => c.includes(key));
  return match ? CUISINE_EMOJI[match] : "🍽️";
}

function RestaurantCard({ restaurant }) {
  const address = [
    [restaurant?.address?.building, restaurant?.address?.street].filter(Boolean).join(" "),
    restaurant?.address?.zipcode,
  ]
    .filter(Boolean)
    .join(", ");
  const mapQuery = `${restaurant?.name || ""}, ${restaurant?.address?.building || ""} ${
    restaurant?.address?.street || ""
  }, New Brunswick, NJ ${restaurant?.address?.zipcode || ""}`;

  return (
    <div className="card group flex flex-col p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-scarlet-light text-2xl dark:bg-scarlet/15">
          {cuisineEmoji(restaurant?.cuisine)}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-neutral-900 group-hover:text-scarlet dark:text-neutral-100">
            {restaurant?.name}
          </h3>
          {restaurant?.cuisine && (
            <span className="mt-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {restaurant.cuisine}
            </span>
          )}
        </div>
      </div>
      <p className="mt-4 flex items-start gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
        <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
          <circle cx="12" cy="9.5" r="2.5" />
        </svg>
        <span className="line-clamp-2">{address || "New Brunswick, NJ"}</span>
      </p>
      <div className="mt-auto flex gap-2 pt-5">
        <Link to={`/restaurants/${restaurant?._id}`} className="btn-primary flex-1 py-2">
          View reviews
        </Link>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
          className="btn-secondary py-2"
          aria-label={`Open ${restaurant?.name} in Google Maps`}
        >
          Map
        </a>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse p-5">
      <div className="flex gap-4">
        <div className="h-12 w-12 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-3 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>
      <div className="mt-5 h-3 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="mt-6 h-9 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
    </div>
  );
}

const RestaurantsList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchZip, setSearchZip] = useState("");
  const [searchCuisine, setSearchCuisine] = useState("All Cuisines");
  const [cuisines, setCuisines] = useState(["All Cuisines"]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  // The query behind the current results, so "Load more" fetches the next page of the same search.
  const lastQuery = useRef(null);

  useEffect(() => {
    retrieveRestaurants();
    retrieveCuisines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async (query, nextPage = 0) => {
    const append = nextPage > 0;
    append ? setLoadingMore(true) : setLoading(true);
    setError("");
    const slowTimer = setTimeout(() => setSlow(true), SLOW_REQUEST_MS);
    try {
      const response = query
        ? await RestaurantDataService.find(query.value, query.by, nextPage)
        : await RestaurantDataService.getAll(nextPage);
      const results = response.data?.restaurants || [];
      setRestaurants((prev) => (append ? [...prev, ...results] : results));
      setTotal(response.data?.total_results ?? results.length);
      setPage(nextPage);
      lastQuery.current = query;
    } catch (e) {
      console.error("Failed to retrieve restaurants:", e);
      setError(
        e.response?.status === 503
          ? "The server is still starting up. Give it a few seconds and try again."
          : "We couldn't reach the server. Check your connection and try again."
      );
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const retrieveRestaurants = () => load(null);

  const retrieveCuisines = async () => {
    try {
      const response = await RestaurantDataService.getCuisines();
      const list = Array.isArray(response.data) ? response.data.filter(Boolean).sort() : [];
      setCuisines(["All Cuisines", ...list]);
    } catch (e) {
      console.error("Failed to retrieve cuisines:", e);
    }
  };

  // The API filters on one field at a time: name wins, then zip, then cuisine.
  const currentQuery = (cuisine = searchCuisine) => {
    if (searchName.trim()) return { by: "name", value: searchName.trim() };
    if (searchZip.trim()) return { by: "zipcode", value: searchZip.trim() };
    if (cuisine !== "All Cuisines") return { by: "cuisine", value: cuisine };
    return null;
  };

  const onSearch = (e) => {
    e.preventDefault();
    load(currentQuery());
  };

  const onChangeCuisine = (e) => {
    const cuisine = e.target.value;
    setSearchCuisine(cuisine);
    if (!searchName.trim() && !searchZip.trim()) load(currentQuery(cuisine));
  };

  const clearFilters = () => {
    setSearchName("");
    setSearchZip("");
    setSearchCuisine("All Cuisines");
    load(null);
  };

  const hasFilters = searchName || searchZip || searchCuisine !== "All Cuisines";

  return (
    <div>
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-scarlet via-scarlet to-scarlet-dark px-6 py-10 text-white shadow-lift sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-black/10 blur-2xl" />
        <p className="relative text-sm font-semibold uppercase tracking-widest text-white/70">
          Rutgers &middot; New Brunswick
        </p>
        <h1 className="relative mt-2 max-w-xl text-3xl font-extrabold leading-tight sm:text-5xl">
          Find your next favorite spot.
        </h1>
        <p className="relative mt-3 max-w-lg text-white/80 sm:text-lg">
          Honest reviews of the restaurants around campus, written by fellow Scarlet Knights.
        </p>

        <form
          onSubmit={onSearch}
          className="relative mt-8 grid gap-2 rounded-2xl bg-white p-2 shadow-xl dark:bg-neutral-900 sm:grid-cols-[1.6fr_1fr_1.2fr_auto]"
        >
          <div className="relative">
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              className="input border-transparent pl-10 shadow-none dark:border-transparent"
              placeholder="Restaurant name"
              aria-label="Search by restaurant name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <input
            type="text"
            inputMode="numeric"
            className="input border-transparent shadow-none dark:border-transparent sm:border-l-neutral-200 dark:sm:border-l-neutral-700"
            placeholder="Zip code"
            aria-label="Search by zip code"
            value={searchZip}
            onChange={(e) => setSearchZip(e.target.value)}
          />
          <select
            className="input border-transparent shadow-none dark:border-transparent sm:border-l-neutral-200 dark:sm:border-l-neutral-700"
            aria-label="Filter by cuisine"
            onChange={onChangeCuisine}
            value={searchCuisine}
          >
            {cuisines.map((cuisine) => (
              <option key={cuisine} value={cuisine}>
                {cuisine.length > 28 ? `${cuisine.slice(0, 28)}…` : cuisine}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary px-6">
            Search
          </button>
        </form>
      </section>

      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {lastQuery.current ? "Search results" : "All restaurants"}
          </h2>
          {!loading && !error && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {total} {total === 1 ? "place" : "places"}
            </p>
          )}
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="text-sm font-semibold text-scarlet hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {slow && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Waking up the server. The first load after a quiet period can take up to a minute.
        </div>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <span className="text-4xl">😕</span>
          <h3 className="mt-3 text-lg font-bold text-neutral-900 dark:text-neutral-100">Couldn&apos;t load restaurants</h3>
          <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">{error}</p>
          <button onClick={() => load(lastQuery.current)} className="btn-primary mt-5">
            Try again
          </button>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <span className="text-4xl">🔍</span>
          <h3 className="mt-3 text-lg font-bold text-neutral-900 dark:text-neutral-100">No restaurants found</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Try a different name, zip code, or cuisine.</p>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-secondary mt-5">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
          {restaurants.length < total && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => load(lastQuery.current, page + 1)}
                disabled={loadingMore}
                className="btn-secondary px-6"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RestaurantsList;

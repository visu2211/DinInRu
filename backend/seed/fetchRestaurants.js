// Fetches real, currently-open restaurants in New Brunswick, NJ from the
// Google Places API (New) and (re)populates the `restaurants` collection.
// Re-runnable any time to refresh the data.
//
// Usage: node seed/fetchRestaurants.js   (reads GOOGLE_PLACES_API_KEY and
// RESTREVIEWS_DB_URI / RESTREVIEWS_NS from .env)

import mongodb from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MongoClient = mongodb.MongoClient;
const PLACES_URL = "https://places.googleapis.com/v1/places:searchText";
const TARGET_LOCALITY = "new brunswick";

// Several overlapping queries so we cover more than a single search's
// ~60-result cap and catch spots concentrated on specific strips.
const QUERIES = [
  "restaurants in New Brunswick, NJ",
  "restaurants on College Avenue, New Brunswick, NJ",
  "restaurants on Easton Avenue, New Brunswick, NJ",
  "restaurants on George Street, New Brunswick, NJ",
  "restaurants on Livingston Avenue, New Brunswick, NJ",
  "restaurants near Rutgers University, New Brunswick, NJ",
  "restaurants in downtown New Brunswick, NJ",
];

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.addressComponents",
  "places.primaryType",
  "places.types",
  "places.businessStatus",
].join(",");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function titleCaseFromType(type) {
  if (!type) return null;
  return type
    .replace(/_/g, " ")
    .replace(/\brestaurant\b/i, "")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

const GENERIC_TYPES = new Set([
  "restaurant",
  "food",
  "point_of_interest",
  "establishment",
  "meal_takeaway",
  "meal_delivery",
]);

// Places Text Search for "restaurants" occasionally surfaces non-restaurant
// venues (a liquor store next to a bar, a student org's listing, etc).
// Exclude anything whose primary type makes clear it isn't a place to eat.
const EXCLUDED_PRIMARY_TYPES = new Set([
  "liquor_store",
  "grocery_store",
  "supermarket",
  "convenience_store",
  "event_venue",
  "banquet_hall",
  "wedding_venue",
  "association_or_organization",
]);

function deriveCuisine(place) {
  const candidates = [place.primaryType, ...(place.types || [])];
  for (const type of candidates) {
    if (type && !GENERIC_TYPES.has(type)) {
      const label = titleCaseFromType(type);
      if (label) return label;
    }
  }
  return "Restaurant";
}

function extractAddress(place) {
  const components = place.addressComponents || [];
  const get = (type) => components.find((c) => c.types.includes(type))?.longText;

  const building = get("street_number") || "";
  const street = get("route") || "";
  const zipcode = get("postal_code") || "";
  const locality = get("locality") || get("sublocality") || "";

  return { building, street, zipcode, locality };
}

async function searchQuery(apiKey, textQuery) {
  const results = [];
  let pageToken;

  for (let page = 0; page < 3; page++) {
    const body = { textQuery, pageSize: 20 };
    if (pageToken) body.pageToken = pageToken;

    const res = await fetch(PLACES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Places API error (${res.status}) for "${textQuery}": ${text}`);
    }

    const data = await res.json();
    results.push(...(data.places || []));

    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
    await sleep(2000); // token needs a moment to become valid
  }

  return results;
}

async function fetchAllRestaurants(apiKey) {
  const byId = new Map();
  const skippedOutOfTown = [];
  const skippedClosed = [];
  const skippedNonRestaurant = [];

  for (const query of QUERIES) {
    const places = await searchQuery(apiKey, query);
    for (const place of places) {
      if (byId.has(place.id)) continue;

      if (place.businessStatus && place.businessStatus !== "OPERATIONAL") {
        skippedClosed.push(place.displayName?.text);
        continue;
      }

      if (EXCLUDED_PRIMARY_TYPES.has(place.primaryType)) {
        skippedNonRestaurant.push(place.displayName?.text);
        continue;
      }

      const { building, street, zipcode, locality } = extractAddress(place);
      if (locality.toLowerCase() !== TARGET_LOCALITY) {
        skippedOutOfTown.push(`${place.displayName?.text} (${locality || "unknown"})`);
        continue;
      }

      byId.set(place.id, {
        name: place.displayName?.text,
        cuisine: deriveCuisine(place),
        address: { building, street, zipcode },
      });
    }
  }

  console.log(`Fetched ${byId.size} unique, open, New Brunswick restaurants.`);
  if (skippedClosed.length) {
    console.log(`Skipped ${skippedClosed.length} closed listings: ${skippedClosed.join(", ")}`);
  }
  if (skippedNonRestaurant.length) {
    console.log(
      `Skipped ${skippedNonRestaurant.length} non-restaurant listings: ${skippedNonRestaurant.join(", ")}`
    );
  }
  if (skippedOutOfTown.length) {
    console.log(
      `Skipped ${skippedOutOfTown.length} results outside New Brunswick: ${skippedOutOfTown.join(", ")}`
    );
  }

  return [...byId.values()];
}

async function main() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const dbUri = process.env.RESTREVIEWS_DB_URI;
  if (!apiKey) {
    console.error("GOOGLE_PLACES_API_KEY is not set");
    process.exit(1);
  }
  if (!dbUri) {
    console.error("RESTREVIEWS_DB_URI is not set");
    process.exit(1);
  }

  const restaurants = await fetchAllRestaurants(apiKey);
  if (restaurants.length === 0) {
    console.error("No restaurants fetched — aborting without touching the database.");
    process.exit(1);
  }

  const client = await MongoClient.connect(dbUri);
  try {
    const db = client.db(process.env.RESTREVIEWS_NS);
    const collection = db.collection("restaurants");

    await collection.deleteMany({});
    await collection.insertMany(restaurants);
    await collection.createIndex({ name: "text" });

    console.log(`Seeded ${restaurants.length} restaurants and created the name text index.`);
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error("Fetch/seed failed:", e);
  process.exit(1);
});

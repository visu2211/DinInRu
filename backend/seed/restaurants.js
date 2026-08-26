// One-off script: (re)populates the `restaurants` collection with real,
// currently-operating New Brunswick / Rutgers-area restaurants, and creates
// the text index restaurantsDAO.getRestaurants relies on for name search.
//
// Usage: node seed/restaurants.js   (reads RESTREVIEWS_DB_URI / RESTREVIEWS_NS from .env)

import mongodb from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MongoClient = mongodb.MongoClient;

const restaurants = [
  {
    name: "Old Man Rafferty's",
    cuisine: "American",
    address: { building: "106", street: "Albany St", zipcode: "08901" },
  },
  {
    name: "Stuff Yer Face",
    cuisine: "American",
    address: { building: "49", street: "Easton Ave", zipcode: "08901" },
  },
  {
    name: "Efes Mediterranean Grill",
    cuisine: "Mediterranean",
    address: { building: "32", street: "Easton Ave", zipcode: "08901" },
  },
  {
    name: "Harvest Moon Brewery & Cafe",
    cuisine: "American",
    address: { building: "392", street: "George St", zipcode: "08901" },
  },
  {
    name: "The Frog and the Peach",
    cuisine: "American",
    address: { building: "29", street: "Dennis St", zipcode: "08901" },
  },
  {
    name: "Catherine Lombardi",
    cuisine: "Italian",
    address: { building: "3", street: "Livingston Ave", zipcode: "08901" },
  },
  {
    name: "Hansel 'n Griddle",
    cuisine: "American",
    address: { building: "130", street: "Easton Ave", zipcode: "08901" },
  },
  {
    name: "Nirvanis Indian Kitchen",
    cuisine: "Indian",
    address: { building: "68", street: "Easton Ave", zipcode: "08901" },
  },
  {
    name: "RU Hungry",
    cuisine: "American",
    address: { building: "58", street: "College Ave", zipcode: "08901" },
  },
  {
    name: "Daniel's Pizzeria",
    cuisine: "Pizza",
    address: { building: "204", street: "Easton Ave", zipcode: "08901" },
  },
  {
    name: "Krispy Pizza",
    cuisine: "Pizza",
    address: { building: "50", street: "College Ave", zipcode: "08901" },
  },
  {
    name: "Tacoria",
    cuisine: "Mexican",
    address: { building: "56A", street: "Easton Ave", zipcode: "08901" },
  },
  {
    name: "Sakana Sushi & Japanese Cuisine",
    cuisine: "Japanese",
    address: { building: "338", street: "George St", zipcode: "08901" },
  },
];

async function seed() {
  const dbUri = process.env.RESTREVIEWS_DB_URI;
  if (!dbUri) {
    console.error("RESTREVIEWS_DB_URI is not set");
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

seed().catch((e) => {
  console.error("Seeding failed:", e);
  process.exit(1);
});

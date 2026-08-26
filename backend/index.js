import app from "./server.js";
import mongodb from "mongodb";
import dotenv from "dotenv";
import ReviewsDAO from "./dao/reviewsDAO.js";
import RestaurantsDAO from "./dao/restaurantsDAO.js";

dotenv.config();

const MongoClient = mongodb.MongoClient;
const port = process.env.PORT || 8000;
const dbUri = process.env.RESTREVIEWS_DB_URI;

if (!dbUri) {
  console.error("Database URI is not set in environment variables");
  process.exit(1);
}

MongoClient.connect(dbUri)
  .catch((err) => {
    console.error("Failed to connect to the database", err.stack);
    process.exit(1);
  })
  .then(async (client) => {
    await RestaurantsDAO.injectDB(client);
    await ReviewsDAO.injectDB(client);
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });

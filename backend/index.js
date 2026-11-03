import app, { setDbReady } from "./server.js";
import mongodb from "mongodb";
import dotenv from "dotenv";
import ReviewsDAO from "./dao/reviewsDAO.js";
import RestaurantsDAO from "./dao/restaurantsDAO.js";
import UsersDAO from "./dao/usersDAO.js";

dotenv.config();

const MongoClient = mongodb.MongoClient;
const port = process.env.PORT || 8000;
const dbUri = process.env.RESTREVIEWS_DB_URI;
const RETRY_DELAY_MS = 10000;

if (!dbUri) {
  console.error("Database URI is not set in environment variables");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set in environment variables");
  process.exit(1);
}

// Listen right away so the host sees a live port and requests get a fast
// 503 (instead of hanging) while the database connection is being set up.
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

async function connectToDb() {
  try {
    const client = await MongoClient.connect(dbUri, {
      serverSelectionTimeoutMS: 15000,
    });
    await RestaurantsDAO.injectDB(client);
    await ReviewsDAO.injectDB(client);
    await UsersDAO.injectDB(client);
    setDbReady(true);
    console.log("connected to database");
  } catch (err) {
    // Strip anything that looks like a connection string so credentials never leak.
    setDbReady(false, `${err.name}: ${err.message}`.replace(/mongodb(\+srv)?:\/\/\S+/g, "<uri>"));
    console.error(
      `Failed to connect to the database, retrying in ${RETRY_DELAY_MS / 1000}s:`,
      err.message
    );
    setTimeout(connectToDb, RETRY_DELAY_MS);
  }
}

connectToDb();

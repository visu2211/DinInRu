import express from "express";
import RestaurantsCtrl from "./restaurants.controller.js";
import ReviewsCtrl from "./reviews.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.route("/").get(RestaurantsCtrl.apiGetRestaurants);
router.route("/id/:id").get(RestaurantsCtrl.apiGetRestaurantById);
router.route("/cuisines").get(RestaurantsCtrl.apiGetRestaurantCuisines);

router
  .route("/review")
  .post(auth, ReviewsCtrl.apiPostReview)
  .put(auth, ReviewsCtrl.apiUpdateReview)
  .delete(auth, ReviewsCtrl.apiDeleteReview);

export default router;

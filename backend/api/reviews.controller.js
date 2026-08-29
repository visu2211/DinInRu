import ReviewsDAO from "../dao/reviewsDAO.js";

export default class ReviewsController {
  static async apiPostReview(req, res, next) {
    try {
      const restaurantId = req.body.restaurant_id;
      const review = req.body.text;
      const userInfo = {
        name: req.user.name,
        _id: req.user.id,
      };
      const date = new Date();

      const ReviewResponse = await ReviewsDAO.addReview(
        restaurantId,
        userInfo,
        review,
        date
      );
      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiUpdateReview(req, res, next) {
    try {
      const reviewId = req.body.review_id;
      const text = req.body.text;
      const date = new Date();

      const reviewResponse = await ReviewsDAO.updateReview(
        reviewId,
        req.user.id,
        text,
        date
      );

      var { error } = reviewResponse;
      if (error) {
        return res.status(400).json({ error });
      }

      if (reviewResponse.modifiedCount === 0) {
        return res.status(403).json({
          error: "unable to update review - user may not be original poster",
        });
      }

      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiDeleteReview(req, res, next) {
    try {
      const reviewId = req.query.id;
      const reviewResponse = await ReviewsDAO.deleteReview(reviewId, req.user.id);

      if (reviewResponse.deletedCount === 0) {
        return res.status(403).json({
          error: "unable to delete review - user may not be original poster",
        });
      }

      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
}

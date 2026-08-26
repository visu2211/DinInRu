import http from "../http-common";

class RestaurantDataService {
  getAll(page = 0) {
    return http.get(`?page=${page}`);
  }

  get(id) {
    return http.get(`/id/${id}`);
  }

  find(query, by = "name", page = 0) {
    return http.get(`?${by}=${query}&page=${page}`);
  }

  createReview(data) {
    return http.post("/review", data);
  }

  updateReview(id, data) {
    // Backend reads the review id from the body (`review_id`), not the query string.
    return http.put(`/review`, { ...data, review_id: id });
  }

  deleteReview(id, userId) {
    // Backend route is DELETE /review?id=... (there is no /review-delete route).
    return http.delete(`/review?id=${id}`, {
      data: { user_id: userId },
    });
  }
  getCuisines() {
    return http.get(`/cuisines`);
  }
}

const restaurantDataService = new RestaurantDataService();

export default restaurantDataService;

import http from "../http-common";

class RestaurantDataService {
  getAll(page = 0) {
    return http.get(`/restaurants?page=${page}`);
  }

  get(id) {
    return http.get(`/restaurants/id/${id}`);
  }

  find(query, by = "name", page = 0) {
    return http.get(`/restaurants?${by}=${query}&page=${page}`);
  }

  createReview(data) {
    return http.post("/restaurants/review", data);
  }

  updateReview(id, data) {
    // Backend reads the review id from the body (`review_id`), not the query string.
    return http.put(`/restaurants/review`, { ...data, review_id: id });
  }

  deleteReview(id) {
    // The acting user is derived server-side from the auth token, not sent by the client.
    return http.delete(`/restaurants/review?id=${id}`);
  }

  getCuisines() {
    return http.get(`/restaurants/cuisines`);
  }
}

const restaurantDataService = new RestaurantDataService();

export default restaurantDataService;

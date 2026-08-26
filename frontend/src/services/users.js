import http from "../http-common";

class UsersDataService {
  register({ name, email, password }) {
    return http.post("/users/register", { name, email, password });
  }

  login({ email, password }) {
    return http.post("/users/login", { email, password });
  }

  me() {
    return http.get("/users/me");
  }
}

const usersDataService = new UsersDataService();

export default usersDataService;

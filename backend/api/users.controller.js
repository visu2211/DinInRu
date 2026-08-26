import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UsersDAO from "../dao/usersDAO.js";

const TOKEN_TTL = "7d";

function issueToken(user) {
  return jwt.sign({ id: user._id.toString(), name: user.name }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_TTL,
  });
}

export default class UsersController {
  static async apiRegister(req, res) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "name, email, and password are required" });
      }
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      const existing = await UsersDAO.getUserByEmail(email.toLowerCase());
      if (existing) {
        return res.status(409).json({ error: "An account with that email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const { insertedId } = await UsersDAO.createUser(name, email.toLowerCase(), passwordHash);

      const user = { _id: insertedId, name };
      res.status(201).json({ token: issueToken(user), user: { id: insertedId, name } });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiLogin(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
      }

      const user = await UsersDAO.getUserByEmail(email.toLowerCase());
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      res.json({ token: issueToken(user), user: { id: user._id, name: user.name } });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiGetMe(req, res) {
    res.json({ user: req.user });
  }
}

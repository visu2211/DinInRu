import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;
let users;

export default class UsersDAO {
  static async injectDB(conn) {
    if (users) {
      return;
    }
    try {
      users = await conn.db(process.env.RESTREVIEWS_NS).collection("users");
      await users.createIndex({ email: 1 }, { unique: true });
    } catch (e) {
      console.error(`Unable to establish a collection handle in usersDAO: ${e}`);
    }
  }

  static async getUserByEmail(email) {
    return users.findOne({ email });
  }

  static async getUserById(id) {
    return users.findOne({ _id: new ObjectId(id) });
  }

  static async createUser(name, email, passwordHash) {
    return users.insertOne({
      name,
      email,
      passwordHash,
      createdAt: new Date(),
    });
  }
}

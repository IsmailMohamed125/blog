const request = require("supertest");
const app = require("../app");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const endpoints = require("../endpoints.json");

beforeAll(async () => {
  await seed(data);
});

describe("All Bad Endpoints", () => {
  test("GET:404 - Responds with a status of 404 and a message of 'Route not found!'", async () => {
    const {
      body: { msg },
    } = await request(app).get("/api/BAD-ENDPOINT").expect(404);
    expect(msg).toBe("Route not found!");
  });
  test("POST:404 - Responds with a status of 404 and a message of 'Route not found!'", async () => {
    const {
      body: { msg },
    } = await request(app).post("/api/BAD-ENDPOINT").send({}).expect(404);
    expect(msg).toBe("Route not found!");
  });
  test("PATCH:404 - Responds with a status of 404 and a message of 'Route not found!'", async () => {
    const {
      body: { msg },
    } = await request(app).patch("/api/BAD-ENDPOINT").send({}).expect(404);
    expect(msg).toBe("Route not found!");
  });
  test("DELETE:404 - Responds with a status of 404 and a message of 'Route not found!'", async () => {
    const {
      body: { msg },
    } = await request(app).delete("/api/BAD-ENDPOINT").expect(404);
    expect(msg).toBe("Route not found!");
  });
});

describe("API Endpoint", () => {
  describe("GET:/api", () => {
    test("GET:200 - Responds with an object detailing all of the available API endpoints", async () => {
      const { body } = await request(app).get("/api").expect(200);
      expect(body.endpoints).toEqual(endpoints);
    });
  });
});

describe("AUTH Endpoint", () => {
  describe("POST:/api/auth/signup", () => {
    test("POST:201 - Responds with a new user object with an id, username and avatar", async () => {
      const {
        body: { data },
      } = await request(app)
        .post("/api/auth/signup")
        .send({
          username: "test",
          email: "test1@gmail.com",
          password: "test.1234",
          confirmPassword: "test.1234",
        })
        .expect(201);
      expect(data).toMatchObject({
        id: expect.any(String),
        username: "test",
        avatar: "https://avatar.iran.liara.run/username?username=test",
      });
    });
    test("POST:400 - Responds with an error when attempting to POST request with a body that does not contain the correct fields", async () => {
      const {
        body: { errors },
      } = await request(app).post("/api/auth/signup").send({}).expect(400);
      expect(errors).toEqual([
        {
          type: "field",
          msg: "Username is required",
          path: "username",
          location: "body",
        },
        {
          type: "field",
          msg: "Must be a valid email",
          path: "email",
          location: "body",
        },
        {
          type: "field",
          msg: "Password must be at least 8 characters long",
          path: "password",
          location: "body",
        },
        {
          type: "field",
          msg: "Password must contain at least one number",
          path: "password",
          location: "body",
        },
        {
          type: "field",
          msg: "Password must contain at least one special character",
          path: "password",
          location: "body",
        },
      ]);
    });
    test("POST:400 - Responds with an error when attempting to POST request with a username that already exists in the database", async () => {
      const {
        body: { msg },
      } = await request(app)
        .post("/api/auth/signup")
        .send({
          username: "jedvyes",
          email: "test123@gmail.com",
          password: "test.1234",
          confirmPassword: "test.1234",
        })
        .expect(400);
      expect(msg).toBe("Username already exists");
    });
    test("POST:400 - Responds with an error when attempting to POST request with an email that already exists in the database", async () => {
      const {
        body: { msg },
      } = await request(app)
        .post("/api/auth/signup")
        .send({
          username: "test123",
          email: "jedvyes@gmail.com",
          password: "test.1234",
          confirmPassword: "test.1234",
        })
        .expect(400);
      expect(msg).toBe("Email already exists");
    });
  });
  describe("POST:/api/auth/login", () => {
    test("POST:200 - Responds with a user object with an id, username and avatar", async () => {
      const {
        body: { data },
      } = await request(app)
        .post("/api/auth/login")
        .send({
          username: "jedvyes",
          password: "password.1234",
        })
        .expect(200);
      expect(data).toMatchObject({
        id: expect.any(String),
        username: "jedvyes",
        avatar: "https://avatar.iran.liara.run/username?username=jedvyes",
      });
    });
    test("POST:400 - Responds with an error when attempting to POST request with an invalid username", async () => {
      const {
        body: { msg },
      } = await request(app)
        .post("/api/auth/login")
        .send({
          username: "badUser",
          password: "password.1234",
        })
        .expect(400);
      expect(msg).toBe("Invalid username");
    });
    test("POST:400 - Responds with an error when attempting to POST request with an invalid password", async () => {
      const {
        body: { msg },
      } = await request(app)
        .post("/api/auth/login")
        .send({
          username: "jedvyes",
          password: "badPassword",
        })
        .expect(400);
      expect(msg).toBe("Invalid password");
    });
  });
  describe("POST:/api/auth/logout", () => {
    test("POST:200 - Responds with a message indicating a successful logout", async () => {
      const {
        body: { msg },
      } = await request(app).post("/api/auth/logout").expect(200);
      expect(msg).toBe("Logged out successfully");
    });
    test("POST:200 - Should clear the jwt cookie", async () => {
      const response = await request(app).post("/api/auth/logout").expect(200);

      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();

      const jwtCookie = cookies.find((cookie) => cookie.startsWith("jwt="));
      expect(jwtCookie).toBeDefined();
      expect(jwtCookie).toMatch(/jwt=;/);
      expect(jwtCookie).toMatch(/Max-Age=0/);
    });
  });
});

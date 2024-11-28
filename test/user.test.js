const request = require("supertest");
const app = require("../server"); // Ensure your Express app is properly exported
const User = require("../models/User");
const mongoose = require("mongoose");

beforeAll(async () => {
    // Connect to in-memory MongoDB
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
    // Clear the database after each test
    await User.deleteMany();
});

afterAll(async () => {
    // Disconnect and close MongoDB connection
    await mongoose.connection.close();
});

describe("User Registration Tests", () => {
    it("should return 400 if any required field is missing", async () => {
        const res = await request(app).post("/api/users/register").send({
            username: "testuser",
            email: "", // Missing email
            password: "password123",
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("All fields are required");
        expect(res.body.missingFields.email).toBe(true);
    });

    it("should return 400 if the email is invalid", async () => {
        const res = await request(app).post("/api/users/register").send({
            username: "testuser",
            email: "invalidemail", // Invalid email format
            password: "password123",
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Invalid email/); // Adjust based on your validation error message
    });

    it("should return 400 if the email or username already exists", async () => {
        await User.create({
            username: "testuser",
            email: "test@example.com",
            password: "hashedpassword", // Mock hashed password
        });

        const res = await request(app).post("/api/users/register").send({
            username: "testuser",
            email: "test@example.com",
            password: "password123",
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/already in use|exists/);
    });

    it("should return 201 and create a user for valid input", async () => {
        const res = await request(app).post("/api/users/register").send({
            username: "newuser",
            email: "newuser@example.com",
            password: "password123",
        });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe("User registered successfully");
        expect(res.body.user).toHaveProperty("id");
        expect(res.body.user.email).toBe("newuser@example.com");
    });
});

describe("User Login Tests", () => {
    beforeEach(async () => {
        // Create a test user
        const hashedPassword = await bcrypt.hash("password123", 10);
        await User.create({
            username: "testuser",
            email: "test@example.com",
            password: hashedPassword,
        });
    });

    it("should return 400 if email or password is missing", async () => {
        const res = await request(app).post("/api/users/login").send({
            email: "", // Missing email
            password: "password123",
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("All fields are required");
    });

    it("should return 400 if the email does not exist", async () => {
        const res = await request(app).post("/api/users/login").send({
            email: "nonexistent@example.com",
            password: "password123",
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid email or password");
    });

    it("should return 400 if the password is incorrect", async () => {
        const res = await request(app).post("/api/users/login").send({
            email: "test@example.com",
            password: "wrongpassword",
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid email or password");
    });

    it("should return 200 and a token for valid credentials", async () => {
        const res = await request(app).post("/api/users/login").send({
            email: "test@example.com",
            password: "password123",
        });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Login successful");
        expect(res.body).toHaveProperty("token");
        expect(res.body.user.email).toBe("test@example.com");
    });
});

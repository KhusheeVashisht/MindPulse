const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { get, run } = require("../database/db");

const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET || "mindpulse-dev-secret",
    { expiresIn: "7d" }
  );

router.post("/register", async (request, response) => {
  const { name, email, password } = request.body;

  if (!name || !email || !password) {
    return response.status(400).json({ message: "Name, email, and password are required." });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await get("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
    if (existingUser) {
      return response.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await run(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name.trim(), normalizedEmail, passwordHash]
    );

    const user = {
      id: result.id,
      name: name.trim(),
      email: normalizedEmail,
    };

    return response.status(201).json({
      message: "Registration successful.",
      token: signToken(user),
      user,
    });
  } catch (error) {
    console.error("Register error:", error);
    return response.status(500).json({ message: "Unable to register user right now." });
  }
});

router.post("/login", async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response.status(400).json({ message: "Email and password are required." });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await get("SELECT id, name, email, password_hash FROM users WHERE email = ?", [
      normalizedEmail,
    ]);

    if (!user) {
      return response.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return response.status(401).json({ message: "Invalid email or password." });
    }

    return response.json({
      message: "Login successful.",
      token: signToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return response.status(500).json({ message: "Unable to login right now." });
  }
});

module.exports = router;

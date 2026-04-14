const jwt = require("jsonwebtoken");

const authMiddleware = (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(401).json({ message: "Authentication token is missing." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mindpulse-dev-secret");
    request.user = decoded;
    next();
  } catch (error) {
    return response.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;

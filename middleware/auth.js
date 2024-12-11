import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
  console.log("Request Headers: ", req.headers);

  const token = req.headers["authorization"]?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied" });
  }

  console.log("Received Token: ", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded Token: ", decoded);

    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

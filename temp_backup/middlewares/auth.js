// src/middleware/auth.js
import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  // Get token from Authorization header (Bearer <token>)
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Remove 'Bearer ' prefix
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Verify token using JWT_SECRET to check signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user data (id and role) to request object
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

export default auth;

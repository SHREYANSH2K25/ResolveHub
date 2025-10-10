// src/services/authService.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * Hash a password using bcrypt
 * @param {string} password
 * @returns {Promise<string>} hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare plain password with hashed password
 * @param {string} inputPassword
 * @param {string} storedHash
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (inputPassword, storedHash) => {
  return await bcrypt.compare(inputPassword, storedHash);
};

/**
 * Generate JWT token for authenticated user
 * @param {string} userId
 * @param {string} userRole
 * @returns {string} JWT token
 */
export const generateToken = (userId, userRole) => {
  const payload = {
    user: {
      id: userId,
      role: userRole,
    },
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};

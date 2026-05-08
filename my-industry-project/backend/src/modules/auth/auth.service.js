import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { query } from "../../config/database.js";

// LOGIN
const login = async ({ email, password }) => {
  const sql = `
    SELECT id, email, password
    FROM users
    WHERE email = $1
  `;

  const { rows } = await query(sql, [email]);

  if (rows.length === 0) {
    return null;
  }

  const user = rows[0];

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  // Generate JWT
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  };
};

// SIGNUP
const signup = async ({ firstName, lastName, email, mobileNo, password }) => {
  // 1. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 2. Insert into DB
  const sql = `
    INSERT INTO users(first_name, last_name, email, mobile_no, password)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, first_name, last_name, email, mobile_no
  `;

  const values = [firstName, lastName, email, mobileNo, hashedPassword];

  const { rows } = await query(sql, values);

  return rows[0];
};

export default {
  login,
  signup,
};

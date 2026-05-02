import { Request, Response } from "express";
import { pool } from "../config/db";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password, name) VALUES ($1,$2,$3) RETURNING id",
      [email, hashed, name || email.split("@")[0]]
    );

    const token = generateToken(result.rows[0].id);
    res.status(201).json({ token, message: "Account created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (result.rows.length === 0) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      res.status(400).json({ message: "Incorrect password" });
      return;
    }

    const token = generateToken(user.id);
    res.json({ token, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const getMe = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const result = await pool.query("SELECT id, email, name FROM users WHERE id=$1", [req.user.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

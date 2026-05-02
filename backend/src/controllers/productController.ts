import { Request, Response } from "express";
import { pool } from "../config/db";

export const getProducts = async (_: Request, res: Response): Promise<void> => {
  try {
    const data = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
    res.json(data.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await pool.query("SELECT * FROM products WHERE id=$1", [id]);
    if (data.rows.length === 0) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.json(data.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

export const addProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, price, quantity, category } = req.body;

    if (!name || price === undefined || quantity === undefined) {
      res.status(400).json({ message: "Name, price, and quantity are required" });
      return;
    }

    const result = await pool.query(
      "INSERT INTO products (name, price, quantity, category) VALUES ($1,$2,$3,$4) RETURNING *",
      [name, parseFloat(price), parseInt(quantity), category || "General"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add product" });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, price, quantity, category } = req.body;

    const result = await pool.query(
      "UPDATE products SET name=$1, price=$2, quantity=$3, category=$4, updated_at=NOW() WHERE id=$5 RETURNING *",
      [name, parseFloat(price), parseInt(quantity), category, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to update product" });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM products WHERE id=$1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product" });
  }
};

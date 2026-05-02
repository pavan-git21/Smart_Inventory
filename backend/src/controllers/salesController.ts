import { Request, Response } from "express";
import { pool } from "../config/db";

export const addSale = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    const userId = (req as any).user.id;
    const { product_id, quantity, note } = req.body;

    if (!product_id || !quantity) {
      res.status(400).json({ message: "Product ID and quantity are required" });
      return;
    }

    await client.query("BEGIN");

    // make sure product belongs to this user
    const product = await client.query(
      "SELECT * FROM products WHERE id=$1 AND user_id=$2 FOR UPDATE",
      [product_id, userId]
    );

    if (product.rows.length === 0) {
      await client.query("ROLLBACK");
      res.status(404).json({ message: "Product not found" });
      return;
    }

    if (product.rows[0].quantity < parseInt(quantity)) {
      await client.query("ROLLBACK");
      res.status(400).json({ message: "Not enough stock" });
      return;
    }

    const saleResult = await client.query(
      "INSERT INTO sales (user_id, product_id, quantity, note) VALUES ($1,$2,$3,$4) RETURNING *",
      [userId, product_id, parseInt(quantity), note || null]
    );

    await client.query(
      "UPDATE products SET quantity = quantity - $1, updated_at=NOW() WHERE id=$2 AND user_id=$3",
      [parseInt(quantity), product_id, userId]
    );

    await client.query("COMMIT");
    res.status(201).json(saleResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Failed to record sale" });
  } finally {
    client.release();
  }
};

export const getSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const data = await pool.query(
      `SELECT s.id, s.quantity, s.note, s.created_at,
              p.name as product_name, p.price, p.category,
              (s.quantity * p.price) as revenue
       FROM sales s
       JOIN products p ON p.id = s.product_id
       WHERE s.user_id=$1
       ORDER BY s.created_at DESC
       LIMIT 100`,
      [userId]
    );
    res.json(data.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sales" });
  }
};

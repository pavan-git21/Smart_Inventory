import { Request, Response } from "express";
import { pool } from "../config/db";

export const addSale = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    const { product_id, quantity, note } = req.body;

    if (!product_id || !quantity) {
      res.status(400).json({ message: "Product ID and quantity are required" });
      return;
    }

    await client.query("BEGIN");

    const product = await client.query("SELECT * FROM products WHERE id=$1 FOR UPDATE", [product_id]);

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
      "INSERT INTO sales (product_id, quantity, note) VALUES ($1,$2,$3) RETURNING *",
      [product_id, parseInt(quantity), note || null]
    );

    await client.query(
      "UPDATE products SET quantity = quantity - $1, updated_at=NOW() WHERE id=$2",
      [parseInt(quantity), product_id]
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

export const getSales = async (_: Request, res: Response): Promise<void> => {
  try {
    const data = await pool.query(`
      SELECT s.id, s.quantity, s.note, s.created_at,
             p.name as product_name, p.price, p.category,
             (s.quantity * p.price) as revenue
      FROM sales s
      JOIN products p ON p.id = s.product_id
      ORDER BY s.created_at DESC
      LIMIT 100
    `);
    res.json(data.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sales" });
  }
};

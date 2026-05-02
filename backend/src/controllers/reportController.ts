import { Request, Response } from "express";
import { pool } from "../config/db";

export const getReports = async (_: Request, res: Response): Promise<void> => {
  try {
    const topSelling = await pool.query(`
      SELECT p.id, p.name, p.category, p.price,
             SUM(s.quantity) as total_sold,
             SUM(s.quantity * p.price) as total_revenue
      FROM sales s
      JOIN products p ON p.id = s.product_id
      GROUP BY p.id, p.name, p.category, p.price
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    const lowStock = await pool.query(
      "SELECT * FROM products WHERE quantity <= 5 ORDER BY quantity ASC"
    );

    const totalRevenue = await pool.query(`
      SELECT COALESCE(SUM(s.quantity * p.price), 0) as total
      FROM sales s
      JOIN products p ON p.id = s.product_id
    `);

    const totalSales = await pool.query("SELECT COUNT(*) as count FROM sales");

    const totalProducts = await pool.query("SELECT COUNT(*) as count FROM products");

    const recentSales = await pool.query(`
      SELECT s.id, s.quantity, s.created_at,
             p.name as product_name, p.price,
             (s.quantity * p.price) as revenue
      FROM sales s
      JOIN products p ON p.id = s.product_id
      ORDER BY s.created_at DESC
      LIMIT 10
    `);

    const categoryBreakdown = await pool.query(`
      SELECT p.category,
             SUM(s.quantity) as total_sold,
             SUM(s.quantity * p.price) as revenue
      FROM sales s
      JOIN products p ON p.id = s.product_id
      GROUP BY p.category
      ORDER BY revenue DESC
    `);

    res.json({
      topSelling: topSelling.rows,
      lowStock: lowStock.rows,
      totalRevenue: parseFloat(totalRevenue.rows[0].total),
      totalSales: parseInt(totalSales.rows[0].count),
      totalProducts: parseInt(totalProducts.rows[0].count),
      recentSales: recentSales.rows,
      categoryBreakdown: categoryBreakdown.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

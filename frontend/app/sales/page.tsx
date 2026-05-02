"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, type Product, type Sale } from "@/lib/api";

export default function SalesPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // form
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    loadData();
  }, [router]);

  async function loadData() {
    try {
      const [salesData, productsData] = await Promise.all([
        api.getSales(),
        api.getProducts(),
      ]);
      setSales(salesData);
      setProducts(productsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRecordSale(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!productId) {
      setError("Please select a product");
      return;
    }

    setSubmitting(true);
    try {
      await api.addSale({
        product_id: parseInt(productId),
        quantity: parseInt(quantity),
        note: note || undefined,
      });

      setProductId("");
      setQuantity("");
      setNote("");
      setShowForm(false);
      setSuccess("Sale recorded!");
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const selectedProduct = products.find((p) => p.id === parseInt(productId));

  function formatRupees(n: number) {
    return "₹" + n.toLocaleString("en-IN");
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.revenue), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Sales</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {sales.length} transactions · {formatRupees(totalRevenue)} revenue
            </p>
          </div>
          <button
            onClick={() => { setShowForm(true); setError(""); }}
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded hover:bg-gray-700"
          >
            + Record Sale
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-semibold text-gray-800 text-lg">Record a Sale</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-700 text-xl leading-none"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleRecordSale}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product
                  </label>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                    required
                  >
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{p.price} ({p.quantity} in stock)
                      </option>
                    ))}
                  </select>
                  {selectedProduct && (
                    <p className="text-xs text-gray-400 mt-1">
                      Available stock: {selectedProduct.quantity} units
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity Sold
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="1"
                    min="1"
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                  />
                  {selectedProduct && quantity && (
                    <p className="text-xs text-gray-500 mt-1">
                      Revenue: {formatRupees(selectedProduct.price * parseInt(quantity || "0"))}
                    </p>
                  )}
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note (optional)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Bulk order, walk-in customer"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm mb-3">{error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gray-900 text-white rounded py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
                  >
                    {submitting ? "Recording..." : "Record Sale"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 border border-gray-300 text-gray-700 rounded py-2 text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm py-8 text-center">Loading...</p>
        ) : sales.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
            <p className="text-gray-500 text-sm mb-3">No sales recorded yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gray-900 text-white text-sm px-4 py-2 rounded hover:bg-gray-700"
            >
              Record your first sale
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Category</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Qty</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Revenue</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{sale.product_name}</p>
                      {sale.note && <p className="text-xs text-gray-400 mt-0.5">{sale.note}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{sale.category}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{sale.quantity}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {formatRupees(sale.revenue)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 hidden sm:table-cell">
                      {formatDate(sale.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

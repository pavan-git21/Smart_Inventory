"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, type Product } from "@/lib/api";

const CATEGORIES = ["General", "Groceries", "Electronics", "Clothing", "Stationery", "Food & Beverage", "Health", "Hardware", "Other"];

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("General");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    loadProducts();
  }, [router]);

  async function loadProducts() {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditingProduct(null);
    setName("");
    setPrice("");
    setQuantity("");
    setCategory("General");
    setError("");
    setShowForm(true);
  }

  function openEditForm(p: Product) {
    setEditingProduct(p);
    setName(p.name);
    setPrice(String(p.price));
    setQuantity(String(p.quantity));
    setCategory(p.category);
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const body = {
        name: name.trim(),
        price: parseFloat(price),
        quantity: parseInt(quantity),
        category,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, body);
        setSuccess("Product updated successfully");
      } else {
        await api.addProduct(body);
        setSuccess("Product added successfully");
      }

      setShowForm(false);
      loadProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number, productName: string) {
    if (!confirm(`Delete "${productName}"? This action cannot be undone.`)) return;

    try {
      await api.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      setSuccess("Product deleted");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function getStockBadge(qty: number) {
    if (qty <= 5) return <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">{qty} — Low</span>;
    if (qty <= 20) return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">{qty} — Medium</span>;
    return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{qty}</span>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
            <p className="text-sm text-gray-500 mt-0.5">{products.length} items in catalog</p>
          </div>
          <button
            onClick={openAddForm}
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded hover:bg-gray-700"
          >
            + Add Product
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded mb-4 text-sm">
            {success}
          </div>
        )}
        {error && !showForm && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-semibold text-gray-800 text-lg">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-700 text-xl leading-none"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rice 5kg"
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0"
                      min="0"
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
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
                    {submitting ? "Saving..." : editingProduct ? "Save Changes" : "Add Product"}
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

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="border border-gray-300 rounded px-3 py-2 text-sm w-64 focus:outline-none focus:border-gray-500"
          />
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm py-8 text-center">Loading products...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
            <p className="text-gray-500 text-sm mb-3">
              {search ? "No products match your search." : "No products added yet."}
            </p>
            {!search && (
              <button
                onClick={openAddForm}
                className="bg-gray-900 text-white text-sm px-4 py-2 rounded hover:bg-gray-700"
              >
                Add your first product
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Category</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{p.category}</td>
                    <td className="px-4 py-3 text-right text-gray-700">₹{p.price}</td>
                    <td className="px-4 py-3 text-right">{getStockBadge(p.quantity)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEditForm(p)}
                        className="text-gray-500 hover:text-gray-900 mr-3 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        Delete
                      </button>
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

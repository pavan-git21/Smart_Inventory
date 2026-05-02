"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, type Report } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") : "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    api.getReports()
      .then((data) => setReport(data))
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [router]);

  function formatRupees(amount: number) {
    return "₹" + amount.toLocaleString("en-IN");
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Hello, {userName || "there"} 
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's how your business is doing today.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        {report && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                <p className="text-xl font-semibold text-gray-800">{formatRupees(report.totalRevenue)}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Total Sales</p>
                <p className="text-xl font-semibold text-gray-800">{report.totalSales}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Products</p>
                <p className="text-xl font-semibold text-gray-800">{report.totalProducts}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Low Stock</p>
                <p className={`text-xl font-semibold ${report.lowStock.length > 0 ? "text-red-600" : "text-green-600"}`}>
                  {report.lowStock.length}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Top selling */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium text-gray-800">Top Selling Products</h2>
                  <Link href="/reports" className="text-xs text-gray-500 hover:text-gray-800">
                    View report →
                  </Link>
                </div>

                {report.topSelling.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">No sales recorded yet.</p>
                ) : (
                  <div>
                    {report.topSelling.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-4">{index + 1}.</span>
                          <div>
                            <p className="text-sm text-gray-700">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-700">{item.total_sold} sold</p>
                          <p className="text-xs text-gray-400">{formatRupees(item.total_revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Low stock */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium text-gray-800">Low Stock Items</h2>
                  <Link href="/products" className="text-xs text-gray-500 hover:text-gray-800">
                    Manage →
                  </Link>
                </div>

                {report.lowStock.length === 0 ? (
                  <p className="text-sm text-green-600 py-4 text-center">All items are well stocked ✓</p>
                ) : (
                  <div>
                    {report.lowStock.map((p) => (
                      <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="text-sm text-gray-700">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.category}</p>
                        </div>
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                          {p.quantity} left
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent transactions */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-medium text-gray-800">Recent Transactions</h2>
                <Link href="/sales" className="text-xs text-gray-500 hover:text-gray-800">
                  View all →
                </Link>
              </div>

              {report.recentSales.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No transactions yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-gray-100">
                      <th className="text-left pb-2 font-medium">Product</th>
                      <th className="text-right pb-2 font-medium">Qty</th>
                      <th className="text-right pb-2 font-medium">Revenue</th>
                      <th className="text-right pb-2 font-medium hidden sm:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.recentSales.map((sale) => (
                      <tr key={sale.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-2.5 text-gray-700">{sale.product_name}</td>
                        <td className="py-2.5 text-right text-gray-600">{sale.quantity}</td>
                        <td className="py-2.5 text-right font-medium text-gray-800">{formatRupees(sale.revenue)}</td>
                        <td className="py-2.5 text-right text-gray-400 hidden sm:table-cell">{formatDate(sale.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex gap-3 mt-6">
              <Link href="/products" className="bg-gray-900 text-white text-sm px-4 py-2 rounded hover:bg-gray-700">
                + Add Product
              </Link>
              <Link href="/sales" className="border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded hover:bg-gray-50">
                Record Sale
              </Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

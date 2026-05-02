"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, type Report } from "@/lib/api";

export default function ReportsPage() {
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    api.getReports()
      .then((data) => setReport(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  function formatRupees(n: number) {
    return "₹" + Number(n).toLocaleString("en-IN");
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 text-sm">Loading report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Demand insights and inventory overview</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        {report && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                <p className="text-xl font-semibold text-gray-800">{formatRupees(report.totalRevenue)}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Total Transactions</p>
                <p className="text-xl font-semibold text-gray-800">{report.totalSales}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 col-span-2 md:col-span-1">
                <p className="text-xs text-gray-500 mb-1">Low Stock Items</p>
                <p className={`text-xl font-semibold ${report.lowStock.length > 0 ? "text-red-600" : "text-green-600"}`}>
                  {report.lowStock.length}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Top selling */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h2 className="font-medium text-gray-800 mb-4">Top 5 Selling Products</h2>

                {report.topSelling.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No sales yet.</p>
                ) : (
                  <div>
                    {report.topSelling.map((item, i) => {
                      const maxSold = report.topSelling[0]?.total_sold || 1;
                      const barWidth = Math.round((item.total_sold / maxSold) * 100);

                      return (
                        <div key={item.id} className="mb-4 last:mb-0">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">
                              {i + 1}. {item.name}
                            </span>
                            <span className="text-gray-500">{item.total_sold} units</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded overflow-hidden">
                            <div
                              className="h-full bg-gray-700 rounded"
                              style={{ width: barWidth + "%" }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{formatRupees(item.total_revenue)}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Category breakdown */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h2 className="font-medium text-gray-800 mb-4">Revenue by Category</h2>

                {report.categoryBreakdown.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No data yet.</p>
                ) : (
                  <div>
                    {report.categoryBreakdown.map((cat) => {
                      const maxRev = Math.max(...report.categoryBreakdown.map((c) => Number(c.revenue)));
                      const barWidth = Math.round((Number(cat.revenue) / maxRev) * 100);

                      return (
                        <div key={cat.category} className="mb-4 last:mb-0">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">{cat.category}</span>
                            <span className="text-gray-500">{formatRupees(cat.revenue)}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded overflow-hidden">
                            <div
                              className="h-full bg-gray-800 rounded"
                              style={{ width: barWidth + "%" }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{cat.total_sold} units sold</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Low stock */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
              <h2 className="font-medium text-gray-800 mb-4">
                Low Stock Alert
                {report.lowStock.length > 0 && (
                  <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                    {report.lowStock.length} items
                  </span>
                )}
              </h2>

              {report.lowStock.length === 0 ? (
                <p className="text-sm text-green-600 py-4 text-center">All products are well stocked ✓</p>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {report.lowStock.map((p) => (
                    <div key={p.id} className="border border-red-100 rounded p-3">
                      <p className="text-sm font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.category}</p>
                      <p className="text-sm text-red-600 mt-1">{p.quantity} units remaining</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent transactions */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="font-medium text-gray-800 mb-4">Recent Transactions</h2>

              {report.recentSales.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No transactions yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-500">
                      <th className="text-left pb-2 font-medium">Product</th>
                      <th className="text-right pb-2 font-medium">Qty</th>
                      <th className="text-right pb-2 font-medium">Revenue</th>
                      <th className="text-right pb-2 font-medium hidden sm:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.recentSales.map((s) => (
                      <tr key={s.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-2.5 text-gray-700">{s.product_name}</td>
                        <td className="py-2.5 text-right text-gray-600">{s.quantity}</td>
                        <td className="py-2.5 text-right font-medium text-gray-800">{formatRupees(s.revenue)}</td>
                        <td className="py-2.5 text-right text-gray-400 hidden sm:table-cell">{formatDate(s.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

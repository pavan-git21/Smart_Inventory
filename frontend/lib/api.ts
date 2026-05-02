const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const api = {
  // Auth
  register: (body: { email: string; password: string; name?: string }) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handleResponse),

  login: (body: { email: string; password: string }) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handleResponse),

  getMe: () =>
    fetch(`${BASE_URL}/auth/me`, { headers: authHeaders() }).then(handleResponse),

  // Products
  getProducts: () =>
    fetch(`${BASE_URL}/products`, { headers: authHeaders() }).then(handleResponse),

  addProduct: (body: { name: string; price: number; quantity: number; category: string }) =>
    fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  updateProduct: (id: number, body: { name: string; price: number; quantity: number; category: string }) =>
    fetch(`${BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  deleteProduct: (id: number) =>
    fetch(`${BASE_URL}/products/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handleResponse),

  // Sales
  getSales: () =>
    fetch(`${BASE_URL}/sales`, { headers: authHeaders() }).then(handleResponse),

  addSale: (body: { product_id: number; quantity: number; note?: string }) =>
    fetch(`${BASE_URL}/sales`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  // Reports
  getReports: () =>
    fetch(`${BASE_URL}/reports`, { headers: authHeaders() }).then(handleResponse),
};

export type Product = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  created_at: string;
  updated_at: string;
};

export type Sale = {
  id: number;
  product_id: number;
  product_name: string;
  category: string;
  quantity: number;
  price: number;
  revenue: number;
  note: string | null;
  created_at: string;
};

export type Report = {
  topSelling: { id: number; name: string; category: string; price: number; total_sold: number; total_revenue: number }[];
  lowStock: Product[];
  totalRevenue: number;
  totalSales: number;
  totalProducts: number;
  recentSales: { id: number; product_name: string; quantity: number; price: number; revenue: number; created_at: string }[];
  categoryBreakdown: { category: string; total_sold: number; revenue: number }[];
};

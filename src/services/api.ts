// ─── API Client with JWT token management ────────────────────────────────────────

const API_BASE = "/api";

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.token = localStorage.getItem("auth_token");
    this.refreshToken = localStorage.getItem("auth_refresh_token");
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    return !!this.token;
  }

  setTokens(token: string, refreshToken: string) {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_refresh_token", refreshToken);
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_refresh_token");
  }

  private async refreshAuthToken(): Promise<boolean> {
    if (!this.refreshToken) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      this.token = data.token;
      localStorage.setItem("auth_token", data.token);
      return true;
    } catch {
      return false;
    }
  }

  async request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { skipAuth, headers: extraHeaders, ...restOptions } = options;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(extraHeaders as Record<string, string>),
    };

    if (!skipAuth && this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...restOptions,
      headers,
    });

    // If 401, try to refresh token and retry once
    if (response.status === 401 && !skipAuth && this.refreshToken) {
      const refreshed = await this.refreshAuthToken();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${this.token!}`;
        const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
          ...restOptions,
          headers,
        });
        return retryResponse.json();
      }
      // Refresh failed
      this.clearTokens();
      window.location.href = "/#/login";
      throw new Error("Sessão expirada");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Erro na requisição" }));
      throw new Error(error.error || "Erro na requisição");
    }

    return response.json();
  }

  // ─── Auth ─────────────────────────────────────────────────────────────────────
  async login(email: string, password: string) {
    const data = await this.request<{
      user: any;
      token: string;
      refreshToken: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
    this.setTokens(data.token, data.refreshToken);
    return data;
  }

  async register(name: string, email: string, password: string, phone?: string) {
    const data = await this.request<{
      user: any;
      token: string;
      refreshToken: string;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone }),
      skipAuth: true,
    });
    this.setTokens(data.token, data.refreshToken);
    return data;
  }

  async logout() {
    try {
      await this.request("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
    } finally {
      this.clearTokens();
    }
  }

  async getMe() {
    return this.request<{ user: any }>("/auth/me");
  }

  // ─── Users ────────────────────────────────────────────────────────────────────
  async getUsers() {
    return this.request<{ users: any[] }>("/users");
  }

  async getUser(id: string) {
    return this.request<{ user: any }>(`/users/${id}`);
  }

  async updateUser(id: string, data: Record<string, any>) {
    return this.request<{ user: any }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updatePassword(id: string, currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>(`/users/${id}/password`, {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async deleteUser(id: string) {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: "DELETE",
    });
  }

  // ─── Sales ─────────────────────────────────────────────────────────────────────
  async getSales(status?: string) {
    const qs = status ? `?status=${status}` : "";
    return this.request<{ sales: any[] }>(`/sales${qs}`);
  }

  async getSale(id: string) {
    return this.request<{ sale: any }>(`/sales/${id}`);
  }

  async createSale(data: {
    product: string;
    specs?: string;
    amount: number;
    buyer_id?: string;
    thumb?: string;
  }) {
    return this.request<{ sale: any }>("/sales", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSale(id: string, data: { status: string }) {
    return this.request<{ sale: any }>(`/sales/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getSalesStats() {
    return this.request("/sales/stats/overview");
  }

  // ─── Subscriptions ─────────────────────────────────────────────────────────────
  async getPlans() {
    return this.request<{ plans: any }>("/subscriptions/plans", { skipAuth: true });
  }

  async getCurrentSubscription() {
    return this.request<{ subscription: any; plan: any }>("/subscriptions/current");
  }

  async subscribe(plan: string) {
    return this.request<{ subscription: any; plan: any }>("/subscriptions/subscribe", {
      method: "POST",
      body: JSON.stringify({ plan }),
    });
  }

  async cancelSubscription() {
    return this.request<{ message: string }>("/subscriptions/cancel", {
      method: "POST",
    });
  }

  // ─── Disputes ────────────────────────────────────────────────────────────────────
  async getDisputes(status?: string) {
    const qs = status ? `?status=${status}` : "";
    return this.request<{ disputes: any[] }>(`/disputes${qs}`);
  }

  async createDispute(data: { order_id?: string; reason: string }) {
    return this.request<{ dispute: any }>("/disputes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateDispute(id: string, data: { status: string }) {
    return this.request<{ dispute: any }>(`/disputes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteDispute(id: string) {
    return this.request<{ message: string }>(`/disputes/${id}`, {
      method: "DELETE",
    });
  }

  // ─── Products ───────────────────────────────────────────────────────────────────
  async getProducts(category?: string, search?: string) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    const qs = params.toString();
    return this.request<{ products: any[] }>(`/products${qs ? "?" + qs : ""}`);
  }

  async createProduct(data: {
    name: string;
    description?: string;
    price: number;
    old_price?: number;
    category?: string;
    thumb?: string;
    discount?: number;
  }) {
    return this.request<{ product: any }>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: Record<string, any>) {
    return this.request<{ product: any }>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request<{ message: string }>(`/products/${id}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();
export default api;

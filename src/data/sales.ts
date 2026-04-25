import { supabase } from "../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Sale {
  id: string;
  product: string;
  specs: string;
  amount: number;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  thumb: string;
  seller_id: string | null;
  buyer_id: string | null;
  seller_name: string;
  buyer_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSaleInput {
  product: string;
  specs: string;
  amount: number;
  status?: Sale["status"];
  thumb?: string;
  seller_id?: string;
  buyer_id: string;
  seller_name?: string;
  buyer_name?: string;
}

export interface UpdateSaleInput {
  status?: Sale["status"];
  seller_id?: string;
  seller_name?: string;
  thumb?: string;
}
export interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  byStatus: { status: string; count: number }[];
  monthlyRevenue: { month: string; total: number }[];
}
// ─── GET SALES ────────────────────────────────────────────────────────────────

export async function getSales(status?: string): Promise<{ sales: Sale[] }> {
  let query = supabase
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return { sales: (data as Sale[]) ?? [] };
}

// ─── GET SALE BY ID ───────────────────────────────────────────────────────────

export async function getSaleById(id: string): Promise<Sale> {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  return data as Sale;
}

// ─── CREATE SALE ──────────────────────────────────────────────────────────────

export async function createSale(input: CreateSaleInput): Promise<Sale> {
  const { data, error } = await supabase
    .from("sales")
    .insert({
      product:     input.product,
      specs:       input.specs       ?? "",
      amount:      input.amount,
      status:      input.status      ?? "pending",
      thumb:       input.thumb       ?? "",
      seller_id:   input.seller_id   || null,
      buyer_id:    input.buyer_id,
      seller_name: input.seller_name ?? "",
      buyer_name:  input.buyer_name  ?? "",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data as Sale;
}

// ─── UPDATE SALE ──────────────────────────────────────────────────────────────

export async function updateSale(id: string, input: UpdateSaleInput): Promise<Sale> {
  const { data, error } = await supabase
    .from("sales")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data as Sale;
}

// ─── DELETE SALE ──────────────────────────────────────────────────────────────

export async function deleteSale(id: string): Promise<void> {
  const { error } = await supabase
    .from("sales")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

// ─── GET SALES SUMMARY (para dashboard) ──────────────────────────────────────

export async function getSalesSummary(): Promise<{
  total: number;
  pending: number;
  delivered: number;
  revenue: number;
}> {
  const { data, error } = await supabase
    .from("sales")
    .select("amount, status");

  if (error) throw new Error(error.message);

  const sales = (data as Pick<Sale, "amount" | "status">[]) ?? [];

  return {
    total:     sales.length,
    pending:   sales.filter((s) => s.status === "pending").length,
    delivered: sales.filter((s) => s.status === "delivered").length,
    revenue:   sales.reduce((acc, s) => acc + Number(s.amount), 0),
  };
}
export async function getSalesStats(): Promise<SalesStats> {
  const { data, error } = await supabase
    .from("sales")
    .select("amount, status, created_at");

  if (error) throw new Error(error.message);

  const sales = data ?? [];

  // Agrupar por status para o Dashboard
  const statusCounts = sales.reduce((acc: any, sale) => {
    acc[sale.status] = (acc[sale.status] || 0) + 1;
    return acc;
  }, {});

  const byStatus = Object.keys(statusCounts).map((status) => ({
    status,
    count: statusCounts[status],
  }));

  // Cálculo de receita total
  const totalRevenue = sales.reduce((acc, s) => acc + Number(s.amount), 0);

  return {
    totalSales: sales.length,
    totalRevenue,
    byStatus,
    monthlyRevenue: [
      { 
        month: new Date().toLocaleString('pt-BR', { month: 'long' }), 
        total: totalRevenue // Simplificado para o mês atual
      }
    ],
  };
}
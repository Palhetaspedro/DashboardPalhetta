import { supabase } from "../lib/supabase";

export interface Sale {
  id: string;
  product: string;
  specs: string;
  amount: number;
  status: string;
  thumb: string;
  created_at: string;
  seller_id: string;
  buyer_id: string;
  seller_name?: string;
  buyer_name?: string;
}

export async function getSales(status?: string) {
  let q = supabase.from("sales").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return { sales: data as Sale[] };
}

export async function getSalesStats() {
  const { data, error } = await supabase
    .from("sales")
    .select("amount, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const sales = data ?? [];
  const totalRevenue = sales.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const totalSales = sales.length;

  const byStatus: { status: string; count: number }[] = [];
  const statusMap: Record<string, number> = {};
  for (const s of sales) {
    statusMap[s.status] = (statusMap[s.status] || 0) + 1;
  }
  for (const [status, count] of Object.entries(statusMap)) {
    byStatus.push({ status, count });
  }

  const monthlyRevenue: { month: string; total: number }[] = [];

  return { totalRevenue, totalSales, byStatus, monthlyRevenue };
}

export async function updateSale(id: string, data: Record<string, any>) {
  const { data: updated, error } = await supabase
    .from("sales")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { sale: updated as Sale };
}

import { supabase } from "../lib/supabase";

export interface Dispute {
  id: string;
  product: string;
  status: string;
  created_at: string;
  reason: string;
  user_name: string;
  order_product?: string;
}

export async function getDisputes() {
  const { data, error } = await supabase
    .from("disputes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { disputes: data as Dispute[] };
}

export async function createDispute(data: { reason: string }) {
  const { data: dispute, error } = await supabase
    .from("disputes")
    .insert({ reason: data.reason, status: "open" })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { dispute: dispute as Dispute };
}

export async function deleteDispute(id: string) {
  const { error } = await supabase.from("disputes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

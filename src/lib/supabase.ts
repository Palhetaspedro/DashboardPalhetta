import { createClient } from "@supabase/supabase-js";

// O Vite exige o prefixo VITE_ para ler variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mantendo seu aviso de depuração para o console
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase não configurado. Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão no seu .env.local ou nas variáveis da Vercel."
  );
}

// Exporta o cliente configurado. 
// Removi os links de "placeholder" para evitar que o app tente conectar a um endereço falso.
export const supabase = createClient(
  supabaseUrl || "", 
  supabaseAnonKey || ""
);
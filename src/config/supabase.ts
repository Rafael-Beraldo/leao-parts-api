import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("SUPABASE_URL ou SUPABASE_KEY não foram definidos no .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };

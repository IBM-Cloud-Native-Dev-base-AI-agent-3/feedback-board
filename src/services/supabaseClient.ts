/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL 또는 Anon Key가 존재하지 않습니다. 프로젝트 루트에 .env 파일을 생성하고 VITE_SUPABASE_URL 및 VITE_SUPABASE_ANON_KEY를 설정해주세요."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthResult {
  error?: string;
}

/** 이메일/비밀번호로 로그인 */
export async function login(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

/** 이메일/비밀번호로 회원가입 */
export async function signup(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  // 이메일 체크 설정 꺼짐 (횟수제한이 너무 적어서 운영에서만 on 처리)
  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

/** 로그아웃 */
export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/supabase/auth";

export async function loginAction(
  email: string,
  password: string
): Promise<{ success: false; error: string } | undefined> {
  try {
    await signIn(email, password);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Invalid credentials",
    };
  }
  redirect("/dashboard");
}

export async function logoutAction(): Promise<
  { success: false; error: string } | undefined
> {
  try {
    await signOut();
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Logout failed",
    };
  }
  redirect("/login");
}

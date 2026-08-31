"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function recuperarSenha(formData: FormData) {
  const email = String(formData.get("email") || "").trim();

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:3000/redefinir-senha",
  });

  if (error) {
    console.error("ERRO RECUPERAÇÃO:", error);
    redirect("/recuperar-senha?erro=1");
  }

  redirect("/recuperar-senha?enviado=1");
}
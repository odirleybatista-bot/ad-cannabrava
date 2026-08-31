"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function redefinirSenha(formData: FormData) {
  const senha = String(formData.get("senha") || "");
  const confirmarSenha = String(formData.get("confirmarSenha") || "");

  if (senha.length < 6) {
    redirect("/redefinir-senha?erro=senha-curta");
  }

  if (senha !== confirmarSenha) {
    redirect("/redefinir-senha?erro=senhas-diferentes");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/redefinir-senha?erro=sessao");
  }

  const { error } = await supabase.auth.updateUser({
    password: senha,
  });

  if (error) {
    console.error("ERRO AO REDEFINIR SENHA:", error);
    redirect("/redefinir-senha?erro=atualizacao");
  }

  await supabase.auth.signOut();

  redirect("/login?senha=alterada");
}
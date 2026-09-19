"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function normalizar(
  texto: string
) {
  return texto
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim();
}

export async function entrar(
  formData: FormData
) {
  const email = String(
    formData.get("email") || ""
  )
    .trim()
    .toLowerCase();

  const senha = String(
    formData.get("senha") || ""
  );

  if (!email || !senha) {
    return {
      sucesso: false,
      mensagem:
        "Informe o e-mail e a senha.",
    };
  }

  const supabase =
    await createClient();

  const {
    data: login,
    error: loginError,
  } =
    await supabase.auth
      .signInWithPassword({
        email,
        password: senha,
      });

  if (
    loginError ||
    !login.user
  ) {
    return {
      sucesso: false,
      mensagem:
        loginError?.message ===
        "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : loginError?.message ||
            "Não foi possível realizar o login.",
    };
  }

  const {
    data: acesso,
    error: acessoError,
  } =
    await supabase.rpc(
      "meu_acesso"
    );

  if (acessoError) {
    console.error(
      "Erro meu_acesso:",
      acessoError
    );

    await supabase.auth
      .signOut();

    return {
      sucesso: false,
      mensagem:
        `Erro ao identificar perfil: ${acessoError.message}`,
    };
  }

  if (
    acesso?.ativo === false
  ) {
    await supabase.auth
      .signOut();

    return {
      sucesso: false,
      mensagem:
        "Este usuário está inativo.",
    };
  }

  const perfis: string[] =
    Array.isArray(
      acesso?.perfis
    )
      ? acesso.perfis
      : [];

  const normalizados =
    perfis.map(normalizar);

  const administrativo =
    normalizados.some(
      (perfil) =>
        [
          "administrador",
          "diretoria",
          "comissao tecnica",
        ].includes(perfil)
    );

  if (administrativo) {
    redirect("/admin");
  }

  if (
    normalizados.includes(
      "atleta"
    )
  ) {
    if (
      acesso?.atleta_id
    ) {
      redirect(
        "/portal-atleta"
      );
    }

    redirect(
      "/portal-atleta/dados"
    );
  }

  await supabase.auth
    .signOut();

  return {
    sucesso: false,
    mensagem:
      "Seu usuário ainda não possui um perfil de acesso.",
  };
}

export async function sair() {
  const supabase =
    await createClient();

  await supabase.auth
    .signOut();

  redirect("/portalcannabrava");
}
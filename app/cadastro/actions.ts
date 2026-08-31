"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function criarAcesso(
  formData: FormData
) {
  const nome = String(
    formData.get("nome") || ""
  ).trim();

  const email = String(
    formData.get("email") || ""
  )
    .trim()
    .toLowerCase();

  const senha = String(
    formData.get("senha") || ""
  );

  const confirmarSenha = String(
    formData.get("confirmar_senha") || ""
  );

  if (!nome || !email || !senha) {
    return {
      sucesso: false,
      mensagem:
        "Preencha nome, e-mail e senha.",
    };
  }

  if (senha.length < 6) {
    return {
      sucesso: false,
      mensagem:
        "A senha deve possuir pelo menos 6 caracteres.",
    };
  }

  if (senha !== confirmarSenha) {
    return {
      sucesso: false,
      mensagem:
        "As senhas informadas são diferentes.",
    };
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase.auth.signUp({
    email,
    password: senha,

    options: {
      data: {
        nome,
        perfil_inicial: "Atleta",
      },
    },
  });

  if (error) {
    console.error(
      "Erro ao criar acesso:",
      error
    );

    return {
      sucesso: false,
      mensagem: error.message,
    };
  }

  /*
    Se o Supabase criou sessão imediatamente,
    este usuário acabou de se cadastrar como ATLETA.
    Portanto, vai diretamente para Meus Dados.
  */
  if (data.session && data.user) {
    redirect(
      "/portal-atleta/dados"
    );
  }

  return {
    sucesso: true,
    confirmarEmail: true,
    mensagem:
      "Acesso criado. Confirme seu e-mail e depois entre no Portal do Atleta.",
  };
}
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

  if (
    !nome ||
    !email ||
    !senha ||
    !confirmarSenha
  ) {
    return {
      sucesso: false,
      mensagem:
        "Preencha todos os campos obrigatórios.",
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
  } =
    await supabase.auth.signUp({
      email,
      password: senha,

      options: {
        emailRedirectTo:
          "https://adcannabrava.netlify.app/login",

        data: {
          nome,
          perfil_inicial:
            "Atleta",
        },
      },
    });

  if (error) {
    console.error(
      "Erro ao criar acesso:",
      error
    );

    const mensagem =
      error.message
        .toLowerCase()
        .includes("already")
        ? "Já existe um acesso cadastrado com este e-mail."
        : error.message;

    return {
      sucesso: false,
      mensagem,
    };
  }

  /*
    Se a confirmação de e-mail estiver desativada
    e o Supabase criar a sessão imediatamente,
    encaminhamos direto para Meus Dados.
  */
  if (
    data.session &&
    data.user
  ) {
    redirect(
      "/portal-atleta/dados"
    );
  }

  /*
    Se a confirmação de e-mail estiver ativada,
    o usuário deve confirmar o endereço antes
    de entrar no Portal do Atleta.
  */
  return {
    sucesso: true,
    confirmarEmail: true,
    mensagem:
      "Acesso criado com sucesso. Enviamos um e-mail de confirmação. Após confirmar, faça login para acessar o Portal do Atleta.",
  };
}
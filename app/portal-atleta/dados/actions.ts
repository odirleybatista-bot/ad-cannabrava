"use server";

import { createClient } from "@/lib/supabase/server";

export async function salvarAtleta(
  formData: FormData
) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return {
      sucesso: false,
      mensagem:
        "Sua sessão expirou. Entre novamente.",
    };
  }

  const {
    data: usuarioId,
    error: usuarioError,
  } = await supabase.rpc(
    "usuario_id_atual"
  );

  if (
    usuarioError ||
    !usuarioId
  ) {
    return {
      sucesso: false,
      mensagem:
        "Não foi possível identificar seu usuário.",
    };
  }

  const numeroCamisa =
    String(
      formData.get(
        "numero_camisa"
      ) || ""
    ).trim();

  const altura =
    String(
      formData.get(
        "altura"
      ) || ""
    ).trim();

  const peso =
    String(
      formData.get(
        "peso"
      ) || ""
    ).trim();

  const dados = {
    usuario_id:
      usuarioId,

    nome:
      String(
        formData.get("nome") ||
          ""
      ).trim(),

    apelido:
      String(
        formData.get("apelido") ||
          ""
      ).trim() || null,

    cpf:
      String(
        formData.get("cpf") ||
          ""
      ).trim() || null,

    rg:
      String(
        formData.get("rg") ||
          ""
      ).trim() || null,

    data_nascimento:
      String(
        formData.get(
          "data_nascimento"
        ) || ""
      ).trim() || null,

    telefone:
      String(
        formData.get(
          "telefone"
        ) || ""
      ).trim() || null,

    email:
      String(
        formData.get("email") ||
          user.email ||
          ""
      )
        .trim()
        .toLowerCase() ||
      null,

    cep:
      String(
        formData.get("cep") ||
          ""
      ).trim() || null,

    cidade:
      String(
        formData.get("cidade") ||
          ""
      ).trim() || null,

    uf:
      String(
        formData.get("uf") ||
          ""
      ).trim() || null,

    bairro:
      String(
        formData.get(
          "bairro"
        ) || ""
      ).trim() || null,

    logradouro:
      String(
        formData.get(
          "logradouro"
        ) || ""
      ).trim() || null,

    numero:
      String(
        formData.get(
          "numero"
        ) || ""
      ).trim() || null,

    complemento:
      String(
        formData.get(
          "complemento"
        ) || ""
      ).trim() || null,

    modalidade:
      "Futebol",

    posicao:
      String(
        formData.get(
          "posicao"
        ) || ""
      ).trim() || null,

    numero_camisa:
      numeroCamisa
        ? Number(numeroCamisa)
        : null,

    pe_preferencial:
      String(
        formData.get(
          "pe_preferencial"
        ) || ""
      ).trim() || null,

    altura:
      altura
        ? Number(altura)
        : null,

    peso:
      peso
        ? Number(peso)
        : null,

    registro_esportivo:
      String(
        formData.get(
          "registro_esportivo"
        ) || ""
      ).trim() || null,

    emergencia_nome:
      String(
        formData.get(
          "emergencia_nome"
        ) || ""
      ).trim() || null,

    emergencia_parentesco:
      String(
        formData.get(
          "emergencia_parentesco"
        ) || ""
      ).trim() || null,

    emergencia_telefone:
      String(
        formData.get(
          "emergencia_telefone"
        ) || ""
      ).trim() || null,

    atualizado_em:
      new Date().toISOString(),
  };

  if (!dados.nome) {
    return {
      sucesso: false,
      mensagem:
        "Informe o nome do atleta.",
    };
  }

  const { data: existente } =
    await supabase
      .from("atletas")
      .select("id,status")
      .eq(
        "usuario_id",
        usuarioId
      )
      .maybeSingle();

  if (existente) {
    const { error } =
      await supabase
        .from("atletas")
        .update(dados)
        .eq(
          "id",
          existente.id
        );

    if (error) {
      return {
        sucesso: false,
        mensagem: error.message,
      };
    }

    return {
      sucesso: true,
      atletaId:
        existente.id,
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from("atletas")
    .insert({
      ...dados,
      status:
        "pre_cadastro",
    })
    .select("id")
    .single();

  if (error) {
    console.error(
      "Erro ao cadastrar atleta:",
      error
    );

    return {
      sucesso: false,
      mensagem:
        error.message,
    };
  }

  return {
    sucesso: true,
    atletaId: data.id,
  };
}
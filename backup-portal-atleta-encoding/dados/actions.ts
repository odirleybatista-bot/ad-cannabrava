"use server";

import { createClient } from "@/lib/supabase/server";

export async function salvarAtleta(formData: FormData) {
  const supabase = await createClient();

  const alturaRaw = String(formData.get("altura") || "").trim();
  const pesoRaw = String(formData.get("peso") || "").trim();
  const numeroCamisaRaw = String(
    formData.get("numero_camisa") || ""
  ).trim();

  const dados = {
    nome: String(formData.get("nome") || "").trim(),
    apelido: String(formData.get("apelido") || "").trim() || null,

    cpf: String(formData.get("cpf") || "").trim() || null,
    rg: String(formData.get("rg") || "").trim() || null,

    data_nascimento:
      String(formData.get("data_nascimento") || "").trim() || null,

    telefone:
      String(formData.get("telefone") || "").trim() || null,

    email:
      String(formData.get("email") || "").trim().toLowerCase() || null,

    cep:
      String(formData.get("cep") || "").trim() || null,

    cidade:
      String(formData.get("cidade") || "").trim() || null,

    uf:
      String(formData.get("uf") || "").trim() || null,

    bairro:
      String(formData.get("bairro") || "").trim() || null,

    logradouro:
      String(formData.get("logradouro") || "").trim() || null,

    numero:
      String(formData.get("numero") || "").trim() || null,

    complemento:
      String(formData.get("complemento") || "").trim() || null,

    modalidade:
      String(formData.get("modalidade") || "Futebol").trim(),

    posicao:
      String(formData.get("posicao") || "").trim() || null,

    numero_camisa: numeroCamisaRaw
      ? Number(numeroCamisaRaw)
      : null,

    pe_preferencial:
      String(formData.get("pe_preferencial") || "").trim() || null,

    altura: alturaRaw
      ? Number(alturaRaw)
      : null,

    peso: pesoRaw
      ? Number(pesoRaw)
      : null,

    registro_esportivo:
      String(formData.get("registro_esportivo") || "").trim() || null,

    emergencia_nome:
      String(formData.get("emergencia_nome") || "").trim() || null,

    emergencia_parentesco:
      String(formData.get("emergencia_parentesco") || "").trim() || null,

    emergencia_telefone:
      String(formData.get("emergencia_telefone") || "").trim() || null,

    status: "pre_cadastro",

    atualizado_em: new Date().toISOString(),
  };

  if (!dados.nome) {
    return {
      sucesso: false,
      mensagem: "Informe o nome do atleta.",
    };
  }

  const { data, error } = await supabase
    .from("atletas")
    .insert(dados)
    .select("id")
    .single();

  if (error) {
    console.error("ERRO AO SALVAR ATLETA:", error);

    if (error.code === "23505") {
      return {
        sucesso: false,
        mensagem: "JÃ¡ existe um atleta cadastrado com este CPF.",
      };
    }

    return {
      sucesso: false,
      mensagem: error.message,
    };
  }

  return {
    sucesso: true,
    atletaId: data.id,
  };
}
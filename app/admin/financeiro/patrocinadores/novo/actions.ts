"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function texto(
  formData: FormData,
  campo: string
) {
  return String(
    formData.get(campo) || ""
  ).trim();
}

export async function salvarPatrocinador(
  formData: FormData
): Promise<void> {
  const supabase = await createClient();

  const nome =
    texto(formData, "nome");

  const nomeFantasia =
    texto(formData, "nome_fantasia");

  const cpfCnpj =
    texto(formData, "cpf_cnpj");

  const telefone =
    texto(formData, "telefone");

  const email =
    texto(formData, "email");

  const instagram =
    texto(formData, "instagram");

  const tipo =
    texto(formData, "tipo");

  const plano =
    texto(formData, "plano");

  const valorTexto =
    texto(
      formData,
      "valor_negociado"
    )
      .replace(/\./g, "")
      .replace(",", ".");

  const valorNegociado =
    valorTexto !== ""
      ? Number(valorTexto)
      : null;

  const dataInicio =
    texto(
      formData,
      "data_inicio"
    ) || null;

  const dataFim =
    texto(
      formData,
      "data_fim"
    ) || null;

  const diaVencimentoTexto =
    texto(
      formData,
      "dia_vencimento"
    );

  const diaVencimento =
    diaVencimentoTexto !== ""
      ? Number(diaVencimentoTexto)
      : null;

  const finalidade =
    texto(
      formData,
      "finalidade"
    );

  const beneficiosAdicionais =
    texto(
      formData,
      "beneficios_adicionais"
    );

  const observacao =
    texto(
      formData,
      "observacao"
    );

  const status =
    texto(
      formData,
      "status"
    ) || "ativo";

  if (!nome) {
    throw new Error(
      "Informe o nome do patrocinador."
    );
  }

  if (
    !["fixo", "pontual"].includes(tipo)
  ) {
    throw new Error(
      "Selecione o tipo de patrocínio."
    );
  }

  if (!plano) {
    throw new Error(
      "Selecione o plano ou categoria."
    );
  }

  if (
    tipo === "fixo" &&
    diaVencimento !== null &&
    (
      diaVencimento < 1 ||
      diaVencimento > 31
    )
  ) {
    throw new Error(
      "O dia de vencimento deve estar entre 1 e 31."
    );
  }

  const agora =
    new Date().toISOString();

  const {
    data: patrocinador,
    error: patrocinadorError,
  } =
    await supabase
      .from("patrocinadores")
      .insert({
        nome,

        nome_fantasia:
          nomeFantasia || null,

        cpf_cnpj:
          cpfCnpj || null,

        telefone:
          telefone || null,

        email:
          email || null,

        instagram:
          instagram || null,

        ativo: true,

        atualizado_em:
          agora,
      })
      .select("id")
      .single();

  if (
    patrocinadorError ||
    !patrocinador
  ) {
    console.error(
      "Erro ao cadastrar patrocinador:",
      patrocinadorError
    );

    throw new Error(
      patrocinadorError
        ? `Erro Supabase: ${patrocinadorError.message} | código: ${patrocinadorError.code} | detalhes: ${patrocinadorError.details || "-"}`
        : "O patrocinador não foi retornado após o cadastro."
    );
  }

  const {
    error: patrocinioError,
  } =
    await supabase
      .from("patrocinios")
      .insert({
        patrocinador_id:
          patrocinador.id,

        tipo,

        plano,

        valor_negociado:
          valorNegociado !== null &&
          Number.isFinite(
            valorNegociado
          )
            ? valorNegociado
            : null,

        data_inicio:
          dataInicio,

        data_fim:
          dataFim,

        dia_vencimento:
          tipo === "fixo"
            ? diaVencimento
            : null,

        finalidade:
          finalidade || null,

        beneficios_adicionais:
          beneficiosAdicionais ||
          null,

        observacao:
          observacao || null,

        status,

        atualizado_em:
          agora,
      });

  if (patrocinioError) {
    console.error(
      "Erro ao cadastrar patrocínio:",
      patrocinioError
    );

    await supabase
      .from("patrocinadores")
      .delete()
      .eq(
        "id",
        patrocinador.id
      );

    throw new Error(
      "Não foi possível salvar as condições do patrocínio."
    );
  }

  redirect(
    "/admin/financeiro/patrocinadores"
  );
}
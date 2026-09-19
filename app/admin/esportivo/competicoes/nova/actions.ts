"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { possuiPerfil } from "@/lib/auth/current-user";

function texto(formData: FormData, campo: string) {
  const valor = formData.get(campo);

  if (typeof valor !== "string") {
    return "";
  }

  return valor.trim();
}

function vazioParaNull(valor: string) {
  return valor === "" ? null : valor;
}

export async function salvarCompeticao(
  formData: FormData
): Promise<void> {
  const usuario = await getCurrentUser();

  if (!usuario) {
    redirect("/portalcannabrava");
  }

  if (
    !possuiPerfil(usuario, [
      "Administrador",
      "Diretoria",
    ])
  ) {
    throw new Error(
      "Você não possui permissão para cadastrar competições."
    );
  }

  const nome = texto(formData, "nome");
  const temporada = texto(
    formData,
    "temporada"
  );
  const tipo = texto(formData, "tipo");
  const formato = texto(formData, "formato");
  const descricao = texto(
    formData,
    "descricao"
  );
  const dataInicio = texto(
    formData,
    "data_inicio"
  );
  const dataFim = texto(
    formData,
    "data_fim"
  );
  const localPrincipal = texto(
    formData,
    "local_principal"
  );
  const organizador = texto(
    formData,
    "organizador"
  );
  const status = texto(
    formData,
    "status"
  );
  const observacao = texto(
    formData,
    "observacao"
  );

  if (!nome) {
    throw new Error(
      "Informe o nome da competição."
    );
  }

  if (!temporada) {
    throw new Error(
      "Informe a temporada."
    );
  }

  if (!tipo) {
    throw new Error(
      "Informe o tipo da competição."
    );
  }

  if (!status) {
    throw new Error(
      "Informe a situação da competição."
    );
  }

  if (
    dataInicio &&
    dataFim &&
    dataFim < dataInicio
  ) {
    throw new Error(
      "A data final não pode ser anterior à data inicial."
    );
  }

  const supabase = await createClient();

  const { data: competicao, error } =
    await supabase
      .from("competicoes")
      .insert({
        nome,
        temporada,
        tipo,
        formato: vazioParaNull(formato),
        descricao: vazioParaNull(descricao),
        data_inicio:
          vazioParaNull(dataInicio),
        data_fim:
          vazioParaNull(dataFim),
        local_principal:
          vazioParaNull(localPrincipal),
        organizador:
          vazioParaNull(organizador),
        status,
        observacao:
          vazioParaNull(observacao),
        atualizado_em:
          new Date().toISOString(),
      })
      .select("id")
      .single();

  if (error || !competicao) {
    console.error(
      "Erro ao cadastrar competição:",
      error
    );

    throw new Error(
      error?.message ||
        "Não foi possível cadastrar a competição."
    );
  }

  redirect(
    `/admin/esportivo/competicoes/${competicao.id}`
  );
}
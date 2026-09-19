"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function alterarStatusPartida(
  partidaId: string,
  formData: FormData
) {
  const supabase =
    await createClient();

  const status =
    String(
      formData.get("status") || ""
    ).trim();

  const permitidos = [
    "agendada",
    "confirmada",
    "em_andamento",
    "finalizada",
    "adiada",
    "cancelada",
  ];

  if (
    !permitidos.includes(status)
  ) {
    throw new Error(
      "Status da partida inválido."
    );
  }

  const { error } =
    await supabase
      .from("partidas")
      .update({
        status,
        atualizado_em:
          new Date().toISOString(),
      })
      .eq("id", partidaId);

  if (error) {
    console.error(
      "Erro ao atualizar status:",
      error
    );

    throw new Error(
      error.message ||
        "Não foi possível atualizar a partida."
    );
  }

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}`
  );

  revalidatePath(
    "/admin/esportivo/partidas"
  );
}

export async function criarConvocacao(
  partidaId: string
) {
  const supabase =
    await createClient();

  const {
    data: existente,
  } =
    await supabase
      .from("convocacoes")
      .select("id")
      .eq("partida_id", partidaId)
      .maybeSingle();

  if (existente?.id) {
    redirect(
      `/admin/esportivo/partidas/${partidaId}/convocacao`
    );
  }

  const {
    data: usuarioId,
  } =
    await supabase.rpc(
      "usuario_id_atual"
    );

  const {
    data: convocacao,
    error,
  } =
    await supabase
      .from("convocacoes")
      .insert({
        partida_id:
          partidaId,

        status:
          "rascunho",

        criado_por:
          usuarioId || null,
      })
      .select("id")
      .single();

  if (
    error ||
    !convocacao
  ) {
    console.error(
      "Erro ao criar convocação:",
      error
    );

    throw new Error(
      error?.message ||
        "Não foi possível criar a convocação."
    );
  }

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}`
  );

  redirect(
    `/admin/esportivo/partidas/${partidaId}/convocacao`
  );
}

export async function criarSumula(
  partidaId: string
) {
  const supabase =
    await createClient();

  const {
    data: existente,
  } =
    await supabase
      .from("sumulas")
      .select("id")
      .eq("partida_id", partidaId)
      .maybeSingle();

  if (existente?.id) {
    redirect(
      `/admin/esportivo/partidas/${partidaId}/sumula`
    );
  }

  const {
    data: usuarioId,
  } =
    await supabase.rpc(
      "usuario_id_atual"
    );

  const {
    data: sumula,
    error,
  } =
    await supabase
      .from("sumulas")
      .insert({
        partida_id:
          partidaId,

        status:
          "rascunho",

        gols_cannabrava:
          0,

        gols_adversario:
          0,

        criado_por:
          usuarioId || null,
      })
      .select("id")
      .single();

  if (
    error ||
    !sumula
  ) {
    console.error(
      "Erro ao criar súmula:",
      error
    );

    throw new Error(
      error?.message ||
        "Não foi possível criar a súmula."
    );
  }

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}`
  );

  redirect(
    `/admin/esportivo/partidas/${partidaId}/sumula`
  );
}
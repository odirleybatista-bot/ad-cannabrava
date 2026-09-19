"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function texto(
  formData: FormData,
  campo: string
) {
  const valor = formData.get(campo);

  return typeof valor === "string"
    ? valor.trim()
    : "";
}

export async function salvarConvocacao(
  partidaId: string,
  convocacaoId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const mensagem =
    texto(formData, "mensagem");

  const limiteConfirmacao =
    texto(
      formData,
      "limite_confirmacao"
    );

  const selecionados =
    formData
      .getAll("atleta_id")
      .map((item) =>
        String(item).trim()
      )
      .filter(Boolean);

  const {
    data: atuais,
    error: erroAtuais,
  } = await supabase
    .from("convocacao_atletas")
    .select("atleta_id")
    .eq(
      "convocacao_id",
      convocacaoId
    );

  if (erroAtuais) {
    console.error(
      "Erro ao consultar convocados:",
      erroAtuais
    );

    throw new Error(
      erroAtuais.message
    );
  }

  const idsAtuais = new Set(
    (atuais || []).map(
      (item: any) =>
        item.atleta_id
    )
  );

  const idsSelecionados =
    new Set(selecionados);

  const adicionar =
    selecionados.filter(
      (id) =>
        !idsAtuais.has(id)
    );

  const remover =
    [...idsAtuais].filter(
      (id) =>
        !idsSelecionados.has(
          String(id)
        )
    );

  if (adicionar.length > 0) {
    const registros =
      adicionar.map(
        (atletaId) => ({
          convocacao_id:
            convocacaoId,

          atleta_id:
            atletaId,

          resposta:
            "pendente",
        })
      );

    const {
      error: erroAdicionar,
    } = await supabase
      .from(
        "convocacao_atletas"
      )
      .insert(registros);

    if (erroAdicionar) {
      console.error(
        "Erro ao adicionar atletas:",
        erroAdicionar
      );

      throw new Error(
        erroAdicionar.message
      );
    }
  }

  if (remover.length > 0) {
    const {
      error: erroRemover,
    } = await supabase
      .from(
        "convocacao_atletas"
      )
      .delete()
      .eq(
        "convocacao_id",
        convocacaoId
      )
      .in(
        "atleta_id",
        remover
      );

    if (erroRemover) {
      console.error(
        "Erro ao remover atletas:",
        erroRemover
      );

      throw new Error(
        erroRemover.message
      );
    }
  }

  const {
    error: erroConvocacao,
  } = await supabase
    .from("convocacoes")
    .update({
      mensagem:
        mensagem || null,

      limite_confirmacao:
        limiteConfirmacao
          ? new Date(
              limiteConfirmacao
            ).toISOString()
          : null,

      atualizado_em:
        new Date().toISOString(),
    })
    .eq(
      "id",
      convocacaoId
    );

  if (erroConvocacao) {
    console.error(
      "Erro ao atualizar convocação:",
      erroConvocacao
    );

    throw new Error(
      erroConvocacao.message
    );
  }

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}/convocacao`
  );

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}`
  );
}

export async function publicarConvocacao(
  partidaId: string,
  convocacaoId: string
) {
  const supabase = await createClient();

  const {
    count,
    error: erroContagem,
  } = await supabase
    .from(
      "convocacao_atletas"
    )
    .select(
      "id",
      {
        count: "exact",
        head: true,
      }
    )
    .eq(
      "convocacao_id",
      convocacaoId
    );

  if (erroContagem) {
    throw new Error(
      erroContagem.message
    );
  }

  if (!count) {
    throw new Error(
      "Selecione pelo menos um atleta antes de publicar a convocação."
    );
  }

  const { error } =
    await supabase
      .from("convocacoes")
      .update({
        status: "aberta",
        publicada_em:
          new Date().toISOString(),
        encerrada_em: null,
        atualizado_em:
          new Date().toISOString(),
      })
      .eq(
        "id",
        convocacaoId
      );

  if (error) {
    console.error(
      "Erro ao publicar convocação:",
      error
    );

    throw new Error(
      error.message
    );
  }

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}/convocacao`
  );

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}`
  );
}

export async function encerrarConvocacao(
  partidaId: string,
  convocacaoId: string
) {
  const supabase = await createClient();

  const { error } =
    await supabase
      .from("convocacoes")
      .update({
        status: "encerrada",
        encerrada_em:
          new Date().toISOString(),
        atualizado_em:
          new Date().toISOString(),
      })
      .eq(
        "id",
        convocacaoId
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}/convocacao`
  );

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}`
  );
}

export async function reabrirConvocacao(
  partidaId: string,
  convocacaoId: string
) {
  const supabase = await createClient();

  const { error } =
    await supabase
      .from("convocacoes")
      .update({
        status: "aberta",
        encerrada_em: null,
        atualizado_em:
          new Date().toISOString(),
      })
      .eq(
        "id",
        convocacaoId
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}/convocacao`
  );

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}`
  );
}

export async function voltarPartida(
  partidaId: string
) {
  redirect(
    `/admin/esportivo/partidas/${partidaId}`
  );
}
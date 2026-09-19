"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function texto(
  formData: FormData,
  nome: string
) {
  const valor = formData.get(nome);

  return typeof valor === "string"
    ? valor.trim()
    : "";
}

function inteiroOuNull(
  valor: string
) {
  if (!valor) {
    return null;
  }

  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return null;
  }

  return Math.max(
    0,
    Math.trunc(numero)
  );
}

async function verificarSumulaAberta(
  sumulaId: string
) {
  const supabase =
    await createClient();

  const {
    data: sumula,
    error,
  } =
    await supabase
      .from("sumulas")
      .select("id,status")
      .eq("id", sumulaId)
      .maybeSingle();

  if (
    error ||
    !sumula
  ) {
    throw new Error(
      "Súmula não encontrada."
    );
  }

  if (
    sumula.status ===
    "finalizada"
  ) {
    throw new Error(
      "A súmula já foi finalizada. Reabra a súmula antes de alterar os eventos."
    );
  }

  return supabase;
}

export async function adicionarEvento(
  partidaId: string,
  sumulaId: string,
  formData: FormData
) {
  const supabase =
    await verificarSumulaAberta(
      sumulaId
    );

  const tipo =
    texto(
      formData,
      "tipo"
    );

  const equipe =
    texto(
      formData,
      "equipe"
    ) || "cannabrava";

  const atletaId =
    texto(
      formData,
      "atleta_id"
    );

  const atletaRelacionadoId =
    texto(
      formData,
      "atleta_relacionado_id"
    );

  const periodo =
    texto(
      formData,
      "periodo"
    );

  const minuto =
    inteiroOuNull(
      texto(
        formData,
        "minuto"
      )
    );

  const acrescimo =
    inteiroOuNull(
      texto(
        formData,
        "acrescimo"
      )
    );

  const descricao =
    texto(
      formData,
      "descricao"
    );

  const tiposPermitidos = [
    "gol",
    "gol_contra",
    "penalti_convertido",
    "penalti_perdido",
    "assistencia",
    "cartao_amarelo",
    "cartao_vermelho",
    "substituicao",
    "lesao",
    "outro",
  ];

  const equipesPermitidas = [
    "cannabrava",
    "adversario",
  ];

  const periodosPermitidos = [
    "primeiro_tempo",
    "segundo_tempo",
    "prorrogacao_1",
    "prorrogacao_2",
    "penaltis",
  ];

  if (
    !tiposPermitidos.includes(
      tipo
    )
  ) {
    throw new Error(
      "Tipo de evento inválido."
    );
  }

  if (
    !equipesPermitidas.includes(
      equipe
    )
  ) {
    throw new Error(
      "Equipe inválida."
    );
  }

  if (
    periodo &&
    !periodosPermitidos.includes(
      periodo
    )
  ) {
    throw new Error(
      "Período inválido."
    );
  }

  if (
    equipe === "cannabrava" &&
    tipo !== "outro" &&
    !atletaId
  ) {
    throw new Error(
      "Selecione o atleta relacionado ao evento."
    );
  }

  if (
    tipo === "substituicao" &&
    (
      !atletaId ||
      !atletaRelacionadoId
    )
  ) {
    throw new Error(
      "Na substituição, informe o atleta que sai e o atleta que entra."
    );
  }

  if (
    tipo === "substituicao" &&
    atletaId ===
      atletaRelacionadoId
  ) {
    throw new Error(
      "O atleta que entra deve ser diferente do atleta que sai."
    );
  }

  const {
    data: usuarioId,
  } =
    await supabase.rpc(
      "usuario_id_atual"
    );

  const {
    error,
  } =
    await supabase
      .from("sumula_eventos")
      .insert({
        sumula_id:
          sumulaId,

        atleta_id:
          atletaId || null,

        atleta_relacionado_id:
          atletaRelacionadoId ||
          null,

        equipe,

        tipo,

        minuto,

        acrescimo,

        periodo:
          periodo || null,

        descricao:
          descricao || null,

        criado_por:
          usuarioId || null,
      });

  if (error) {
    console.error(
      "Erro ao registrar evento:",
      error
    );

    throw new Error(
      error.message
    );
  }

  await supabase
    .from("sumulas")
    .update({
      status:
        "em_preenchimento",
      atualizado_em:
        new Date().toISOString(),
    })
    .eq(
      "id",
      sumulaId
    );

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}/sumula/eventos`
  );

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}/sumula`
  );
}

export async function excluirEvento(
  partidaId: string,
  sumulaId: string,
  eventoId: string
) {
  const supabase =
    await verificarSumulaAberta(
      sumulaId
    );

  const {
    error,
  } =
    await supabase
      .from("sumula_eventos")
      .delete()
      .eq(
        "id",
        eventoId
      )
      .eq(
        "sumula_id",
        sumulaId
      );

  if (error) {
    console.error(
      "Erro ao excluir evento:",
      error
    );

    throw new Error(
      error.message
    );
  }

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}/sumula/eventos`
  );

  revalidatePath(
    `/admin/esportivo/partidas/${partidaId}/sumula`
  );
}
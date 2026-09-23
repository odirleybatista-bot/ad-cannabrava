"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function assinarTermo(
  formData: FormData
): Promise<void> {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (
    authError ||
    !user
  ) {
    redirect("/portalcannabrava");
  }

  const termoId =
    String(
      formData.get("termo_id") || ""
    );

  const aceite =
    formData.get("aceite");

  if (
    !termoId ||
    aceite !== "on"
  ) {
    redirect(
      "/portal-atleta/termo"
    );
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
    redirect(
      "/portal-atleta/termo"
    );
  }

  const {
    data: atleta,
    error: atletaError,
  } = await supabase
    .from("atletas")
    .select(`
      id,
      status
    `)
    .eq(
      "usuario_id",
      usuarioId
    )
    .maybeSingle();

  if (
    atletaError ||
    !atleta
  ) {
    redirect(
      "/portal-atleta/dados"
    );
  }

  const {
    data: termo,
    error: termoError,
  } = await supabase
    .from("termos_compromisso")
    .select(`
      id,
      atleta_id,
      status
    `)
    .eq(
      "id",
      termoId
    )
    .eq(
      "atleta_id",
      atleta.id
    )
    .maybeSingle();

  if (
    termoError ||
    !termo
  ) {
    redirect(
      "/portal-atleta/termo"
    );
  }

  if (
    termo.status === "assinado"
  ) {
    redirect(
      "/portal-atleta/termo"
    );
  }

  const agora =
    new Date().toISOString();

  const {
    error: assinaturaError,
  } = await supabase
    .from("termos_compromisso")
    .update({
      status: "assinado",
      aceite: true,
        assinado_em: agora,
      aceite_em: agora,
      atualizado_em: agora,
    })
    .eq(
      "id",
      termo.id
    )
    .eq(
      "atleta_id",
      atleta.id
    );

  if (
    assinaturaError
  ) {
    console.error(
      "Erro ao assinar termo:",
      {
        message:
          assinaturaError.message,
        code:
          assinaturaError.code,
        details:
          assinaturaError.details,
        hint:
          assinaturaError.hint,
      }
    );

    redirect(
      "/portal-atleta/termo"
    );
  }

  // --------------------------------------------------------
  // VERIFICAR VÍNCULO ESPORTIVO
  // --------------------------------------------------------

  const {
    data: vinculos,
    error: vinculoError,
  } = await supabase
    .from("atleta_vinculos")
    .select(`
      id,
      status
    `)
    .eq(
      "atleta_id",
      atleta.id
    );

  if (
    vinculoError
  ) {
    console.error(
      "Erro ao consultar vínculo esportivo:",
      {
        message:
          vinculoError.message,
        code:
          vinculoError.code,
        details:
          vinculoError.details,
        hint:
          vinculoError.hint,
      }
    );
  }

  const possuiVinculo =
    (vinculos || []).some(
      (vinculo) =>
        !vinculo.status ||
        [
          "ativo",
          "vigente",
          "vinculado",
          "aprovado",
        ].includes(
          vinculo.status
        )
    );

  // --------------------------------------------------------
  // ATIVAR ATLETA
  // --------------------------------------------------------

  if (
    possuiVinculo
  ) {
    const {
      error: ativacaoError,
    } = await supabase
      .from("atletas")
      .update({
        status: "ativo",
        atualizado_em: agora,
      })
      .eq(
        "id",
        atleta.id
      );

    if (
      ativacaoError
    ) {
      console.error(
        "Termo assinado, mas houve erro ao ativar atleta:",
        {
          message:
            ativacaoError.message,
          code:
            ativacaoError.code,
          details:
            ativacaoError.details,
          hint:
            ativacaoError.hint,
        }
      );
    }
  }

  redirect(
    "/portal-atleta/termo"
  );
}
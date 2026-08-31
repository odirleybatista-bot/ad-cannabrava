"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function atualizarStatusDocumento(
  atletaId: string,
  documentoId: string,
  status: "aprovado" | "correcao_solicitada",
  observacao?: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("atleta_documentos")
    .update({
      status,
      observacao: observacao?.trim() || null,
      analisado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", documentoId)
    .eq("atleta_id", atletaId);

  if (error) {
    return {
      sucesso: false,
      mensagem: "Não foi possível atualizar o documento.",
    };
  }

  const { data: documentos } = await supabase
    .from("atleta_documentos")
    .select("tipo,status")
    .eq("atleta_id", atletaId);

  const obrigatorios = [
    "identidade",
    "residencia",
    "eleitoral",
  ];

  const todosAprovados = obrigatorios.every((tipo) =>
    documentos?.some(
      (documento) =>
        documento.tipo === tipo &&
        documento.status === "aprovado"
    )
  );

  const possuiCorrecao = documentos?.some(
    (documento) =>
      documento.status === "correcao_solicitada"
  );

  await supabase
    .from("atletas")
    .update({
      status: todosAprovados
        ? "aprovado"
        : possuiCorrecao
        ? "correcao_solicitada"
        : "em_analise",
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", atletaId);

  if (status === "correcao_solicitada") {
    const { data: atletaUsuario } =
      await supabase
        .from("atletas")
        .select("usuario_id")
        .eq("id", atletaId)
        .maybeSingle();

    if (atletaUsuario?.usuario_id) {
      await supabase
        .from("notificacoes")
        .insert({
          usuario_id:
            atletaUsuario.usuario_id,

          titulo:
            "Correção de documento",

          mensagem:
            observacao?.trim() ||
            "Um dos seus documentos precisa ser corrigido.",

          tipo:
            "documento",

          link:
            "/portal-atleta/documentos",
        });
    }
  }
  revalidatePath(`/admin/esportivo/atletas/${atletaId}`);
  revalidatePath("/admin/esportivo/atletas");

  return {
    sucesso: true,
  };
}

export async function salvarVinculo(
  atletaId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const modalidade = String(
    formData.get("modalidade") || ""
  ).trim();

  const temporada = String(
    formData.get("temporada") || ""
  ).trim();

  const dataInicio =
    String(formData.get("data_inicio") || "").trim() || null;

  const dataFim =
    String(formData.get("data_fim") || "").trim() || null;

  if (!modalidade || !temporada) {
    return {
      sucesso: false,
      mensagem: "Informe modalidade e temporada.",
    };
  }

  const { data: atleta } = await supabase
    .from("atletas")
    .select("status")
    .eq("id", atletaId)
    .single();

  if (!atleta) {
    return {
      sucesso: false,
      mensagem: "Atleta não encontrado.",
    };
  }

  if (
    atleta.status !== "aprovado" &&
    atleta.status !== "vinculado" &&
    atleta.status !== "termo_liberado" &&
    atleta.status !== "ativo"
  ) {
    return {
      sucesso: false,
      mensagem:
        "O vínculo só pode ser definido após a aprovação dos documentos.",
    };
  }

  const { data: existente } = await supabase
    .from("atleta_vinculos")
    .select("id")
    .eq("atleta_id", atletaId)
    .eq("temporada", temporada)
    .eq("modalidade", modalidade)
    .maybeSingle();

  let erro;

  if (existente) {
    const resultado = await supabase
      .from("atleta_vinculos")
      .update({
        data_inicio: dataInicio,
        data_fim: dataFim,
        status: "ativo",
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", existente.id);

    erro = resultado.error;
  } else {
    const resultado = await supabase
      .from("atleta_vinculos")
      .insert({
        atleta_id: atletaId,
        modalidade,
        temporada,
        data_inicio: dataInicio,
        data_fim: dataFim,
        status: "ativo",
      });

    erro = resultado.error;
  }

  if (erro) {
    console.error("Erro ao salvar vínculo:", erro);

    return {
      sucesso: false,
      mensagem: "Não foi possível salvar o vínculo.",
    };
  }

  await supabase
    .from("atletas")
    .update({
      status: "vinculado",
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", atletaId);

  if (status === "correcao_solicitada") {
    const { data: atletaUsuario } =
      await supabase
        .from("atletas")
        .select("usuario_id")
        .eq("id", atletaId)
        .maybeSingle();

    if (atletaUsuario?.usuario_id) {
      await supabase
        .from("notificacoes")
        .insert({
          usuario_id:
            atletaUsuario.usuario_id,

          titulo:
            "Correção de documento",

          mensagem:
            observacao?.trim() ||
            "Um dos seus documentos precisa ser corrigido.",

          tipo:
            "documento",

          link:
            "/portal-atleta/documentos",
        });
    }
  }
  revalidatePath(`/admin/esportivo/atletas/${atletaId}`);
  revalidatePath("/admin/esportivo/atletas");

  return {
    sucesso: true,
  };
}
export async function gerarTermo(
  atletaId: string
) {
  const supabase = await createClient();

  const { data: atleta, error: atletaError } =
    await supabase
      .from("atletas")
      .select(`
        id,
        nome,
        cpf,
        rg,
        data_nascimento,
        modalidade,
        posicao,
        status
      `)
      .eq("id", atletaId)
      .single();

  if (atletaError || !atleta) {
    return {
      sucesso: false,
      mensagem: "Atleta não encontrado.",
    };
  }

  if (
    ![
      "vinculado",
      "termo_liberado",
      "ativo",
    ].includes(atleta.status)
  ) {
    return {
      sucesso: false,
      mensagem:
        "O atleta precisa possuir vínculo esportivo antes da geração do termo.",
    };
  }

  const { data: vinculo, error: vinculoError } =
    await supabase
      .from("atleta_vinculos")
      .select("*")
      .eq("atleta_id", atletaId)
      .eq("status", "ativo")
      .order("criado_em", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

  if (vinculoError || !vinculo) {
    return {
      sucesso: false,
      mensagem:
        "Nenhum vínculo esportivo ativo foi encontrado.",
    };
  }

  const periodoInicio =
    vinculo.data_inicio
      ? formatarDataTermo(vinculo.data_inicio)
      : "não informado";

  const periodoFim =
    vinculo.data_fim
      ? formatarDataTermo(vinculo.data_fim)
      : "não informado";

  const conteudo = `
TERMO DE COMPROMISSO DO ATLETA

ASSOCIAÇÃO DESPORTIVA CANNABRAVA

Pelo presente instrumento, a Associação Desportiva Cannabrava e o atleta abaixo identificado estabelecem o presente Termo de Compromisso para participação nas atividades esportivas da entidade.

1. IDENTIFICAÇÃO DO ATLETA

Nome: ${atleta.nome}
CPF: ${atleta.cpf || "Não informado"}
RG: ${atleta.rg || "Não informado"}
Data de nascimento: ${
    atleta.data_nascimento
      ? formatarDataTermo(
          atleta.data_nascimento
        )
      : "Não informada"
  }

2. VÍNCULO ESPORTIVO

Modalidade: ${vinculo.modalidade}
Temporada: ${vinculo.temporada}
Posição: ${atleta.posicao || "Não informada"}
Período: ${periodoInicio} a ${periodoFim}

3. COMPROMISSOS DO ATLETA

O atleta compromete-se a:

I - respeitar o Estatuto, regulamentos, normas internas e decisões da Associação Desportiva Cannabrava;

II - manter conduta compatível com os princípios esportivos, institucionais e disciplinares da associação;

III - zelar pelo nome, imagem, patrimônio, uniformes, materiais e demais bens disponibilizados pela entidade;

IV - comparecer aos jogos, competições, atividades oficiais e demais compromissos para os quais for regularmente convocado, salvo motivo devidamente justificado;

V - informar à associação qualquer alteração relevante em seus dados pessoais ou condição de participação esportiva;

VI - respeitar dirigentes, membros da comissão técnica, atletas, adversários, árbitros, torcedores e demais participantes das atividades esportivas.

4. PARTICIPAÇÃO ESPORTIVA

A participação do atleta ocorrerá conforme planejamento da comissão técnica, regulamentos das competições e decisões administrativas da Associação Desportiva Cannabrava.

O presente termo não garante escalação, titularidade, número de camisa específico ou participação mínima em partidas.

5. USO DE IMAGEM

O atleta autoriza, observadas as normas aplicáveis, a utilização de sua imagem em registros das atividades da Associação Desportiva Cannabrava, incluindo fotografias, vídeos, publicações institucionais, materiais esportivos e divulgação das atividades da entidade.

6. VIGÊNCIA

O presente termo está relacionado ao vínculo esportivo da temporada ${vinculo.temporada}, podendo ser encerrado ou atualizado conforme as normas e decisões da Associação Desportiva Cannabrava.

7. DECLARAÇÃO

O atleta declara que leu e compreendeu o conteúdo deste Termo de Compromisso e manifesta sua concordância por meio de aceite eletrônico no Portal do Atleta.
  `.trim();

  const { data: existente } =
    await supabase
      .from("termos_compromisso")
      .select("id")
      .eq("atleta_id", atletaId)
      .eq("vinculo_id", vinculo.id)
      .in("status", [
        "rascunho",
        "gerado",
        "aguardando_assinatura",
      ])
      .maybeSingle();

  let termoId: string | null = null;
  let erro;

  if (existente) {
    const resultado = await supabase
      .from("termos_compromisso")
      .update({
        titulo:
          "Termo de Compromisso do Atleta",
        conteudo,
        status: "gerado",
        gerado_em:
          new Date().toISOString(),
        liberado_em: null,
        aceite: false,
        assinado_em: null,
        atualizado_em:
          new Date().toISOString(),
      })
      .eq("id", existente.id)
      .select("id")
      .single();

    erro = resultado.error;
    termoId = resultado.data?.id || null;
  } else {
    const resultado = await supabase
      .from("termos_compromisso")
      .insert({
        atleta_id: atletaId,
        vinculo_id: vinculo.id,
        versao: "1.0",
        titulo:
          "Termo de Compromisso do Atleta",
        conteudo,
        status: "gerado",
        gerado_em:
          new Date().toISOString(),
      })
      .select("id")
      .single();

    erro = resultado.error;
    termoId = resultado.data?.id || null;
  }

  if (erro) {
    console.error(
      "Erro ao gerar termo:",
      erro
    );

    return {
      sucesso: false,
      mensagem:
        "Não foi possível gerar o termo.",
    };
  }

  revalidatePath(
    `/admin/esportivo/atletas/${atletaId}`
  );

  return {
    sucesso: true,
    termoId,
  };
}

export async function liberarTermo(
  atletaId: string,
  termoId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("termos_compromisso")
    .update({
      status:
        "aguardando_assinatura",
      liberado_em:
        new Date().toISOString(),
      atualizado_em:
        new Date().toISOString(),
    })
    .eq("id", termoId)
    .eq("atleta_id", atletaId)
    .eq("status", "gerado");

  if (error) {
    console.error(
      "Erro ao liberar termo:",
      error
    );

    return {
      sucesso: false,
      mensagem:
        "Não foi possível liberar o termo.",
    };
  }

  await supabase
    .from("atletas")
    .update({
      status: "termo_liberado",
      atualizado_em:
        new Date().toISOString(),
    })
    .eq("id", atletaId);

  revalidatePath(
    `/admin/esportivo/atletas/${atletaId}`
  );

  revalidatePath(
    "/admin/esportivo/atletas"
  );

  return {
    sucesso: true,
  };
}

function formatarDataTermo(
  data: string
) {
  const [ano, mes, dia] =
    data.split("-");

  return `${dia}/${mes}/${ano}`;
}
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

  const agora = new Date().toISOString();

  const { error } = await supabase
    .from("atleta_documentos")
    .update({
      status,
      observacao:
        status === "correcao_solicitada"
          ? observacao?.trim() || null
          : null,
      analisado_em: agora,
      atualizado_em: agora,
    })
    .eq("id", documentoId)
    .eq("atleta_id", atletaId);

  if (error) {
    console.error("Erro ao atualizar documento:", error);

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
    "foto_3x4",
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
      atualizado_em: agora,
    })
    .eq("id", atletaId);

  if (status === "correcao_solicitada") {
    const { data: atleta } = await supabase
      .from("atletas")
      .select("usuario_id")
      .eq("id", atletaId)
      .maybeSingle();

    if (atleta?.usuario_id) {
      const { error: notificacaoError } = await supabase
        .from("notificacoes")
        .insert({
          usuario_id: atleta.usuario_id,
          titulo: "Correção de documento",
          mensagem:
            observacao?.trim() ||
            "Um dos seus documentos precisa ser corrigido.",
          tipo: "documento",
          link: "/portal-atleta/documentos",
        });

      if (notificacaoError) {
        console.error(
          "Erro ao criar notificação:",
          notificacaoError
        );
      }
    }
  }

  revalidatePath(
    `/admin/esportivo/atletas/${atletaId}`
  );
  revalidatePath("/admin/esportivo/atletas");
  revalidatePath("/portal-atleta");
  revalidatePath("/portal-atleta/documentos");
  revalidatePath("/portal-atleta/notificacoes");

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

  const { data: atleta, error: atletaError } =
    await supabase
      .from("atletas")
      .select("status")
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
      "aprovado",
      "vinculado",
      "termo_liberado",
      "ativo",
    ].includes(atleta.status)
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

  const agora = new Date().toISOString();

  let erro;

  if (existente) {
    const resultado = await supabase
      .from("atleta_vinculos")
      .update({
        data_inicio: dataInicio,
        data_fim: dataFim,
        status: "ativo",
        atualizado_em: agora,
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
      atualizado_em: agora,
    })
    .eq("id", atletaId);

  revalidatePath(
    `/admin/esportivo/atletas/${atletaId}`
  );
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

  const periodoInicio = vinculo.data_inicio
    ? formatarDataTermo(vinculo.data_inicio)
    : "não informado";

  const periodoFim = vinculo.data_fim
    ? formatarDataTermo(vinculo.data_fim)
    : "não informado";

  const nascimento = atleta.data_nascimento
    ? formatarDataTermo(atleta.data_nascimento)
    : "Não informada";

  const conteudo = `
TERMO DE COMPROMISSO DO ATLETA

ASSOCIAÇÃO DESPORTIVA CANNABRAVA

Pelo presente instrumento, a Associação Desportiva Cannabrava e o atleta abaixo identificado estabelecem o presente Termo de Compromisso para participação nas atividades esportivas da entidade.

1. IDENTIFICAÇÃO DO ATLETA

Nome: ${atleta.nome}
CPF: ${atleta.cpf || "Não informado"}
RG: ${atleta.rg || "Não informado"}
Data de nascimento: ${nascimento}

2. VÍNCULO ESPORTIVO

Modalidade: ${vinculo.modalidade}
Temporada: ${vinculo.temporada}
Posição: ${atleta.posicao || "Não informada"}
Período: ${periodoInicio} a ${periodoFim}

3. COMPROMISSOS DO ATLETA

O atleta compromete-se a respeitar o Estatuto, regulamentos, normas internas e decisões da Associação Desportiva Cannabrava, bem como manter conduta compatível com os princípios esportivos e institucionais da entidade.

4. PARTICIPAÇÃO ESPORTIVA

A participação do atleta ocorrerá conforme planejamento da comissão técnica, regulamentos das competições e decisões administrativas da Associação Desportiva Cannabrava.

5. USO DE IMAGEM

O atleta autoriza, observadas as normas aplicáveis, a utilização de sua imagem em registros e materiais institucionais relacionados às atividades da Associação Desportiva Cannabrava.

6. VIGÊNCIA

O presente termo está relacionado ao vínculo esportivo da temporada ${vinculo.temporada}.

7. DECLARAÇÃO

O atleta declara que leu e compreendeu o conteúdo deste Termo de Compromisso e manifesta sua concordância por meio de aceite eletrônico no Portal do Atleta.
  `.trim();

  const { data: existente } = await supabase
    .from("termos_compromisso")
    .select("id")
    .eq("atleta_id", atletaId)
    .eq("vinculo_id", vinculo.id)
    .in("status", [
      "rascunho",
      "gerado",
      "aguardando_assinatura",
    ])
    .limit(1)
    .maybeSingle();

  const agora = new Date().toISOString();

  let erro;
  let termoId: string | null = null;

  if (existente) {
    const resultado = await supabase
      .from("termos_compromisso")
      .update({
        titulo: "Termo de Compromisso do Atleta",
        conteudo,
        status: "gerado",
        gerado_em: agora,
        liberado_em: null,
        assinado_em: null,
        aceite: false,
        atualizado_em: agora,
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
        titulo: "Termo de Compromisso do Atleta",
        conteudo,
        status: "gerado",
        gerado_em: agora,
      })
      .select("id")
      .single();

    erro = resultado.error;
    termoId = resultado.data?.id || null;
  }

  if (erro) {
    console.error("Erro ao gerar termo:", erro);

    return {
      sucesso: false,
      mensagem: "Não foi possível gerar o termo.",
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

  const agora = new Date().toISOString();

  const { error } = await supabase
    .from("termos_compromisso")
    .update({
      status: "aguardando_assinatura",
      liberado_em: agora,
      atualizado_em: agora,
    })
    .eq("id", termoId)
    .eq("atleta_id", atletaId)
    .eq("status", "gerado");

  if (error) {
    console.error("Erro ao liberar termo:", error);

    return {
      sucesso: false,
      mensagem: "Não foi possível liberar o termo.",
    };
  }

  await supabase
    .from("atletas")
    .update({
      status: "termo_liberado",
      atualizado_em: agora,
    })
    .eq("id", atletaId);

  revalidatePath(
    `/admin/esportivo/atletas/${atletaId}`
  );
  revalidatePath("/admin/esportivo/atletas");
  revalidatePath("/portal-atleta/termo");

  return {
    sucesso: true,
  };
}

function formatarDataTermo(
  data: string
) {
  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
}
export async function excluirCadastroAtleta(
  atletaId: string
) {
  const supabase = await createClient();

  // ---------------------------------------------------------
  // 1. CONFIRMAR USUÁRIO AUTENTICADO
  // ---------------------------------------------------------

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      sucesso: false,
      mensagem: "Usuário não autenticado.",
    };
  }

  // ---------------------------------------------------------
  // 2. LOCALIZAR USUÁRIO INTERNO
  // ---------------------------------------------------------

  const {
    data: usuarioAtual,
    error: usuarioError,
  } = await supabase
    .from("usuarios")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (usuarioError || !usuarioAtual) {
    return {
      sucesso: false,
      mensagem: "Usuário administrativo não localizado.",
    };
  }

  // ---------------------------------------------------------
  // 3. CONFIRMAR PERFIL ADMINISTRADOR
  // ---------------------------------------------------------

  const {
    data: usuarioPerfis,
    error: perfisUsuarioError,
  } = await supabase
    .from("usuario_perfis")
    .select("perfil_id")
    .eq("usuario_id", usuarioAtual.id);

  if (perfisUsuarioError) {
    return {
      sucesso: false,
      mensagem: "Não foi possível validar as permissões.",
    };
  }

  const idsPerfis =
    (usuarioPerfis || []).map(
      (item) => item.perfil_id
    );

  if (idsPerfis.length === 0) {
    return {
      sucesso: false,
      mensagem:
        "Somente administradores podem excluir cadastros.",
    };
  }

  const {
    data: perfis,
    error: perfisError,
  } = await supabase
    .from("perfis")
    .select("id,nome")
    .in("id", idsPerfis);

  if (perfisError) {
    return {
      sucesso: false,
      mensagem: "Não foi possível validar o perfil.",
    };
  }

  const ehAdministrador =
    (perfis || []).some((perfil) =>
      normalizarPerfil(perfil.nome) ===
      "administrador"
    );

  if (!ehAdministrador) {
    return {
      sucesso: false,
      mensagem:
        "Somente o Administrador pode excluir o cadastro de um atleta.",
    };
  }

  // ---------------------------------------------------------
  // 4. CONFIRMAR ATLETA
  // ---------------------------------------------------------

  const {
    data: atleta,
    error: atletaError,
  } = await supabase
    .from("atletas")
    .select("id,nome,usuario_id")
    .eq("id", atletaId)
    .maybeSingle();

  if (atletaError || !atleta) {
    return {
      sucesso: false,
      mensagem: "Atleta não encontrado.",
    };
  }

  // ---------------------------------------------------------
  // 5. LOCALIZAR ARQUIVOS PARA LIMPAR STORAGE
  // ---------------------------------------------------------

  const {
    data: documentos,
    error: documentosError,
  } = await supabase
    .from("atleta_documentos")
    .select("caminho_arquivo")
    .eq("atleta_id", atletaId);

  if (documentosError) {
    console.error(
      "Erro ao localizar documentos:",
      documentosError
    );
  }

  const caminhosArquivos =
    (documentos || [])
      .map(
        (documento) =>
          documento.caminho_arquivo
      )
      .filter(
        (caminho): caminho is string =>
          Boolean(caminho)
      );

  // ---------------------------------------------------------
  // 6. EXCLUIR TERMOS
  // ---------------------------------------------------------

  const { error: termoError } =
    await supabase
      .from("termos_compromisso")
      .delete()
      .eq("atleta_id", atletaId);

  if (termoError) {
    console.error(
      "Erro ao excluir termos:",
      termoError
    );

    return {
      sucesso: false,
      mensagem:
        "Não foi possível excluir o Termo de Compromisso.",
    };
  }

  // ---------------------------------------------------------
  // 7. EXCLUIR VÍNCULOS
  // ---------------------------------------------------------

  const { error: vinculoError } =
    await supabase
      .from("atleta_vinculos")
      .delete()
      .eq("atleta_id", atletaId);

  if (vinculoError) {
    console.error(
      "Erro ao excluir vínculos:",
      vinculoError
    );

    return {
      sucesso: false,
      mensagem:
        "Não foi possível excluir o vínculo esportivo.",
    };
  }

  // ---------------------------------------------------------
  // 8. EXCLUIR DOCUMENTOS DO BANCO
  // ---------------------------------------------------------

  const { error: excluirDocumentosError } =
    await supabase
      .from("atleta_documentos")
      .delete()
      .eq("atleta_id", atletaId);

  if (excluirDocumentosError) {
    console.error(
      "Erro ao excluir documentos:",
      excluirDocumentosError
    );

    return {
      sucesso: false,
      mensagem:
        "Não foi possível excluir os documentos.",
    };
  }

  // ---------------------------------------------------------
  // 9. EXCLUIR ARQUIVOS DO STORAGE
  // ---------------------------------------------------------

  if (caminhosArquivos.length > 0) {
    const { error: storageError } =
      await supabase.storage
        .from("atleta-documentos")
        .remove(caminhosArquivos);

    if (storageError) {
      // Não impede a exclusão do cadastro.
      // Apenas registra para eventual limpeza posterior.
      console.error(
        "Aviso: não foi possível remover todos os arquivos do Storage:",
        storageError
      );
    }
  }

  // ---------------------------------------------------------
  // 10. EXCLUIR CADASTRO DO ATLETA
  // ---------------------------------------------------------

  const { error: excluirAtletaError } =
    await supabase
      .from("atletas")
      .delete()
      .eq("id", atletaId);

  if (excluirAtletaError) {
    console.error(
      "Erro ao excluir atleta:",
      excluirAtletaError
    );

    return {
      sucesso: false,
      mensagem:
        "Não foi possível excluir o cadastro do atleta. Pode existir outro registro vinculado a ele.",
    };
  }

  revalidatePath("/admin/esportivo/atletas");
  revalidatePath("/admin");
  revalidatePath("/portal-atleta");
  revalidatePath("/portal-atleta/dados");
  revalidatePath("/portal-atleta/documentos");

  return {
    sucesso: true,
    mensagem:
      "Cadastro excluído. O atleta poderá iniciar um novo processo cadastral.",
  };
}

function normalizarPerfil(
  valor: string | null
) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "esportivo-logos";

function texto(valor: FormDataEntryValue | null) {
  return String(valor ?? "").trim();
}

function extensaoImagem(file: File) {
  const nome = file.name.toLowerCase();

  if (nome.endsWith(".png")) return "png";
  if (nome.endsWith(".jpg")) return "jpg";
  if (nome.endsWith(".jpeg")) return "jpeg";
  if (nome.endsWith(".webp")) return "webp";

  if (file.type === "image/png") return "png";
  if (file.type === "image/jpeg") return "jpeg";
  if (file.type === "image/webp") return "webp";

  throw new Error("Formato de imagem não permitido.");
}

function validarImagem(file: File) {
  if (!file || file.size === 0) {
    throw new Error("Selecione uma imagem.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("O arquivo precisa ser uma imagem.");
  }

  const limite = 3 * 1024 * 1024;

  if (file.size > limite) {
    throw new Error("A imagem deve ter no máximo 3 MB.");
  }
}

async function enviarImagem(
  caminho: string,
  file: File
) {
  validarImagem(file);

  const supabase = await createClient();

  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(
      caminho,
      bytes,
      {
        contentType: file.type,
        upsert: true,
      }
    );

  if (error) {
    throw new Error(
      `Erro no upload: ${error.message}`
    );
  }

  const {
    data: publicUrl,
  } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(caminho);

  return publicUrl.publicUrl;
}


export async function salvarLogoCompeticao(
  formData: FormData
) {
  const competicaoId = texto(
    formData.get("competicao_id")
  );

  const file = formData.get("logo");

  if (
    !competicaoId ||
    !(file instanceof File)
  ) {
    throw new Error(
      "Dados do logotipo incompletos."
    );
  }

  const extensao = extensaoImagem(file);

  const caminho =
    `competicoes/${competicaoId}/logo.${extensao}`;

  const url = await enviarImagem(
    caminho,
    file
  );

  const supabase = await createClient();

  const { error } = await supabase
    .from("competicoes")
    .update({
      logo_url: url,
    })
    .eq("id", competicaoId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(
    `/admin/esportivo/competicoes/${competicaoId}`
  );
}


export async function cadastrarEquipe(
  formData: FormData
) {
  const competicaoId = texto(
    formData.get("competicao_id")
  );

  const nome = texto(
    formData.get("nome")
  );

  const nomeCurto = texto(
    formData.get("nome_curto")
  );

  const sigla = texto(
    formData.get("sigla")
  );

  const cidade = texto(
    formData.get("cidade")
  );

  const uf = texto(
    formData.get("uf")
  ).toUpperCase();

  const modalidade =
    texto(formData.get("modalidade")) ||
    "Futebol";

  if (!competicaoId) {
    throw new Error(
      "Competição não identificada."
    );
  }

  if (!nome) {
    throw new Error(
      "Informe o nome da equipe."
    );
  }

  const supabase = await createClient();

  const {
    data: equipe,
    error: erroEquipe,
  } = await supabase
    .from("equipes")
    .insert({
      nome,
      nome_curto:
        nomeCurto || null,
      sigla:
        sigla || null,
      cidade:
        cidade || null,
      uf:
        uf || null,
      modalidade,
      ativo: true,
    })
    .select("id")
    .single();

  if (erroEquipe) {
    throw new Error(
      erroEquipe.message
    );
  }

  const {
    error: erroVinculo,
  } = await supabase
    .from("competicao_equipes")
    .insert({
      competicao_id:
        competicaoId,
      equipe_id:
        equipe.id,
      status:
        "confirmada",
    });

  if (erroVinculo) {
    await supabase
      .from("equipes")
      .delete()
      .eq("id", equipe.id);

    throw new Error(
      erroVinculo.message
    );
  }

  revalidatePath(
    `/admin/esportivo/competicoes/${competicaoId}`
  );
}


export async function salvarLogoEquipe(
  formData: FormData
) {
  const competicaoId = texto(
    formData.get("competicao_id")
  );

  const equipeId = texto(
    formData.get("equipe_id")
  );

  const file = formData.get("logo");

  if (
    !competicaoId ||
    !equipeId ||
    !(file instanceof File)
  ) {
    throw new Error(
      "Dados do escudo incompletos."
    );
  }

  const extensao = extensaoImagem(file);

  const caminho =
    `equipes/${equipeId}/logo.${extensao}`;

  const url = await enviarImagem(
    caminho,
    file
  );

  const supabase = await createClient();

  const { error } = await supabase
    .from("equipes")
    .update({
      logo_url: url,
    })
    .eq("id", equipeId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(
    `/admin/esportivo/competicoes/${competicaoId}`
  );
}


export async function criarGrupo(
  formData: FormData
) {
  const competicaoId = texto(
    formData.get("competicao_id")
  );

  const nome = texto(
    formData.get("nome")
  );

  const ordem = Number(
    formData.get("ordem") || 1
  );

  if (!competicaoId || !nome) {
    throw new Error(
      "Informe o nome do grupo."
    );
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("competicao_grupos")
    .insert({
      competicao_id:
        competicaoId,
      nome,
      ordem:
        Number.isFinite(ordem)
          ? ordem
          : 1,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(
    `/admin/esportivo/competicoes/${competicaoId}`
  );
}


export async function adicionarEquipeGrupo(
  formData: FormData
) {
  const competicaoId = texto(
    formData.get("competicao_id")
  );

  const grupoId = texto(
    formData.get("grupo_id")
  );

  const equipeId = texto(
    formData.get("equipe_id")
  );

  if (
    !competicaoId ||
    !grupoId ||
    !equipeId
  ) {
    throw new Error(
      "Grupo ou equipe não identificado."
    );
  }

  const supabase = await createClient();

  /*
   * Uma equipe deve pertencer a apenas
   * um grupo da mesma competição.
   */

  const {
    data: gruposCompeticao,
  } = await supabase
    .from("competicao_grupos")
    .select("id")
    .eq(
      "competicao_id",
      competicaoId
    );

  const ids =
    (gruposCompeticao ?? [])
      .map((g: any) => g.id);

  if (ids.length > 0) {
    await supabase
      .from("competicao_grupo_equipes")
      .delete()
      .eq(
        "equipe_id",
        equipeId
      )
      .in(
        "grupo_id",
        ids
      );
  }

  const { error } = await supabase
    .from("competicao_grupo_equipes")
    .insert({
      grupo_id:
        grupoId,
      equipe_id:
        equipeId,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(
    `/admin/esportivo/competicoes/${competicaoId}`
  );
}


export async function removerEquipeGrupo(
  formData: FormData
) {
  const competicaoId = texto(
    formData.get("competicao_id")
  );

  const grupoId = texto(
    formData.get("grupo_id")
  );

  const equipeId = texto(
    formData.get("equipe_id")
  );

  const supabase = await createClient();

  const { error } = await supabase
    .from("competicao_grupo_equipes")
    .delete()
    .eq(
      "grupo_id",
      grupoId
    )
    .eq(
      "equipe_id",
      equipeId
    );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(
    `/admin/esportivo/competicoes/${competicaoId}`
  );
}


export async function removerEquipeCompeticao(
  formData: FormData
) {
  const competicaoId = texto(
    formData.get("competicao_id")
  );

  const equipeId = texto(
    formData.get("equipe_id")
  );

  const supabase = await createClient();

  const {
    data: grupos,
  } = await supabase
    .from("competicao_grupos")
    .select("id")
    .eq(
      "competicao_id",
      competicaoId
    );

  const grupoIds =
    (grupos ?? [])
      .map((g: any) => g.id);

  if (grupoIds.length > 0) {
    await supabase
      .from("competicao_grupo_equipes")
      .delete()
      .eq(
        "equipe_id",
        equipeId
      )
      .in(
        "grupo_id",
        grupoIds
      );
  }

  const { error } = await supabase
    .from("competicao_equipes")
    .delete()
    .eq(
      "competicao_id",
      competicaoId
    )
    .eq(
      "equipe_id",
      equipeId
    );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(
    `/admin/esportivo/competicoes/${competicaoId}`
  );
}
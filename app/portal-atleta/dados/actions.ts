"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function valor(
  formData: FormData,
  nome: string
) {
  const campo = formData.get(nome);

  return typeof campo === "string"
    ? campo.trim()
    : "";
}

function nullSeVazio(
  valorRecebido: string
) {
  return valorRecebido === ""
    ? null
    : valorRecebido;
}

export async function salvarDadosAtleta(
  formData: FormData
): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: usuarioId } =
    await supabase.rpc(
      "usuario_id_atual"
    );

  if (!usuarioId) {
    throw new Error(
      "Não foi possível localizar o seu cadastro de usuário."
    );
  }

  const nome = valor(
    formData,
    "nome"
  );

  const cpf = valor(
    formData,
    "cpf"
  );

  const rg = valor(
    formData,
    "rg"
  );

  const dataNascimento = valor(
    formData,
    "data_nascimento"
  );

  const telefone = valor(
    formData,
    "telefone"
  );

  const email = valor(
    formData,
    "email"
  );

  const endereco = valor(
    formData,
    "endereco"
  );

  const bairro = valor(
    formData,
    "bairro"
  );

  const cidade = valor(
    formData,
    "cidade"
  );

  const uf = valor(
    formData,
    "uf"
  );

  const modalidade = valor(
    formData,
    "modalidade"
  );

  const posicao = valor(
    formData,
    "posicao"
  );

  if (
    !nome ||
    !cpf ||
    !rg ||
    !dataNascimento ||
    !telefone ||
    !email ||
    !endereco ||
    !bairro ||
    !cidade ||
    !uf ||
    !modalidade ||
    !posicao
  ) {
    throw new Error(
      "Preencha todos os campos obrigatórios."
    );
  }

  const { data: atletaAtual } =
    await supabase
      .from("atletas")
      .select("id")
      .eq("usuario_id", usuarioId)
      .order("criado_em", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

  const dados: Record<string, unknown> = {
    usuario_id: usuarioId,
    nome,
    apelido: nullSeVazio(
      valor(formData, "apelido")
    ),
    cpf,
    rg,
    data_nascimento: dataNascimento,
    telefone,
    email,
    endereco,
    numero: nullSeVazio(
      valor(formData, "numero")
    ),
    bairro,
    cidade,
    uf: uf.toUpperCase(),
    modalidade,
    posicao,
    numero_camisa:
      nullSeVazio(
        valor(
          formData,
          "numero_camisa"
        )
      ),
    pe: nullSeVazio(
      valor(formData, "pe")
    ),
    altura: nullSeVazio(
      valor(formData, "altura")
    ),
    peso: nullSeVazio(
      valor(formData, "peso")
    ),
    contato_emergencia:
      nullSeVazio(
        valor(
          formData,
          "contato_emergencia"
        )
      ),
    telefone_emergencia:
      nullSeVazio(
        valor(
          formData,
          "telefone_emergencia"
        )
      ),
    atualizado_em:
      new Date().toISOString(),
  };

  let erro;

  if (atletaAtual?.id) {
    const resultado =
      await supabase
        .from("atletas")
        .update(dados)
        .eq("id", atletaAtual.id);

    erro = resultado.error;
  } else {
    const resultado =
      await supabase
        .from("atletas")
        .insert({
          ...dados,
          status: "pre_cadastro",
        });

    erro = resultado.error;
  }

  if (erro) {
    console.error(
      "Erro ao salvar atleta:",
      erro
    );

    throw new Error(
      erro.message ||
        "Não foi possível salvar os dados."
    );
  }

  await supabase
    .from("usuarios")
    .update({
      nome,
      email,
    })
    .eq("id", usuarioId);

  redirect(
    "/portal-atleta/documentos"
  );
}
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

function numeroOuNull(
  valorRecebido: string
) {
  if (!valorRecebido) {
    return null;
  }

  const numero = Number(
    valorRecebido.replace(",", ".")
  );

  return Number.isFinite(numero)
    ? numero
    : null;
}

export async function salvarDadosAtleta(
  formData: FormData
): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const {
    data: usuarioId,
    error: usuarioError,
  } = await supabase.rpc(
    "usuario_id_atual"
  );

  if (usuarioError || !usuarioId) {
    throw new Error(
      "Não foi possível localizar o seu cadastro de usuário."
    );
  }

  const nome =
    valor(formData, "nome");

  const cpf =
    valor(formData, "cpf");

  const rg =
    valor(formData, "rg");

  const dataNascimento =
    valor(
      formData,
      "data_nascimento"
    );

  const telefone =
    valor(formData, "telefone");

  const email =
    valor(formData, "email");

  /*
   * A tela pode enviar "endereco".
   * No banco a coluna correta é "logradouro".
   */
  const logradouro =
    valor(formData, "logradouro") ||
    valor(formData, "endereco");

  const numero =
    valor(formData, "numero");

  const bairro =
    valor(formData, "bairro");

  const cidade =
    valor(formData, "cidade");

  const uf =
    valor(formData, "uf");

  const cep =
    valor(formData, "cep");

  const modalidade =
    valor(formData, "modalidade");

  const posicao =
    valor(formData, "posicao");

  if (
    !nome ||
    !cpf ||
    !rg ||
    !dataNascimento ||
    !telefone ||
    !email ||
    !logradouro ||
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

  const {
    data: atletaAtual,
    error: atletaBuscaError,
  } =
    await supabase
      .from("atletas")
      .select("id,status")
      .eq(
        "usuario_id",
        usuarioId
      )
      .order(
        "criado_em",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle();

  if (atletaBuscaError) {
    console.error(
      "Erro ao localizar atleta:",
      atletaBuscaError
    );

    throw new Error(
      "Não foi possível localizar o cadastro do atleta."
    );
  }

  const dados = {
    usuario_id: usuarioId,

    nome,

    apelido:
      nullSeVazio(
        valor(
          formData,
          "apelido"
        )
      ),

    cpf,

    rg,

    data_nascimento:
      dataNascimento,

    telefone,

    email,

    /*
     * Endereço - nomes reais da tabela atletas
     */
    logradouro,

    numero:
      nullSeVazio(numero),

    bairro,

    cidade,

    uf:
      uf.toUpperCase(),

    cep:
      nullSeVazio(cep),

    /*
     * Informações esportivas
     */
    modalidade,

    posicao,

    numero_camisa:
      numeroOuNull(
        valor(
          formData,
          "numero_camisa"
        )
      ),

    pe_preferencial:
      nullSeVazio(
        valor(
          formData,
          "pe_preferencial"
        ) ||
        valor(
          formData,
          "pe"
        )
      ),

    altura:
      numeroOuNull(
        valor(
          formData,
          "altura"
        )
      ),

    peso:
      numeroOuNull(
        valor(
          formData,
          "peso"
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
        .eq(
          "id",
          atletaAtual.id
        );

    erro = resultado.error;
  } else {
    const resultado =
      await supabase
        .from("atletas")
        .insert({
          ...dados,
          status:
            "pre_cadastro",
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

  const {
    error: usuarioUpdateError,
  } =
    await supabase
      .from("usuarios")
      .update({
        nome,
        email,
      })
      .eq(
        "id",
        usuarioId
      );

  if (usuarioUpdateError) {
    console.error(
      "Aviso ao atualizar usuário:",
      usuarioUpdateError
    );
  }

  revalidatePath(
    "/portal-atleta"
  );

  revalidatePath(
    "/portal-atleta/dados"
  );

  revalidatePath(
    "/portal-atleta/documentos"
  );

  revalidatePath(
    "/admin/esportivo/atletas"
  );

  redirect(
    "/portal-atleta/documentos"
  );
}
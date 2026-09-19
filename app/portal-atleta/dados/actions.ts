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

function primeiroValor(
  formData: FormData,
  nomes: string[]
) {
  for (const nome of nomes) {
    const resultado = valor(
      formData,
      nome
    );

    if (resultado) {
      return resultado;
    }
  }

  return "";
}

function nullSeVazio(
  valorRecebido: string
) {
  return valorRecebido === ""
    ? null
    : valorRecebido;
}

function inteiroOuNull(
  valorRecebido: string
) {
  if (!valorRecebido) {
    return null;
  }

  const numero =
    Number.parseInt(
      valorRecebido,
      10
    );

  return Number.isFinite(numero)
    ? numero
    : null;
}

function decimalOuNull(
  valorRecebido: string
) {
  if (!valorRecebido) {
    return null;
  }

  const numero =
    Number(
      valorRecebido
        .replace(",", ".")
    );

  return Number.isFinite(numero)
    ? numero
    : null;
}

export async function salvarDadosAtleta(
  formData: FormData
): Promise<void> {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: authError,
  } =
    await supabase.auth.getUser();

  if (
    authError ||
    !user
  ) {
    redirect("/portalcannabrava");
  }

  const {
    data: usuarioId,
    error: usuarioError,
  } =
    await supabase.rpc(
      "usuario_id_atual"
    );

  if (
    usuarioError ||
    !usuarioId
  ) {
    console.error(
      "Erro ao localizar usuário:",
      usuarioError
    );

    throw new Error(
      "Não foi possível localizar o seu cadastro de usuário."
    );
  }

  // =========================================================
  // DADOS PESSOAIS
  // =========================================================

  const nome =
    valor(
      formData,
      "nome"
    );

  const apelido =
    valor(
      formData,
      "apelido"
    );

  const cpf =
    valor(
      formData,
      "cpf"
    );

  const rg =
    valor(
      formData,
      "rg"
    );

  const dataNascimento =
    valor(
      formData,
      "data_nascimento"
    );

  const telefone =
    valor(
      formData,
      "telefone"
    );

  const email =
    valor(
      formData,
      "email"
    );

  // =========================================================
  // ENDEREÇO
  //
  // A tela antiga usa "endereco".
  // O banco usa "logradouro".
  // Aceitamos os dois.
  // =========================================================

  const logradouro =
    primeiroValor(
      formData,
      [
        "logradouro",
        "endereco",
      ]
    );

  const numero =
    valor(
      formData,
      "numero"
    );

  const complemento =
    valor(
      formData,
      "complemento"
    );

  const bairro =
    valor(
      formData,
      "bairro"
    );

  const cidade =
    valor(
      formData,
      "cidade"
    );

  const uf =
    valor(
      formData,
      "uf"
    );

  const cep =
    valor(
      formData,
      "cep"
    );

  // =========================================================
  // DADOS ESPORTIVOS
  // =========================================================

  const modalidade =
    valor(
      formData,
      "modalidade"
    );

  const posicao =
    valor(
      formData,
      "posicao"
    );

  const numeroCamisa =
    valor(
      formData,
      "numero_camisa"
    );

  const pePreferencial =
    primeiroValor(
      formData,
      [
        "pe_preferencial",
        "pe",
      ]
    );

  const altura =
    valor(
      formData,
      "altura"
    );

  const peso =
    valor(
      formData,
      "peso"
    );

  const registroEsportivo =
    valor(
      formData,
      "registro_esportivo"
    );

  // =========================================================
  // EMERGÊNCIA
  //
  // O banco possui tanto os campos novos emergencia_*
  // quanto contato_emergencia / telefone_emergencia.
  // =========================================================

  const emergenciaNome =
    primeiroValor(
      formData,
      [
        "emergencia_nome",
        "contato_emergencia",
      ]
    );

  const emergenciaParentesco =
    valor(
      formData,
      "emergencia_parentesco"
    );

  const emergenciaTelefone =
    primeiroValor(
      formData,
      [
        "emergencia_telefone",
        "telefone_emergencia",
      ]
    );

  // =========================================================
  // VALIDAÇÃO
  // =========================================================

  if (!nome) {
    throw new Error(
      "Informe o nome completo."
    );
  }

  if (!cpf) {
    throw new Error(
      "Informe o CPF."
    );
  }

  if (!rg) {
    throw new Error(
      "Informe o RG."
    );
  }

  if (!dataNascimento) {
    throw new Error(
      "Informe a data de nascimento."
    );
  }

  if (!telefone) {
    throw new Error(
      "Informe o telefone."
    );
  }

  if (!email) {
    throw new Error(
      "Informe o e-mail."
    );
  }

  if (!logradouro) {
    throw new Error(
      "Informe o endereço."
    );
  }

  if (!bairro) {
    throw new Error(
      "Informe o bairro."
    );
  }

  if (!cidade) {
    throw new Error(
      "Informe a cidade."
    );
  }

  if (!uf) {
    throw new Error(
      "Informe a UF."
    );
  }

  if (!modalidade) {
    throw new Error(
      "Informe a modalidade."
    );
  }

  if (!posicao) {
    throw new Error(
      "Informe a posição."
    );
  }

  // =========================================================
  // LOCALIZAR CADASTRO ATUAL
  // =========================================================

  const {
    data: atletaAtual,
    error: atletaBuscaError,
  } =
    await supabase
      .from("atletas")
      .select(
        "id,status"
      )
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
      atletaBuscaError.message
    );
  }

  // =========================================================
  // OBJETO COM SOMENTE COLUNAS REAIS DA TABELA
  // =========================================================

  const dados = {
    usuario_id:
      usuarioId,

    nome,

    apelido:
      nullSeVazio(apelido),

    cpf:
      nullSeVazio(cpf),

    rg:
      nullSeVazio(rg),

    data_nascimento:
      nullSeVazio(
        dataNascimento
      ),

    telefone:
      nullSeVazio(
        telefone
      ),

    email:
      nullSeVazio(email),

    cep:
      nullSeVazio(cep),

    cidade:
      nullSeVazio(
        cidade
      ),

    uf:
      nullSeVazio(
        uf.toUpperCase()
      ),

    bairro:
      nullSeVazio(
        bairro
      ),

    logradouro:
      nullSeVazio(
        logradouro
      ),

    numero:
      nullSeVazio(
        numero
      ),

    complemento:
      nullSeVazio(
        complemento
      ),

    modalidade:
      nullSeVazio(
        modalidade
      ),

    posicao:
      nullSeVazio(
        posicao
      ),

    numero_camisa:
      inteiroOuNull(
        numeroCamisa
      ),

    pe_preferencial:
      nullSeVazio(
        pePreferencial
      ),

    altura:
      decimalOuNull(
        altura
      ),

    peso:
      decimalOuNull(
        peso
      ),

    registro_esportivo:
      nullSeVazio(
        registroEsportivo
      ),

    emergencia_nome:
      nullSeVazio(
        emergenciaNome
      ),

    emergencia_parentesco:
      nullSeVazio(
        emergenciaParentesco
      ),

    emergencia_telefone:
      nullSeVazio(
        emergenciaTelefone
      ),

    contato_emergencia:
      nullSeVazio(
        emergenciaNome
      ),

    telefone_emergencia:
      nullSeVazio(
        emergenciaTelefone
      ),

    atualizado_em:
      new Date()
        .toISOString(),
  };

  // =========================================================
  // UPDATE / INSERT
  // =========================================================

  if (atletaAtual?.id) {
    const {
      error: updateError,
    } =
      await supabase
        .from("atletas")
        .update(dados)
        .eq(
          "id",
          atletaAtual.id
        )
        .eq(
          "usuario_id",
          usuarioId
        );

    if (updateError) {
      console.error(
        "ERRO UPDATE ATLETA:",
        {
          message:
            updateError.message,
          details:
            updateError.details,
          hint:
            updateError.hint,
          code:
            updateError.code,
        }
      );

      throw new Error(
        updateError.message ||
          "Não foi possível atualizar os dados do atleta."
      );
    }
  } else {
    const {
      error: insertError,
    } =
      await supabase
        .from("atletas")
        .insert({
          ...dados,
          status:
            "pre_cadastro",
        });

    if (insertError) {
      console.error(
        "ERRO INSERT ATLETA:",
        {
          message:
            insertError.message,
          details:
            insertError.details,
          hint:
            insertError.hint,
          code:
            insertError.code,
        }
      );

      throw new Error(
        insertError.message ||
          "Não foi possível criar o cadastro do atleta."
      );
    }
  }

  // =========================================================
  // SINCRONIZAR NOME / EMAIL DO USUÁRIO
  // =========================================================

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
      "Aviso ao sincronizar usuário:",
      usuarioUpdateError
    );
  }

  // =========================================================
  // REVALIDAÇÃO
  // =========================================================

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

  if (atletaAtual?.id) {
    revalidatePath(
      `/admin/esportivo/atletas/${atletaAtual.id}`
    );
  }

  redirect(
    "/portal-atleta/documentos"
  );
}
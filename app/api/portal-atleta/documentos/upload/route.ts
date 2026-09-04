import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TIPOS_PERMITIDOS = [
  "foto_3x4",
  "identidade",
  "residencia",
  "eleitoral",
];

const MIME_DOCUMENTOS = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

function limparNomeArquivo(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Sessão expirada. Entre novamente.",
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const atletaId = formData.get("atletaId");
    const tipo = formData.get("tipo");
    const arquivo = formData.get("arquivo");

    if (
      typeof atletaId !== "string" ||
      !atletaId
    ) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Atleta não identificado.",
        },
        { status: 400 }
      );
    }

    if (
      typeof tipo !== "string" ||
      !TIPOS_PERMITIDOS.includes(tipo)
    ) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Tipo de documento inválido.",
        },
        { status: 400 }
      );
    }

    if (!(arquivo instanceof File)) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Nenhum arquivo recebido.",
        },
        { status: 400 }
      );
    }

    if (tipo === "foto_3x4") {
      if (
        !["image/jpeg", "image/png"].includes(
          arquivo.type
        )
      ) {
        return NextResponse.json(
          {
            sucesso: false,
            mensagem:
              "A foto 3x4 deve estar em JPG ou PNG.",
          },
          { status: 400 }
        );
      }

      if (arquivo.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            sucesso: false,
            mensagem:
              "A foto 3x4 deve ter no máximo 5 MB.",
          },
          { status: 400 }
        );
      }
    } else {
      if (
        !MIME_DOCUMENTOS.includes(
          arquivo.type
        )
      ) {
        return NextResponse.json(
          {
            sucesso: false,
            mensagem:
              "Formato não permitido. Utilize PDF, JPG ou PNG.",
          },
          { status: 400 }
        );
      }

      if (arquivo.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          {
            sucesso: false,
            mensagem:
              "O documento deve ter no máximo 10 MB.",
          },
          { status: 400 }
        );
      }
    }

    const {
      data: usuarioId,
      error: usuarioError,
    } = await supabase.rpc(
      "usuario_id_atual"
    );

    if (usuarioError || !usuarioId) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "Usuário interno não localizado.",
        },
        { status: 403 }
      );
    }

    const {
      data: atleta,
      error: atletaError,
    } = await supabase
      .from("atletas")
      .select("id")
      .eq("id", atletaId)
      .eq("usuario_id", usuarioId)
      .maybeSingle();

    if (atletaError || !atleta) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "Você não possui permissão para enviar documentos deste atleta.",
        },
        { status: 403 }
      );
    }

    const nomeSeguro =
      limparNomeArquivo(arquivo.name);

    const caminho =
      `${atletaId}/${tipo}/${Date.now()}-${nomeSeguro}`;

    const {
      error: uploadError,
    } = await supabase.storage
      .from("atleta-documentos")
      .upload(
        caminho,
        arquivo,
        {
          cacheControl: "3600",
          upsert: false,
          contentType:
            arquivo.type ||
            "application/octet-stream",
        }
      );

    if (uploadError) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            `Erro no envio: ${uploadError.message}`,
        },
        { status: 400 }
      );
    }

    const {
      data: documentoExistente,
      error: consultaError,
    } = await supabase
      .from("atleta_documentos")
      .select(`
        id,
        caminho_arquivo
      `)
      .eq("atleta_id", atletaId)
      .eq("tipo", tipo)
      .maybeSingle();

    if (consultaError) {
      await supabase.storage
        .from("atleta-documentos")
        .remove([caminho]);

      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            `Erro ao consultar documento: ${consultaError.message}`,
        },
        { status: 400 }
      );
    }

    let bancoError = null;

    if (documentoExistente) {
      const resultado =
        await supabase
          .from("atleta_documentos")
          .update({
            caminho_arquivo: caminho,
            nome_arquivo: arquivo.name,
            status: "enviado",
            observacao: null,
            atualizado_em:
              new Date().toISOString(),
          })
          .eq("id", documentoExistente.id);

      bancoError = resultado.error;
    } else {
      const resultado =
        await supabase
          .from("atleta_documentos")
          .insert({
            atleta_id: atletaId,
            tipo,
            nome_arquivo: arquivo.name,
            caminho_arquivo: caminho,
            status: "enviado",
          });

      bancoError = resultado.error;
    }

    if (bancoError) {
      await supabase.storage
        .from("atleta-documentos")
        .remove([caminho]);

      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            `Erro ao registrar documento: ${bancoError.message}`,
        },
        { status: 400 }
      );
    }

    if (
      documentoExistente?.caminho_arquivo &&
      documentoExistente.caminho_arquivo !==
        caminho
    ) {
      await supabase.storage
        .from("atleta-documentos")
        .remove([
          documentoExistente.caminho_arquivo,
        ]);
    }

    const { data: documentos } =
      await supabase
        .from("atleta_documentos")
        .select("tipo,status")
        .eq("atleta_id", atletaId)
        .in(
          "tipo",
          TIPOS_PERMITIDOS
        );

    const todosEnviados =
      TIPOS_PERMITIDOS.every(
        (tipoObrigatorio) =>
          documentos?.some(
            (documento) =>
              documento.tipo ===
                tipoObrigatorio &&
              documento.status &&
              documento.status !==
                "pendente"
          )
      );

    if (todosEnviados) {
      await supabase
        .from("atletas")
        .update({
          status:
            "documentos_enviados",
          atualizado_em:
            new Date().toISOString(),
        })
        .eq("id", atletaId);
    }

    return NextResponse.json({
      sucesso: true,
      mensagem:
        tipo === "foto_3x4"
          ? "Foto 3x4 enviada com sucesso."
          : "Documento enviado com sucesso.",
    });
  } catch (error) {
    console.error(
      "Erro inesperado no upload:",
      error
    );

    return NextResponse.json(
      {
        sucesso: false,
        mensagem:
          error instanceof Error
            ? error.message
            : "Erro interno ao processar documento.",
      },
      { status: 500 }
    );
  }
}
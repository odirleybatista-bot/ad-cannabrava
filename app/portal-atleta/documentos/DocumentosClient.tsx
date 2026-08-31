"use client";

import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type StatusDocumento =
  | "pendente"
  | "enviado"
  | "em_analise"
  | "aprovado"
  | "correcao_solicitada"
  | "rejeitado";

type DocumentoConfiguracao = {
  tipo: string;
  titulo: string;
  descricao: string;
  tse?: boolean;
};

type DocumentoBanco = {
  id: string;
  atleta_id: string;
  tipo: string;
  nome_arquivo: string;
  caminho_arquivo: string;
  mime_type: string | null;
  tamanho: number | null;
  status: StatusDocumento;
  observacao: string | null;
  enviado_em: string;
};

const documentosObrigatorios: DocumentoConfiguracao[] = [
  {
    tipo: "identidade",
    titulo: "Documento de Identidade",
    descricao:
      "Envie RG, CNH ou outro documento oficial com foto.",
  },
  {
    tipo: "residencia",
    titulo: "Comprovante de Residência",
    descricao:
      "Envie um comprovante de residência recente.",
  },
  {
    tipo: "eleitoral",
    titulo: "Certidão de Quitação Eleitoral",
    descricao:
      "Documento que comprova a regularidade perante a Justiça Eleitoral.",
    tse: true,
  },
];

export default function DocumentosClient({ atletaId }: { atletaId: string }) {
  

  const [documentos, setDocumentos] =
    useState<DocumentoBanco[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [enviando, setEnviando] =
    useState<string | null>(null);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const supabase = useMemo(
    () => createClient(),
    []
  );

  async function carregarDocumentos() {
    if (!atletaId) {
      setErro(
        "Não foi possível identificar o cadastro do atleta."
      );

      setCarregando(false);
      return;
    }

    const { data, error } = await supabase
      .from("atleta_documentos")
      .select(`
        id,
        atleta_id,
        tipo,
        nome_arquivo,
        caminho_arquivo,
        mime_type,
        tamanho,
        status,
        observacao,
        enviado_em
      `)
      .eq("atleta_id", atletaId)
      .order("enviado_em", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Erro ao carregar documentos:",
        error
      );

      setErro(
        "Não foi possível carregar os documentos."
      );
    } else {
      setDocumentos(
        (data || []) as DocumentoBanco[]
      );
    }

    setCarregando(false);
  }

  useEffect(() => {
    carregarDocumentos();
  }, [atletaId]);

  function documentoDoTipo(
    tipo: string
  ) {
    return documentos.find(
      (documento) =>
        documento.tipo === tipo
    );
  }

  async function enviarArquivo(
    tipo: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const arquivo =
      event.target.files?.[0];

    if (!arquivo || !atletaId) {
      return;
    }

    setErro("");
    setMensagem("");

    const permitidos = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (
      !permitidos.includes(
        arquivo.type
      )
    ) {
      setErro(
        "Formato não permitido. Utilize PDF, JPG ou PNG."
      );

      event.target.value = "";
      return;
    }

    if (
      arquivo.size >
      10 * 1024 * 1024
    ) {
      setErro(
        "O arquivo deve possuir no máximo 10 MB."
      );

      event.target.value = "";
      return;
    }

    setEnviando(tipo);

    try {
      const anterior =
        documentoDoTipo(tipo);

      if (
        anterior?.caminho_arquivo
      ) {
        await supabase.storage
          .from(
            "atleta-documentos"
          )
          .remove([
            anterior.caminho_arquivo,
          ]);
      }

      const extensao =
        arquivo.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "arquivo";

      const caminho =
        `${atletaId}/${tipo}/${tipo}-${Date.now()}.${extensao}`;

      const { error: uploadError } =
        await supabase.storage
          .from(
            "atleta-documentos"
          )
          .upload(
            caminho,
            arquivo,
            {
              upsert: false,
              contentType:
                arquivo.type,
            }
          );

      if (uploadError) {
        setErro(
          `Não foi possível enviar o arquivo: ${uploadError.message}`
        );

        return;
      }

      const registro = {
        atleta_id: atletaId,
        tipo,
        nome_arquivo:
          arquivo.name,
        caminho_arquivo:
          caminho,
        mime_type:
          arquivo.type,
        tamanho:
          arquivo.size,
        status:
          "enviado",
        observacao:
          null,
        enviado_em:
          new Date().toISOString(),
        analisado_em:
          null,
        atualizado_em:
          new Date().toISOString(),
      };

      const {
        data: documentoSalvo,
        error: bancoError,
      } = await supabase
        .from(
          "atleta_documentos"
        )
        .upsert(
          registro,
          {
            onConflict:
              "atleta_id,tipo",
          }
        )
        .select(`
          id,
          atleta_id,
          tipo,
          nome_arquivo,
          caminho_arquivo,
          mime_type,
          tamanho,
          status,
          observacao,
          enviado_em
        `)
        .single();

      if (bancoError) {
        await supabase.storage
          .from(
            "atleta-documentos"
          )
          .remove([caminho]);

        setErro(
          `Não foi possível registrar o documento: ${bancoError.message}`
        );

        return;
      }

      setDocumentos(
        (atuais) => [
          ...atuais.filter(
            (documento) =>
              documento.tipo !== tipo
          ),
          documentoSalvo as DocumentoBanco,
        ]
      );

      setMensagem(
        anterior?.status ===
          "correcao_solicitada"
          ? "Documento corrigido e reenviado para nova análise."
          : "Documento enviado com sucesso."
      );

      const {
        data: todosDocumentos,
      } = await supabase
        .from(
          "atleta_documentos"
        )
        .select("tipo")
        .eq(
          "atleta_id",
          atletaId
        );

      const tiposEnviados =
        new Set(
          (
            todosDocumentos ||
            []
          ).map(
            (documento) =>
              documento.tipo
          )
        );

      const todosObrigatorios =
        documentosObrigatorios.every(
          (documento) =>
            tiposEnviados.has(
              documento.tipo
            )
        );

      await supabase
        .from("atletas")
        .update({
          status:
            todosObrigatorios
              ? "documentos_enviados"
              : "pre_cadastro",
          atualizado_em:
            new Date().toISOString(),
        })
        .eq(
          "id",
          atletaId
        );

    } catch (error) {
      console.error(
        "Erro inesperado:",
        error
      );

      setErro(
        "Ocorreu um erro inesperado durante o envio."
      );

    } finally {
      setEnviando(null);

      event.target.value =
        "";
    }
  }

  async function visualizar(
    documento: DocumentoBanco
  ) {
    const { data, error } =
      await supabase.storage
        .from(
          "atleta-documentos"
        )
        .createSignedUrl(
          documento.caminho_arquivo,
          60
        );

    if (
      error ||
      !data?.signedUrl
    ) {
      setErro(
        "Não foi possível abrir o documento."
      );

      return;
    }

    window.open(
      data.signedUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  const quantidadeEnviada =
    documentosObrigatorios.filter(
      (configuracao) =>
        Boolean(
          documentoDoTipo(
            configuracao.tipo
          )
        )
    ).length;

  const todosEnviados =
    quantidadeEnviada ===
    documentosObrigatorios.length;

  const possuiCorrecao =
    documentos.some(
      (documento) =>
        documento.status ===
        "correcao_solicitada"
    );

  if (carregando) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        Carregando documentos...
      </div>
    );
  }

  return (
    <div>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">

        <div>
          <h1 className="text-3xl font-black text-[#08265a]">
            Documentos
          </h1>

          <p className="mt-1 text-slate-500">
            Acompanhe o envio e a análise dos seus documentos.
          </p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-3">

          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Documentos enviados
          </p>

          <p className="mt-1 text-xl font-black text-[#08265a]">
            {quantidadeEnviada} de {documentosObrigatorios.length}
          </p>

        </div>

      </div>

      {possuiCorrecao && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">

          <h2 className="font-bold text-amber-900">
            Há documento aguardando correção
          </h2>

          <p className="mt-1 text-sm text-amber-800">
            Consulte a observação indicada no documento e envie um novo arquivo.
          </p>

        </div>
      )}

      {erro && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
          {mensagem}
        </div>
      )}

      <div className="space-y-5">

        {documentosObrigatorios.map(
          (configuracao) => {

            const documento =
              documentoDoTipo(
                configuracao.tipo
              );

            return (
              <article
                key={
                  configuracao.tipo
                }
                className={`rounded-2xl border bg-white p-6 ${
                  documento?.status ===
                  "correcao_solicitada"
                    ? "border-amber-300"
                    : "border-slate-200"
                }`}
              >

                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                  <div className="min-w-0 flex-1">

                    <h2 className="text-lg font-bold text-[#08265a]">
                      {configuracao.titulo}
                    </h2>

                    <Status
                      status={
                        documento?.status ||
                        "pendente"
                      }
                    />

                    <p className="mt-4 text-sm leading-6 text-slate-500">
                      {configuracao.descricao}
                    </p>

                    {documento?.observacao && (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">

                        <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                          Observação da análise
                        </p>

                        <p className="mt-2 text-sm font-medium leading-6 text-amber-900">
                          {documento.observacao}
                        </p>

                      </div>
                    )}

                    {documento && (
                      <div className="mt-4 rounded-xl bg-slate-50 p-4">

                        <p className="text-sm font-semibold text-slate-700">
                          {documento.nome_arquivo}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Enviado em{" "}
                          {formatarData(
                            documento.enviado_em
                          )}
                        </p>

                      </div>
                    )}

                    {configuracao.tse && (
                      <a
                        href="https://www.tse.jus.br/servicos-eleitorais/autoatendimento-eleitoral#/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex rounded-lg bg-[#08265a] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0b3478]"
                      >
                        Emitir certidão no TSE ↗
                      </a>
                    )}

                  </div>

                  <div className="w-full shrink-0 xl:w-[250px]">

                    {documento && (
                      <button
                        type="button"
                        onClick={() =>
                          visualizar(
                            documento
                          )
                        }
                        className="mb-3 h-11 w-full rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Visualizar documento
                      </button>
                    )}

                    {documento?.status !==
                      "aprovado" && (
                      <>
                        <label
                          htmlFor={`arquivo-${configuracao.tipo}`}
                          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border-2 border-[#08265a] px-5 text-sm font-bold text-[#08265a] hover:bg-blue-50"
                        >
                          {enviando ===
                          configuracao.tipo
                            ? "Enviando..."
                            : documento
                            ? "Substituir arquivo"
                            : "Selecionar arquivo"}
                        </label>

                        <input
                          id={`arquivo-${configuracao.tipo}`}
                          type="file"
                          disabled={
                            !atletaId ||
                            enviando !==
                              null
                          }
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(
                            event
                          ) =>
                            enviarArquivo(
                              configuracao.tipo,
                              event
                            )
                          }
                          className="hidden"
                        />
                      </>
                    )}

                    {documento?.status ===
                      "aprovado" && (
                      <div className="flex h-12 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
                        Documento aprovado
                      </div>
                    )}

                  </div>

                </div>

              </article>
            );
          }
        )}

      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="font-bold text-[#08265a]">
              Situação da documentação
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Após aprovação dos documentos, o processo seguirá para vínculo e Termo de Compromisso.
            </p>
          </div>

          <div className={`rounded-xl px-5 py-3 text-sm font-bold ${
            possuiCorrecao
              ? "bg-amber-100 text-amber-700"
              : todosEnviados
              ? "bg-blue-100 text-blue-700"
              : "bg-slate-100 text-slate-600"
          }`}>
            {possuiCorrecao
              ? "Correção solicitada"
              : todosEnviados
              ? "Em processamento"
              : "Aguardando documentos"}
          </div>

        </div>

      </div>

    </div>
  );
}

function Status({
  status,
}: {
  status: StatusDocumento;
}) {
  const mapa: Record<
    StatusDocumento,
    {
      texto: string;
      classe: string;
    }
  > = {
    pendente: {
      texto: "Pendente",
      classe:
        "bg-slate-100 text-slate-600",
    },

    enviado: {
      texto: "Enviado",
      classe:
        "bg-blue-100 text-blue-700",
    },

    em_analise: {
      texto: "Em análise",
      classe:
        "bg-amber-100 text-amber-700",
    },

    aprovado: {
      texto: "Aprovado",
      classe:
        "bg-emerald-100 text-emerald-700",
    },

    correcao_solicitada: {
      texto:
        "Correção solicitada",
      classe:
        "bg-amber-100 text-amber-800",
    },

    rejeitado: {
      texto: "Rejeitado",
      classe:
        "bg-red-100 text-red-700",
    },
  };

  const atual =
    mapa[status];

  return (
    <span
      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${atual.classe}`}
    >
      {atual.texto}
    </span>
  );
}

function formatarData(
  data: string
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(
    new Date(data)
  );
}
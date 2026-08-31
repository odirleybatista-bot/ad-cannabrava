import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DocumentoActions from "./DocumentoActions";
import VinculoForm from "./VinculoForm";
import TermoActions from "./TermoActions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type Documento = {
  id: string;
  tipo: string;
  nome_arquivo: string;
  caminho_arquivo: string;
  status: string;
  observacao: string | null;
  enviado_em: string;
  analisado_em: string | null;
};

export default async function AtletaDetalhePage({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: atleta, error } =
    await supabase
      .from("atletas")
      .select("*")
      .eq("id", id)
      .single();

  if (error || !atleta) {
    notFound();
  }

  const { data: documentos } =
    await supabase
      .from("atleta_documentos")
      .select(`
        id,
        tipo,
        nome_arquivo,
        caminho_arquivo,
        status,
        observacao,
        enviado_em,
        analisado_em
      `)
      .eq("atleta_id", id)
      .order("enviado_em", {
        ascending: true,
      });

  const listaDocumentos =
    (documentos || []) as Documento[];
  const { data: termo } =
    await supabase
      .from("termos_compromisso")
      .select(`
        id,
        status,
        versao,
        gerado_em,
        liberado_em,
        assinado_em,
        conteudo
      `)
      .eq("atleta_id", id)
      .order("criado_em", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

  return (
    <div>

      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">

        <div>
          <Link
            href="/admin/esportivo/atletas"
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            ← Voltar para atletas
          </Link>

          <h1 className="mt-3 text-3xl font-black text-[#08265a]">
            {atleta.nome}
          </h1>

          <p className="mt-1 text-slate-500">
            Cadastro do atleta
          </p>
        </div>

        <Status
          status={atleta.status}
        />

      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <Resumo
          titulo="Modalidade"
          valor={
            atleta.modalidade ||
            "Não informada"
          }
        />

        <Resumo
          titulo="Posição"
          valor={
            atleta.posicao ||
            "Não informada"
          }
        />

        <Resumo
          titulo="Idade"
          valor={calcularIdade(
            atleta.data_nascimento
          )}
        />

        <Resumo
          titulo="Situação"
          valor={nomeStatus(
            atleta.status
          )}
        />

      </div>

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">

        <div className="mb-6">

          <h2 className="text-lg font-bold text-[#08265a]">
            Identificação
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Dados pessoais informados pelo atleta.
          </p>

        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <Info
            label="Nome completo"
            valor={atleta.nome}
          />

          <Info
            label="Apelido"
            valor={atleta.apelido}
          />

          <Info
            label="CPF"
            valor={atleta.cpf}
          />

          <Info
            label="RG"
            valor={atleta.rg}
          />

          <Info
            label="Data de nascimento"
            valor={formatarDataNascimento(
              atleta.data_nascimento
            )}
          />

          <Info
            label="Telefone"
            valor={atleta.telefone}
          />

          <Info
            label="E-mail"
            valor={atleta.email}
          />

          <Info
            label="Data do cadastro"
            valor={formatarDataHora(
              atleta.criado_em
            )}
          />

        </div>

      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">

        <div className="mb-6">

          <h2 className="text-lg font-bold text-[#08265a]">
            Informações esportivas
          </h2>

        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <Info
            label="Modalidade"
            valor={atleta.modalidade}
          />

          <Info
            label="Posição"
            valor={atleta.posicao}
          />

          <Info
            label="Número preferencial"
            valor={
              atleta.numero_camisa !== null
                ? String(
                    atleta.numero_camisa
                  )
                : null
            }
          />

          <Info
            label="Pé preferencial"
            valor={atleta.pe_preferencial}
          />

          <Info
            label="Altura"
            valor={
              atleta.altura !== null
                ? `${atleta.altura} cm`
                : null
            }
          />

          <Info
            label="Peso"
            valor={
              atleta.peso !== null
                ? `${atleta.peso} kg`
                : null
            }
          />

        </div>

      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">

        <div className="mb-6">

          <h2 className="text-lg font-bold text-[#08265a]">
            Documentos
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Analise os documentos enviados pelo atleta.
          </p>

        </div>

        {listaDocumentos.length === 0 ? (

          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">

            <p className="font-semibold text-slate-600">
              Nenhum documento enviado
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Os arquivos enviados pelo Portal do Atleta aparecerão aqui.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {listaDocumentos.map(
              (documento) => (

                <div
                  key={documento.id}
                  className="rounded-xl border border-slate-200 p-5"
                >

                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                    <div className="min-w-0">

                      <p className="font-bold text-slate-800">
                        {nomeDocumento(
                          documento.tipo
                        )}
                      </p>

                      <p className="mt-1 break-all text-sm text-slate-500">
                        {documento.nome_arquivo}
                      </p>

                      <StatusDocumento
                        status={
                          documento.status
                        }
                      />

                      <p className="mt-3 text-xs text-slate-400">
                        Enviado em{" "}
                        {formatarDataHora(
                          documento.enviado_em
                        )}
                      </p>

                      {documento.observacao && (
                        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">

                          <p className="text-xs font-bold uppercase text-amber-700">
                            Observação
                          </p>

                          <p className="mt-1 text-sm text-amber-800">
                            {documento.observacao}
                          </p>

                        </div>
                      )}

                    </div>

                    <DocumentoActions
                      atletaId={id}
                      documentoId={
                        documento.id
                      }
                      caminhoArquivo={
                        documento.caminho_arquivo
                      }
                      status={
                        documento.status
                      }
                    />

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">

        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#08265a]">
            Vínculo esportivo
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Defina a modalidade, temporada e período de participação do atleta.
          </p>
        </div>

        <VinculoForm
          atletaId={id}
          statusAtleta={atleta.status}
          modalidadeAtual={atleta.modalidade}
        />

      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">

        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#08265a]">
            Termo de Compromisso
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Gere o termo após a definição do vínculo e libere-o para assinatura do atleta.
          </p>
        </div>

        {termo && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5">

            <div className="flex flex-wrap items-center justify-between gap-4">

              <div>
                <p className="font-bold text-slate-800">
                  Termo versão {termo.versao}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Situação: {nomeStatusTermo(termo.status)}
                </p>
              </div>

              <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600">
                {nomeStatusTermo(termo.status)}
              </span>

            </div>

          </div>
        )}

        <TermoActions
          atletaId={id}
          statusAtleta={atleta.status}
          termoId={termo?.id || null}
          termoStatus={termo?.status || null}
        />

      </section>

      <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6">

        <h2 className="text-lg font-bold text-[#08265a]">
          Próxima etapa
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Quando todos os documentos obrigatórios forem aprovados, o cadastro será marcado como aprovado e poderá seguir para definição do vínculo e liberação do Termo de Compromisso.
        </p>

      </section>

    </div>
  );
}

function Resumo({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {titulo}
      </p>

      <p className="mt-2 text-xl font-black text-[#08265a]">
        {valor}
      </p>

    </div>
  );
}

function Info({
  label,
  valor,
}: {
  label: string;
  valor?: string | null;
}) {
  return (
    <div>

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words font-semibold text-slate-800">
        {valor || "Não informado"}
      </p>

    </div>
  );
}

function Status({
  status,
}: {
  status: string;
}) {
  const mapa: Record<
    string,
    {
      texto: string;
      classe: string;
    }
  > = {
    pre_cadastro: {
      texto: "Pré-cadastro",
      classe:
        "bg-slate-100 text-slate-700",
    },

    documentos_enviados: {
      texto: "Documentos enviados",
      classe:
        "bg-blue-100 text-blue-700",
    },

    em_analise: {
      texto: "Em análise",
      classe:
        "bg-amber-100 text-amber-700",
    },

    correcao_solicitada: {
      texto: "Correção solicitada",
      classe:
        "bg-red-100 text-red-700",
    },

    aprovado: {
      texto: "Aprovado",
      classe:
        "bg-emerald-100 text-emerald-700",
    },

    ativo: {
      texto: "Ativo",
      classe:
        "bg-emerald-100 text-emerald-700",
    },

    inativo: {
      texto: "Inativo",
      classe:
        "bg-red-100 text-red-700",
    },
  };

  const atual =
    mapa[status] || {
      texto: status,
      classe:
        "bg-slate-100 text-slate-600",
    };

  return (
    <span
      className={`rounded-full px-4 py-2 text-sm font-bold ${atual.classe}`}
    >
      {atual.texto}
    </span>
  );
}

function StatusDocumento({
  status,
}: {
  status: string;
}) {
  const mapa: Record<
    string,
    {
      texto: string;
      classe: string;
    }
  > = {
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
      texto: "Correção solicitada",
      classe:
        "bg-red-100 text-red-700",
    },

    rejeitado: {
      texto: "Rejeitado",
      classe:
        "bg-red-100 text-red-700",
    },
  };

  const atual =
    mapa[status] || {
      texto: status,
      classe:
        "bg-slate-100 text-slate-600",
    };

  return (
    <span
      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${atual.classe}`}
    >
      {atual.texto}
    </span>
  );
}

function nomeDocumento(tipo: string) {
  const nomes: Record<string, string> = {
    identidade:
      "Documento de Identidade",
    residencia:
      "Comprovante de Residência",
    eleitoral:
      "Certidão de Quitação Eleitoral",
  };

  return nomes[tipo] || tipo;
}

function nomeStatus(status: string) {
  const nomes: Record<string, string> = {
    pre_cadastro: "Pré-cadastro",
    documentos_enviados:
      "Documentos enviados",
    em_analise: "Em análise",
    correcao_solicitada:
      "Correção solicitada",
    aprovado: "Aprovado",
    ativo: "Ativo",
    inativo: "Inativo",
  };

  return nomes[status] || status;
}

function calcularIdade(
  dataNascimento: string | null
) {
  if (!dataNascimento) {
    return "-";
  }

  const nascimento =
    new Date(
      `${dataNascimento}T00:00:00`
    );

  const hoje = new Date();

  let idade =
    hoje.getFullYear() -
    nascimento.getFullYear();

  const mes =
    hoje.getMonth() -
    nascimento.getMonth();

  if (
    mes < 0 ||
    (mes === 0 &&
      hoje.getDate() <
        nascimento.getDate())
  ) {
    idade--;
  }

  return `${idade} anos`;
}

function formatarDataNascimento(
  data: string | null
) {
  if (!data) {
    return "Não informado";
  }

  const [ano, mes, dia] =
    data.split("-");

  return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(
  data: string
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(new Date(data));
}
function nomeStatusTermo(status: string) {
  const nomes: Record<string, string> = {
    rascunho: "Rascunho",
    gerado: "Gerado",
    aguardando_assinatura:
      "Aguardando assinatura",
    assinado: "Assinado",
    cancelado: "Cancelado",
  };

  return nomes[status] || status;
}
import Link from "next/link";
import { requireCurrentAthlete } from "@/lib/auth/current-athlete";
import { createClient } from "@/lib/supabase/server";

export default async function PortalAtletaPage() {
  const { atletaId } =
    await requireCurrentAthlete();

  const supabase = await createClient();

  const { data: atleta } =
    await supabase
      .from("atletas")
      .select(`
        id,
        nome,
        apelido,
        modalidade,
        posicao,
        status,
        criado_em
      `)
      .eq("id", atletaId)
      .single();

  if (!atleta) {
    return null;
  }

  const { data: documentos } =
    await supabase
      .from("atleta_documentos")
      .select("id,tipo,status")
      .eq("atleta_id", atletaId);

  const { data: vinculo } =
    await supabase
      .from("atleta_vinculos")
      .select(`
        id,
        modalidade,
        temporada,
        status,
        data_inicio,
        data_fim
      `)
      .eq("atleta_id", atletaId)
      .eq("status", "ativo")
      .order("criado_em", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

  const { data: termo } =
    await supabase
      .from("termos_compromisso")
      .select(`
        id,
        status,
        assinado_em
      `)
      .eq("atleta_id", atletaId)
      .order("criado_em", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

  const {
    count: notificacoesNaoLidas,
  } = await supabase
    .from("notificacoes")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("lida", false);

  const obrigatorios = [
    "identidade",
    "residencia",
    "eleitoral",
  ];

  const documentosEnviados =
    obrigatorios.filter((tipo) =>
      documentos?.some(
        (documento) =>
          documento.tipo === tipo
      )
    ).length;

  const documentosAprovados =
    obrigatorios.filter((tipo) =>
      documentos?.some(
        (documento) =>
          documento.tipo === tipo &&
          documento.status === "aprovado"
      )
    ).length;

  return (
    <div>

      <div className="mb-8">

        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Portal do Atleta
        </p>

        <h1 className="mt-1 text-3xl font-black text-[#08265a]">
          Olá, {atleta.apelido || primeiroNome(atleta.nome)}
        </h1>

        <p className="mt-1 text-slate-500">
          Acompanhe seu cadastro e vínculo com a Associação Desportiva Cannabrava.
        </p>

      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <Card
          titulo="Situação cadastral"
          valor={nomeStatus(atleta.status)}
          descricao="Status atual do seu cadastro"
        />

        <Card
          titulo="Documentos"
          valor={`${documentosEnviados}/3`}
          descricao={`${documentosAprovados} aprovado(s)`}
        />

        <Card
          titulo="Vínculo"
          valor={
            vinculo
              ? vinculo.temporada
              : "Pendente"
          }
          descricao={
            vinculo
              ? `${vinculo.modalidade} • ${nomeStatusVinculo(vinculo.status)}`
              : "Aguardando definição"
          }
        />

        <Card
          titulo="Termo"
          valor={
            termo
              ? nomeStatusTermo(termo.status)
              : "Não disponível"
          }
          descricao={
            termo?.assinado_em
              ? `Assinado em ${formatarData(termo.assinado_em)}`
              : "Termo de Compromisso"
          }
        />

      </div>

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <h2 className="text-lg font-bold text-[#08265a]">
              Andamento do cadastro
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Veja em qual etapa seu processo se encontra.
            </p>
          </div>

          <Status status={atleta.status} />

        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-5">

          <Etapa
            numero="1"
            titulo="Cadastro"
            concluido
          />

          <Etapa
            numero="2"
            titulo="Documentos"
            concluido={
              documentosEnviados === 3
            }
          />

          <Etapa
            numero="3"
            titulo="Aprovação"
            concluido={[
              "aprovado",
              "vinculado",
              "termo_liberado",
              "ativo",
            ].includes(atleta.status)}
          />

          <Etapa
            numero="4"
            titulo="Vínculo"
            concluido={Boolean(vinculo)}
          />

          <Etapa
            numero="5"
            titulo="Termo"
            concluido={
              termo?.status ===
              "assinado"
            }
          />

        </div>

      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

        <Atalho
          href="/portal-atleta/dados"
          titulo="Meus Dados"
          descricao="Consulte e mantenha seus dados atualizados."
        />

        <Atalho
          href="/portal-atleta/documentos"
          titulo="Documentos"
          descricao="Acompanhe o envio e análise documental."
        />

        <Atalho
          href="/portal-atleta/termo"
          titulo="Termo de Compromisso"
          descricao="Consulte ou assine seu termo."
        />

        <Atalho
          href="/portal-atleta/historico"
          titulo="Histórico"
          descricao="Acompanhe as etapas já concluídas."
        />

        <Atalho
          href="/portal-atleta/notificacoes"
          titulo="Notificações"
          descricao={
            notificacoesNaoLidas
              ? `${notificacoesNaoLidas} notificação(ões) não lida(s).`
              : "Nenhuma nova notificação."
          }
        />

      </section>

    </div>
  );
}

function Card({
  titulo,
  valor,
  descricao,
}: {
  titulo: string;
  valor: string;
  descricao: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">

      <p className="text-sm font-medium text-slate-500">
        {titulo}
      </p>

      <p className="mt-2 text-2xl font-black text-[#08265a]">
        {valor}
      </p>

      <p className="mt-2 text-xs text-slate-400">
        {descricao}
      </p>

    </div>
  );
}

function Etapa({
  numero,
  titulo,
  concluido,
}: {
  numero: string;
  titulo: string;
  concluido: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        concluido
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
          concluido
            ? "bg-emerald-600 text-white"
            : "bg-slate-200 text-slate-500"
        }`}
      >
        {concluido ? "✓" : numero}
      </div>

      <p className="mt-3 text-sm font-bold text-slate-700">
        {titulo}
      </p>

    </div>
  );
}

function Atalho({
  href,
  titulo,
  descricao,
}: {
  href: string;
  titulo: string;
  descricao: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:shadow-sm"
    >
      <h3 className="font-bold text-[#08265a]">
        {titulo}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {descricao}
      </p>

      <p className="mt-4 text-sm font-bold text-blue-700">
        Acessar →
      </p>
    </Link>
  );
}

function Status({
  status,
}: {
  status: string;
}) {
  return (
    <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
      {nomeStatus(status)}
    </span>
  );
}

function nomeStatus(status: string) {
  const mapa: Record<string, string> = {
    pre_cadastro: "Pré-cadastro",
    documentos_enviados:
      "Documentos enviados",
    em_analise: "Em análise",
    correcao_solicitada:
      "Correção solicitada",
    aprovado: "Aprovado",
    vinculado: "Vinculado",
    termo_liberado:
      "Termo liberado",
    ativo: "Ativo",
    inativo: "Inativo",
  };

  return mapa[status] || status;
}

function nomeStatusTermo(status: string) {
  const mapa: Record<string, string> = {
    rascunho: "Rascunho",
    gerado: "Gerado",
    aguardando_assinatura:
      "Aguardando assinatura",
    assinado: "Assinado",
    cancelado: "Cancelado",
  };

  return mapa[status] || status;
}

function nomeStatusVinculo(status: string) {
  return status === "ativo"
    ? "Ativo"
    : status;
}

function primeiroNome(nome: string) {
  return nome.trim().split(/\s+/)[0];
}

function formatarData(data: string) {
  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(new Date(data));
}
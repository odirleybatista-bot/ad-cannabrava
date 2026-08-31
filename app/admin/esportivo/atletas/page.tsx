import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Atleta = {
  id: string;
  nome: string;
  apelido: string | null;
  modalidade: string | null;
  posicao: string | null;
  data_nascimento: string | null;
  status: string;
  criado_em: string;
};

export default async function AtletasPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("atletas")
    .select(`
      id,
      nome,
      apelido,
      modalidade,
      posicao,
      data_nascimento,
      status,
      criado_em
    `)
    .order("criado_em", {
      ascending: false,
    });

  const atletas: Atleta[] = data ?? [];

  const total = atletas.length;

  const preCadastro = atletas.filter(
    (atleta) => atleta.status === "pre_cadastro"
  ).length;

  const emAnalise = atletas.filter(
    (atleta) => atleta.status === "em_analise"
  ).length;

  const ativos = atletas.filter(
    (atleta) => atleta.status === "ativo"
  ).length;

  return (
    <div>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Gestão Esportiva
          </p>

          <h1 className="mt-1 text-3xl font-black text-[#08265a]">
            Atletas
          </h1>

          <p className="mt-1 text-slate-500">
            Gerencie os cadastros recebidos pelo Portal do Atleta.
          </p>
        </div>

        <Link
          href="/portal-atleta/dados"
          className="flex h-12 items-center rounded-xl bg-[#08265a] px-6 text-sm font-bold text-white transition hover:bg-[#0b3478]"
        >
          + Novo cadastro
        </Link>

      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          Não foi possível carregar os atletas: {error.message}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <Indicador
          titulo="Total de atletas"
          valor={String(total)}
          descricao="Cadastros registrados"
        />

        <Indicador
          titulo="Pré-cadastros"
          valor={String(preCadastro)}
          descricao="Aguardando continuidade"
        />

        <Indicador
          titulo="Em análise"
          valor={String(emAnalise)}
          descricao="Aguardando conferência"
        />

        <Indicador
          titulo="Ativos"
          valor={String(ativos)}
          descricao="Vínculos ativos"
        />

      </div>

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          <input
            type="search"
            placeholder="Buscar atleta..."
            className="h-11 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-blue-600"
          />

          <select
            defaultValue=""
            className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-blue-600"
          >
            <option value="">Todas as modalidades</option>
            <option value="Futebol">Futebol</option>
          </select>

          <select
            defaultValue=""
            className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-blue-600"
          >
            <option value="">Todos os status</option>
            <option value="pre_cadastro">Pré-cadastro</option>
            <option value="em_analise">Em análise</option>
            <option value="aprovado">Aprovado</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>

          <button
            type="button"
            className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Filtrar
          </button>

        </div>

      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-bold text-[#08265a]">
            Atletas cadastrados
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Cadastros registrados no banco de dados.
          </p>
        </div>

        {atletas.length === 0 ? (

          <div className="p-12 text-center">
            <p className="font-semibold text-slate-600">
              Nenhum atleta cadastrado
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Os cadastros realizados pelo Portal do Atleta aparecerão aqui.
            </p>
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">

                  <th className="px-6 py-4">
                    Atleta
                  </th>

                  <th className="px-6 py-4">
                    Modalidade
                  </th>

                  <th className="px-6 py-4">
                    Posição
                  </th>

                  <th className="px-6 py-4">
                    Idade
                  </th>

                  <th className="px-6 py-4">
                    Situação
                  </th>

                  <th className="px-6 py-4">
                    Cadastro
                  </th>

                  <th className="px-6 py-4 text-right">
                    Ações
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {atletas.map((atleta) => (

                  <tr
                    key={atleta.id}
                    className="transition hover:bg-slate-50"
                  >

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#08265a] text-xs font-bold text-white">
                          {iniciais(atleta.nome)}
                        </div>

                        <div>
                          <p className="font-bold text-slate-800">
                            {atleta.nome}
                          </p>

                          {atleta.apelido && (
                            <p className="text-xs text-slate-400">
                              {atleta.apelido}
                            </p>
                          )}
                        </div>

                      </div>

                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {atleta.modalidade || "Não informada"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {atleta.posicao || "Não informada"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {calcularIdade(atleta.data_nascimento)}
                    </td>

                    <td className="px-6 py-4">
                      <Status status={atleta.status} />
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatarData(atleta.criado_em)}
                    </td>

                    <td className="px-6 py-4 text-right">

                      <Link
                        href={`/admin/esportivo/atletas/${atleta.id}`}
                        className="inline-flex h-9 items-center rounded-lg border border-blue-200 bg-blue-50 px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                      >
                        Visualizar
                      </Link>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}

function Indicador({
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

      <p className="mt-2 text-3xl font-black text-[#08265a]">
        {valor}
      </p>

      <p className="mt-2 text-xs text-slate-400">
        {descricao}
      </p>

    </div>
  );
}

function Status({
  status,
}: {
  status: string;
}) {
  const configuracao: Record<
    string,
    {
      texto: string;
      classe: string;
    }
  > = {
    pre_cadastro: {
      texto: "Pré-cadastro",
      classe: "bg-slate-100 text-slate-700",
    },

    documentos_enviados: {
      texto: "Documentos enviados",
      classe: "bg-blue-100 text-blue-700",
    },

    em_analise: {
      texto: "Em análise",
      classe: "bg-amber-100 text-amber-700",
    },

    aprovado: {
      texto: "Aprovado",
      classe: "bg-emerald-100 text-emerald-700",
    },

    ativo: {
      texto: "Ativo",
      classe: "bg-emerald-100 text-emerald-700",
    },

    inativo: {
      texto: "Inativo",
      classe: "bg-red-100 text-red-700",
    },
  };

  const atual =
    configuracao[status] || {
      texto: status,
      classe: "bg-slate-100 text-slate-600",
    };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${atual.classe}`}
    >
      {atual.texto}
    </span>
  );
}

function iniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");
}

function calcularIdade(dataNascimento: string | null) {
  if (!dataNascimento) {
    return "-";
  }

  const nascimento = new Date(`${dataNascimento}T00:00:00`);
  const hoje = new Date();

  let idade =
    hoje.getFullYear() - nascimento.getFullYear();

  const mes =
    hoje.getMonth() - nascimento.getMonth();

  if (
    mes < 0 ||
    (mes === 0 &&
      hoje.getDate() < nascimento.getDate())
  ) {
    idade--;
  }

  return `${idade} anos`;
}

function formatarData(data: string) {
  const valor = new Date(data);

  return new Intl.DateTimeFormat("pt-BR").format(valor);
}
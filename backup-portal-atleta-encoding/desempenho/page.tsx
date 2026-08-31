export default function DesempenhoPage() {
  return (
    <div>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#08265a]">
          Meu Desempenho
        </h1>

        <p className="mt-1 text-slate-500">
          Acompanhe suas estatÃ­sticas pela A.D. Cannabrava.
        </p>
      </div>

      {/* RESUMO GERAL */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <Card
          titulo="Partidas"
          valor="0"
          descricao="Total de participaÃ§Ãµes"
        />

        <Card
          titulo="Titular"
          valor="0"
          descricao="Partidas como titular"
        />

        <Card
          titulo="Gols"
          valor="0"
          descricao="Gols marcados"
        />

        <Card
          titulo="AssistÃªncias"
          valor="0"
          descricao="Passes para gol"
        />

      </div>

      {/* POR TIPO DE JOGO */}
      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">

        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#08265a]">
            EstatÃ­sticas por tipo de partida
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Jogos oficiais, amistosos e jogos-treino sÃ£o contabilizados separadamente.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">

          <TipoJogo
            titulo="Jogos Oficiais"
            jogos="0"
            gols="0"
            assistencias="0"
            minutos="0"
          />

          <TipoJogo
            titulo="Amistosos"
            jogos="0"
            gols="0"
            assistencias="0"
            minutos="0"
          />

          <TipoJogo
            titulo="Jogos-treino"
            jogos="0"
            gols="0"
            assistencias="0"
            minutos="0"
          />

        </div>
      </section>

      {/* DISCIPLINA */}
      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">

        <h2 className="text-lg font-bold text-[#08265a]">
          Disciplina
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">

          <div className="rounded-xl bg-amber-50 p-5">
            <p className="text-sm font-semibold text-amber-700">
              CartÃµes amarelos
            </p>

            <p className="mt-2 text-3xl font-black text-amber-700">
              0
            </p>
          </div>

          <div className="rounded-xl bg-red-50 p-5">
            <p className="text-sm font-semibold text-red-700">
              CartÃµes vermelhos
            </p>

            <p className="mt-2 text-3xl font-black text-red-700">
              0
            </p>
          </div>

        </div>
      </section>

      {/* ÃšLTIMAS PARTIDAS */}
      <section className="mt-7 rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#08265a]">
            Ãšltimas partidas
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            HistÃ³rico recente de participaÃ§Ã£o.
          </p>
        </div>

        <div className="p-6">

          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">

            <p className="font-semibold text-slate-600">
              Nenhuma partida registrada
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Suas participaÃ§Ãµes aparecerÃ£o aqui apÃ³s o registro das partidas.
            </p>

          </div>

        </div>

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

      <p className="mt-2 text-3xl font-black text-[#08265a]">
        {valor}
      </p>

      <p className="mt-2 text-xs text-slate-400">
        {descricao}
      </p>

    </div>
  );
}

function TipoJogo({
  titulo,
  jogos,
  gols,
  assistencias,
  minutos,
}: {
  titulo: string;
  jogos: string;
  gols: string;
  assistencias: string;
  minutos: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

      <h3 className="font-bold text-[#08265a]">
        {titulo}
      </h3>

      <div className="mt-5 grid grid-cols-2 gap-4">

        <Estatistica
          titulo="Jogos"
          valor={jogos}
        />

        <Estatistica
          titulo="Gols"
          valor={gols}
        />

        <Estatistica
          titulo="AssistÃªncias"
          valor={assistencias}
        />

        <Estatistica
          titulo="Minutos"
          valor={minutos}
        />

      </div>

    </div>
  );
}

function Estatistica({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">
        {titulo}
      </p>

      <p className="mt-1 text-xl font-black text-slate-800">
        {valor}
      </p>
    </div>
  );
}
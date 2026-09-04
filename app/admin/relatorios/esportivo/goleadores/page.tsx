import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BotaoImprimir from "../BotaoImprimir";

type SearchParams = {
  competicao?: string;
  tipo?: string;
  temporada?: string;
};

export default async function GoleadoresPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filtros = await searchParams;

  const competicaoId =
    String(filtros.competicao || "").trim();

  const tipo =
    String(filtros.tipo || "").trim();

  const temporada =
    String(filtros.temporada || "").trim();

  const supabase = await createClient();

  const { data: competicoes } =
    await supabase
      .from("competicoes")
      .select("id,nome,temporada")
      .order("nome");

  const { data: partidas } =
    await supabase
      .from("partidas")
      .select(`
        id,
        competicao_id,
        tipo,
        temporada,
        status
      `);

  let partidasFiltradas =
    partidas || [];

  if (competicaoId) {
    partidasFiltradas =
      partidasFiltradas.filter(
        (partida) =>
          partida.competicao_id === competicaoId
      );
  }

  if (tipo) {
    partidasFiltradas =
      partidasFiltradas.filter(
        (partida) =>
          partida.tipo === tipo
      );
  }

  if (temporada) {
    partidasFiltradas =
      partidasFiltradas.filter(
        (partida) =>
          String(partida.temporada || "") ===
          temporada
      );
  }

  const idsPartidas =
    partidasFiltradas.map(
      (partida) => partida.id
    );

  let eventos: any[] = [];

  if (idsPartidas.length > 0) {
    const { data } =
      await supabase
        .from("eventos_partida")
        .select(`
          id,
          partida_id,
          atleta_id,
          tipo
        `)
        .in("partida_id", idsPartidas);

    eventos = data || [];
  }

  const golsPorAtleta =
    new Map<string, number>();

  for (const evento of eventos) {
    if (
      evento.tipo !== "gol" ||
      !evento.atleta_id
    ) {
      continue;
    }

    golsPorAtleta.set(
      evento.atleta_id,
      (golsPorAtleta.get(evento.atleta_id) || 0) + 1
    );
  }

  const { data: participacoes } =
    await supabase
      .from("participacoes_partida")
      .select(`
        partida_id,
        atleta_id
      `)
      .in(
        "partida_id",
        idsPartidas.length > 0
          ? idsPartidas
          : ["00000000-0000-0000-0000-000000000000"]
      );

  const jogosPorAtleta =
    new Map<string, Set<string>>();

  for (const participacao of participacoes || []) {
    if (!participacao.atleta_id) continue;

    if (
      !jogosPorAtleta.has(
        participacao.atleta_id
      )
    ) {
      jogosPorAtleta.set(
        participacao.atleta_id,
        new Set()
      );
    }

    jogosPorAtleta
      .get(participacao.atleta_id)!
      .add(participacao.partida_id);
  }

  const atletasIds =
    Array.from(
      new Set([
        ...golsPorAtleta.keys(),
        ...jogosPorAtleta.keys(),
      ])
    );

  let atletas: any[] = [];

  if (atletasIds.length > 0) {
    const { data } =
      await supabase
        .from("atletas")
        .select(`
          id,
          nome,
          apelido,
          posicao,
          numero_camisa
        `)
        .in("id", atletasIds);

    atletas = data || [];
  }

  const ranking =
    atletas
      .map((atleta) => {
        const gols =
          golsPorAtleta.get(atleta.id) || 0;

        const jogos =
          jogosPorAtleta.get(atleta.id)?.size || 0;

        return {
          ...atleta,
          gols,
          jogos,
          media:
            jogos > 0
              ? gols / jogos
              : 0,
        };
      })
      .sort((a, b) => {
        if (b.gols !== a.gols) {
          return b.gols - a.gols;
        }

        return b.media - a.media;
      });

  const temporadas =
    Array.from(
      new Set(
        (partidas || [])
          .map((partida) =>
            String(partida.temporada || "")
          )
          .filter(Boolean)
      )
    ).sort();

  return (
    <main
      style={{
        padding: "20px 30px",
        maxWidth: 1450,
        margin: "0 auto",
      }}
    >
      <div
        className="cabecalho-relatorio"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: 20,
          marginBottom: 14,
        }}
      >
        <div>
          <Link
            href="/admin/relatorios/esportivo"
            style={{
              color: "#1763d6",
              textDecoration: "none",
              fontSize: 12,
            }}
          >
            ← Relatórios Esportivos
          </Link>

          <h1
            style={{
              color: "#082e69",
              margin: "5px 0 2px",
              fontSize: 29,
            }}
          >
            Ranking de Goleadores
          </h1>

          <p
            style={{
              color: "#64748b",
              margin: 0,
              fontSize: 12,
            }}
          >
            Artilharia geral e por competição.
          </p>
        </div>

        <BotaoImprimir />
      </div>

      <form
        method="get"
        className="filtros"
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr 1fr 130px",
          gap: 10,
          padding: 12,
          background: "#ffffff",
          border: "1px solid #dce5f0",
          borderRadius: 12,
          marginBottom: 14,
        }}
      >
        <select
          name="temporada"
          defaultValue={temporada}
          style={campo}
        >
          <option value="">
            Todas as temporadas
          </option>

          {temporadas.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        <select
          name="competicao"
          defaultValue={competicaoId}
          style={campo}
        >
          <option value="">
            Todas as competições
          </option>

          {(competicoes || []).map(
            (competicao) => (
              <option
                key={competicao.id}
                value={competicao.id}
              >
                {competicao.nome}
              </option>
            )
          )}
        </select>

        <select
          name="tipo"
          defaultValue={tipo}
          style={campo}
        >
          <option value="">
            Todos os tipos
          </option>

          <option value="oficial">
            Jogo Oficial
          </option>

          <option value="amistoso">
            Amistoso
          </option>

          <option value="jogo_treino">
            Jogo-treino
          </option>
        </select>

        <button
          type="submit"
          style={{
            border: 0,
            borderRadius: 9,
            background: "#082e69",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Filtrar
        </button>
      </form>

      <section
        style={{
          background: "#fff",
          border: "1px solid #dce5f0",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "70px minmax(230px,1fr) 130px 100px 100px 110px",
            background: "#f7f9fc",
            borderBottom:
              "1px solid #e5e7eb",
            color: "#475569",
            fontSize: 11,
            fontWeight: 800,
            padding: "9px 16px",
          }}
        >
          <span>POS.</span>
          <span>ATLETA</span>
          <span>POSIÇÃO</span>
          <span>JOGOS</span>
          <span>GOLS</span>
          <span>MÉDIA</span>
        </div>

        {ranking.map((atleta, index) => (
          <div
            key={atleta.id}
            style={{
              display: "grid",
              gridTemplateColumns:
                "70px minmax(230px,1fr) 130px 100px 100px 110px",
              alignItems: "center",
              padding: "10px 16px",
              borderBottom:
                "1px solid #eef2f7",
            }}
          >
            <strong
              style={{
                color:
                  index === 0
                    ? "#082e69"
                    : "#64748b",
                fontSize:
                  index < 3 ? 19 : 14,
              }}
            >
              {index + 1}º
            </strong>

            <div>
              <strong
                style={{
                  color: "#082e69",
                  fontSize: 14,
                }}
              >
                {atleta.nome}
              </strong>

              <div
                style={{
                  color: "#94a3b8",
                  fontSize: 10,
                }}
              >
                {atleta.apelido || ""}
                {atleta.numero_camisa
                  ? ` • Camisa ${atleta.numero_camisa}`
                  : ""}
              </div>
            </div>

            <span style={texto}>
              {atleta.posicao || "-"}
            </span>

            <strong style={numero}>
              {atleta.jogos}
            </strong>

            <strong
              style={{
                ...numero,
                color: "#0f7a47",
              }}
            >
              {atleta.gols}
            </strong>

            <strong style={numero}>
              {atleta.media.toFixed(2)}
            </strong>
          </div>
        ))}

        {ranking.length === 0 && (
          <div
            style={{
              padding: 35,
              textAlign: "center",
              color: "#64748b",
              fontSize: 13,
            }}
          >
            Nenhum dado encontrado para os filtros selecionados.
          </div>
        )}
      </section>

      <style>{`
        @media print {
          header,
          nav,
          .filtros,
          .cabecalho-relatorio button {
            display: none !important;
          }

          body {
            background: white !important;
          }

          main {
            padding: 0 !important;
          }
        }
      `}</style>
    </main>
  );
}

const campo = {
  height: "40px",
  border: "1px solid #cbd5e1",
  borderRadius: "9px",
  background: "#ffffff",
  padding: "0 11px",
  fontSize: "12px",
  color: "#334155",
};

const texto = {
  color: "#475569",
  fontSize: "12px",
};

const numero = {
  color: "#334155",
  fontSize: "14px",
};
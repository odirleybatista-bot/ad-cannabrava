import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import {
  adicionarEvento,
  excluirEvento,
} from "./actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventosSumulaPage({
  params,
}: Props) {
  const { id } =
    await params;

  const supabase =
    await createClient();

  const {
    data: partida,
  } =
    await supabase
      .from("partidas")
      .select(`
        id,
        adversario,
        data_jogo,
        horario,
        local,
        status
      `)
      .eq(
        "id",
        id
      )
      .maybeSingle();

  if (!partida) {
    notFound();
  }

  const {
    data: sumula,
  } =
    await supabase
      .from("sumulas")
      .select(`
        id,
        status,
        gols_cannabrava,
        gols_adversario
      `)
      .eq(
        "partida_id",
        id
      )
      .maybeSingle();

  if (!sumula) {
    notFound();
  }

  const {
    data: escalacao,
  } =
    await supabase
      .from("sumula_atletas")
      .select(`
        atleta_id,
        numero_camisa,
        posicao,
        situacao,
        atletas (
          id,
          nome,
          apelido
        )
      `)
      .eq(
        "sumula_id",
        sumula.id
      );

  const {
    data: eventos,
  } =
    await supabase
      .from("sumula_eventos")
      .select(`
        id,
        atleta_id,
        atleta_relacionado_id,
        equipe,
        tipo,
        minuto,
        acrescimo,
        periodo,
        descricao,
        criado_em
      `)
      .eq(
        "sumula_id",
        sumula.id
      )
      .order(
        "minuto",
        {
          ascending: true,
          nullsFirst: false,
        }
      )
      .order(
        "criado_em",
        {
          ascending: true,
        }
      );

  const atletaIds = [
    ...new Set(
      (eventos || [])
        .flatMap(
          (evento: any) => [
            evento.atleta_id,
            evento.atleta_relacionado_id,
          ]
        )
        .filter(Boolean)
    ),
  ];

  let atletasEventos:
    any[] = [];

  if (
    atletaIds.length > 0
  ) {
    const {
      data: atletas,
    } =
      await supabase
        .from("atletas")
        .select(`
          id,
          nome,
          apelido
        `)
        .in(
          "id",
          atletaIds
        );

    atletasEventos =
      atletas || [];
  }

  const atletasDisponiveis =
    (escalacao || [])
      .filter(
        (item: any) =>
          item.situacao !==
          "nao_utilizado"
      )
      .map(
        (item: any) => ({
          id:
            item.atleta_id,

          nome:
            item.atletas
              ?.apelido ||
            item.atletas
              ?.nome ||
            "Atleta",

          nomeCompleto:
            item.atletas
              ?.nome ||
            "",

          numero:
            item.numero_camisa,

          posicao:
            item.posicao,

          situacao:
            item.situacao,
        })
      );

  const finalizada =
    sumula.status ===
    "finalizada";

  const golsCannabrava =
    (eventos || []).filter(
      (evento: any) =>
        evento.equipe ===
          "cannabrava" &&
        (
          evento.tipo ===
            "gol" ||
          evento.tipo ===
            "penalti_convertido"
        )
    ).length;

  const cartoesAmarelos =
    (eventos || []).filter(
      (evento: any) =>
        evento.equipe ===
          "cannabrava" &&
        evento.tipo ===
          "cartao_amarelo"
    ).length;

  const cartoesVermelhos =
    (eventos || []).filter(
      (evento: any) =>
        evento.equipe ===
          "cannabrava" &&
        evento.tipo ===
          "cartao_vermelho"
    ).length;

  const substituicoes =
    (eventos || []).filter(
      (evento: any) =>
        evento.tipo ===
          "substituicao"
    ).length;

  const adicionar =
    adicionarEvento.bind(
      null,
      id,
      sumula.id
    );

  return (
    <main className="pagina">
      <Link
        href={`/admin/esportivo/partidas/${id}/sumula`}
        className="voltar"
      >
        ← Voltar para a súmula
      </Link>

      <section className="hero">
        <div>
          <span className="rotulo">
            SÚMULA • EVENTOS
          </span>

          <h1>
            A.D. Cannabrava
            <b> x </b>
            {partida.adversario}
          </h1>

          <p>
            {formatarData(
              partida.data_jogo
            )}

            {partida.horario
              ? ` • ${partida.horario.slice(
                  0,
                  5
                )}`
              : ""}

            {partida.local
              ? ` • ${partida.local}`
              : ""}
          </p>
        </div>

        <div className="placar">
          <span>
            PLACAR DA SÚMULA
          </span>

          <div>
            <strong>
              {
                sumula.gols_cannabrava
              }
            </strong>

            <b>x</b>

            <strong>
              {
                sumula.gols_adversario
              }
            </strong>
          </div>
        </div>
      </section>

      <section className="indicadores">
        <Indicador
          titulo="Eventos"
          valor={
            eventos?.length || 0
          }
        />

        <Indicador
          titulo="Gols registrados"
          valor={golsCannabrava}
        />

        <Indicador
          titulo="Amarelos"
          valor={cartoesAmarelos}
        />

        <Indicador
          titulo="Vermelhos"
          valor={cartoesVermelhos}
        />

        <Indicador
          titulo="Substituições"
          valor={substituicoes}
        />
      </section>

      {finalizada && (
        <div className="aviso">
          Esta súmula está finalizada.
          Os eventos estão disponíveis
          apenas para consulta.
        </div>
      )}

      {!finalizada && (
        <form
          action={adicionar}
        >
          <section className="card">
            <div className="titulo">
              <div>
                <span>
                  NOVO EVENTO
                </span>

                <h2>
                  Registrar ocorrência
                </h2>

                <p>
                  Informe o tipo,
                  atleta e momento
                  da ocorrência.
                </p>
              </div>
            </div>

            <div className="grid">
              <CampoSelect
                label="Equipe"
                name="equipe"
                options={[
                  {
                    value:
                      "cannabrava",
                    label:
                      "A.D. Cannabrava",
                  },
                  {
                    value:
                      "adversario",
                    label:
                      partida.adversario,
                  },
                ]}
              />

              <CampoSelect
                label="Tipo do evento"
                name="tipo"
                options={[
                  {
                    value: "gol",
                    label: "Gol",
                  },
                  {
                    value:
                      "gol_contra",
                    label:
                      "Gol contra",
                  },
                  {
                    value:
                      "penalti_convertido",
                    label:
                      "Pênalti convertido",
                  },
                  {
                    value:
                      "penalti_perdido",
                    label:
                      "Pênalti perdido",
                  },
                  {
                    value:
                      "assistencia",
                    label:
                      "Assistência",
                  },
                  {
                    value:
                      "cartao_amarelo",
                    label:
                      "Cartão amarelo",
                  },
                  {
                    value:
                      "cartao_vermelho",
                    label:
                      "Cartão vermelho",
                  },
                  {
                    value:
                      "substituicao",
                    label:
                      "Substituição",
                  },
                  {
                    value:
                      "lesao",
                    label:
                      "Lesão",
                  },
                  {
                    value:
                      "outro",
                    label:
                      "Outro",
                  },
                ]}
              />

              <div className="campo">
                <label htmlFor="atleta_id">
                  Atleta principal
                </label>

                <select
                  id="atleta_id"
                  name="atleta_id"
                  defaultValue=""
                >
                  <option value="">
                    Selecione
                  </option>

                  {atletasDisponiveis.map(
                    (atleta: any) => (
                      <option
                        key={
                          atleta.id
                        }
                        value={
                          atleta.id
                        }
                      >
                        {atleta.numero
                          ? `#${atleta.numero} - `
                          : ""}
                        {atleta.nome}
                      </option>
                    )
                  )}
                </select>

                <small>
                  Em substituição:
                  atleta que sai.
                </small>
              </div>

              <div className="campo">
                <label htmlFor="atleta_relacionado_id">
                  Atleta relacionado
                </label>

                <select
                  id="atleta_relacionado_id"
                  name="atleta_relacionado_id"
                  defaultValue=""
                >
                  <option value="">
                    Nenhum
                  </option>

                  {atletasDisponiveis.map(
                    (atleta: any) => (
                      <option
                        key={
                          atleta.id
                        }
                        value={
                          atleta.id
                        }
                      >
                        {atleta.numero
                          ? `#${atleta.numero} - `
                          : ""}
                        {atleta.nome}
                      </option>
                    )
                  )}
                </select>

                <small>
                  Em substituição:
                  atleta que entra.
                </small>
              </div>

              <CampoSelect
                label="Período"
                name="periodo"
                options={[
                  {
                    value:
                      "primeiro_tempo",
                    label:
                      "1º tempo",
                  },
                  {
                    value:
                      "segundo_tempo",
                    label:
                      "2º tempo",
                  },
                  {
                    value:
                      "prorrogacao_1",
                    label:
                      "1ª prorrogação",
                  },
                  {
                    value:
                      "prorrogacao_2",
                    label:
                      "2ª prorrogação",
                  },
                  {
                    value:
                      "penaltis",
                    label:
                      "Pênaltis",
                  },
                ]}
              />

              <Campo
                label="Minuto"
                name="minuto"
                type="number"
                placeholder="Ex.: 34"
              />

              <Campo
                label="Acréscimo"
                name="acrescimo"
                type="number"
                placeholder="Ex.: 2"
              />
            </div>

            <div className="campo descricao">
              <label htmlFor="descricao">
                Observação do evento
              </label>

              <textarea
                id="descricao"
                name="descricao"
                rows={3}
                placeholder="Ex.: finalização de fora da área, falta tática, substituição por lesão..."
              />
            </div>

            <div className="acoes-form">
              <button
                type="submit"
                className="botao registrar"
              >
                Registrar evento
              </button>
            </div>
          </section>
        </form>
      )}

      <section className="card">
        <div className="titulo">
          <div>
            <span>
              CRONOLOGIA
            </span>

            <h2>
              Eventos registrados
            </h2>

            <p>
              Histórico das ocorrências
              da partida.
            </p>
          </div>
        </div>

        {!eventos ||
        eventos.length === 0 ? (
          <div className="vazio">
            Nenhum evento registrado.
          </div>
        ) : (
          <div className="timeline">
            {eventos.map(
              (evento: any) => {
                const atleta =
                  atletasEventos.find(
                    (item: any) =>
                      item.id ===
                      evento.atleta_id
                  );

                const relacionado =
                  atletasEventos.find(
                    (item: any) =>
                      item.id ===
                      evento.atleta_relacionado_id
                  );

                const excluir =
                  excluirEvento.bind(
                    null,
                    id,
                    sumula.id,
                    evento.id
                  );

                return (
                  <article
                    key={evento.id}
                    className="evento"
                  >
                    <div className="minuto">
                      {evento.minuto !==
                      null
                        ? `${evento.minuto}'`
                        : "—"}

                      {evento.acrescimo
                        ? `+${evento.acrescimo}`
                        : ""}
                    </div>

                    <div className="evento-dados">
                      <div className="evento-topo">
                        <span
                          className={`tag ${evento.tipo}`}
                        >
                          {nomeEvento(
                            evento.tipo
                          )}
                        </span>

                        <small>
                          {nomePeriodo(
                            evento.periodo
                          )}
                        </small>
                      </div>

                      <strong>
                        {evento.equipe ===
                        "cannabrava"
                          ? atleta
                            ? atleta.apelido ||
                              atleta.nome
                            : "A.D. Cannabrava"
                          : partida.adversario}
                      </strong>

                      {evento.tipo ===
                        "substituicao" &&
                        relacionado && (
                          <p className="substituicao">
                            Sai:{" "}
                            <b>
                              {atleta?.apelido ||
                                atleta?.nome ||
                                "Atleta"}
                            </b>
                            {" • "}
                            Entra:{" "}
                            <b>
                              {relacionado.apelido ||
                                relacionado.nome}
                            </b>
                          </p>
                        )}

                      {evento.tipo !==
                        "substituicao" &&
                        relacionado && (
                          <p>
                            Relacionado:{" "}
                            <b>
                              {relacionado.apelido ||
                                relacionado.nome}
                            </b>
                          </p>
                        )}

                      {evento.descricao && (
                        <p>
                          {evento.descricao}
                        </p>
                      )}
                    </div>

                    {!finalizada && (
                      <form
                        action={
                          excluir
                        }
                      >
                        <button
                          type="submit"
                          className="excluir"
                        >
                          Excluir
                        </button>
                      </form>
                    )}
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>

      <section className="card conferencia">
        <div>
          <span>
            CONFERÊNCIA DO PLACAR
          </span>

          <h2>
            Eventos x placar informado
          </h2>

          <p>
            Os gols registrados nos eventos
            devem corresponder ao placar
            lançado na súmula.
          </p>
        </div>

        <div className="comparacao">
          <div>
            <span>
              Gols nos eventos
            </span>

            <strong>
              {golsCannabrava}
            </strong>
          </div>

          <div>
            <span>
              Placar da súmula
            </span>

            <strong>
              {
                sumula.gols_cannabrava
              }
            </strong>
          </div>

          <div
            className={
              golsCannabrava ===
              sumula.gols_cannabrava
                ? "conferencia-status ok"
                : "conferencia-status alerta"
            }
          >
            {golsCannabrava ===
            sumula.gols_cannabrava
              ? "Conferido"
              : "Revisar"}
          </div>
        </div>
      </section>

      <style>{`
        .pagina {
          width:100%;
          max-width:1450px;
          margin:0 auto;
          padding:22px 24px 40px;
        }

        .voltar {
          display:inline-flex;
          margin-bottom:11px;
          color:#1763d6;
          font-size:10px;
          font-weight:900;
          text-decoration:none;
        }

        .hero {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:20px;
          padding:21px;
          border:1px solid #dce5f0;
          border-radius:15px;
          background:
            linear-gradient(
              135deg,
              #fff,
              #f4f8fd
            );
        }

        .rotulo {
          color:#168447;
          font-size:7px;
          font-weight:900;
          letter-spacing:.08em;
        }

        .hero h1 {
          margin:4px 0;
          color:#082e69;
          font-size:28px;
        }

        .hero h1 b {
          color:#94a3b8;
          font-weight:500;
        }

        .hero p {
          margin:0;
          color:#64748b;
          font-size:10px;
        }

        .placar {
          min-width:170px;
          padding:13px 15px;
          border-radius:11px;
          background:#082e69;
          color:white;
        }

        .placar > span {
          display:block;
          font-size:6px;
          font-weight:900;
          opacity:.65;
        }

        .placar div {
          display:flex;
          align-items:center;
          gap:10px;
          margin-top:3px;
        }

        .placar strong {
          font-size:27px;
        }

        .placar b {
          opacity:.5;
        }

        .indicadores {
          display:grid;
          grid-template-columns:
            repeat(5,1fr);
          gap:8px;
          margin-top:10px;
        }

        .indicador {
          padding:11px 13px;
          border:1px solid #dce5f0;
          border-radius:10px;
          background:white;
        }

        .indicador span {
          display:block;
          color:#94a3b8;
          font-size:6px;
          font-weight:900;
        }

        .indicador strong {
          display:block;
          margin-top:3px;
          color:#082e69;
          font-size:18px;
        }

        .card {
          margin-top:10px;
          padding:17px;
          border:1px solid #dce5f0;
          border-radius:13px;
          background:#fff;
        }

        .titulo {
          margin-bottom:14px;
        }

        .titulo span,
        .conferencia > div > span {
          color:#168447;
          font-size:6px;
          font-weight:900;
          letter-spacing:.07em;
        }

        .titulo h2,
        .conferencia h2 {
          margin:2px 0;
          color:#082e69;
          font-size:16px;
        }

        .titulo p,
        .conferencia p {
          margin:0;
          color:#94a3b8;
          font-size:8px;
        }

        .grid {
          display:grid;
          grid-template-columns:
            repeat(4,1fr);
          gap:10px;
        }

        .campo label {
          display:block;
          margin-bottom:5px;
          color:#475569;
          font-size:8px;
          font-weight:900;
        }

        .campo input,
        .campo select,
        .campo textarea {
          width:100%;
          border:1px solid #cbd5e1;
          border-radius:8px;
          background:#fff;
          color:#1e293b;
          font-size:9px;
        }

        .campo input,
        .campo select {
          height:40px;
          padding:0 9px;
        }

        .campo textarea {
          padding:10px;
          resize:vertical;
        }

        .campo small {
          display:block;
          margin-top:3px;
          color:#94a3b8;
          font-size:6px;
        }

        .descricao {
          margin-top:10px;
        }

        .acoes-form {
          display:flex;
          justify-content:flex-end;
          margin-top:10px;
        }

        .botao {
          min-height:39px;
          padding:0 15px;
          border:0;
          border-radius:8px;
          font-size:8px;
          font-weight:900;
          cursor:pointer;
        }

        .registrar {
          background:#082e69;
          color:white;
        }

        .timeline {
          display:grid;
          gap:7px;
        }

        .evento {
          display:grid;
          grid-template-columns:
            55px 1fr auto;
          align-items:center;
          gap:12px;
          padding:11px;
          border:1px solid #e6ebf1;
          border-radius:10px;
          background:#fbfcfd;
        }

        .minuto {
          color:#082e69;
          font-size:16px;
          font-weight:900;
          text-align:center;
        }

        .evento-topo {
          display:flex;
          align-items:center;
          gap:7px;
          margin-bottom:3px;
        }

        .evento-topo small {
          color:#94a3b8;
          font-size:6px;
        }

        .evento-dados > strong {
          display:block;
          color:#334155;
          font-size:10px;
        }

        .evento-dados p {
          margin:3px 0 0;
          color:#64748b;
          font-size:8px;
        }

        .tag {
          display:inline-flex;
          padding:4px 6px;
          border-radius:999px;
          background:#eef5ff;
          color:#1763d6;
          font-size:6px;
          font-weight:900;
        }

        .tag.gol,
        .tag.penalti_convertido,
        .tag.assistencia {
          background:#e7f7ee;
          color:#168447;
        }

        .tag.cartao_amarelo {
          background:#fff7d6;
          color:#9a7100;
        }

        .tag.cartao_vermelho {
          background:#fff0f0;
          color:#b42318;
        }

        .tag.substituicao {
          background:#eef5ff;
          color:#1763d6;
        }

        .excluir {
          padding:6px 8px;
          border:1px solid #efc7c3;
          border-radius:6px;
          background:#fff;
          color:#b42318;
          font-size:7px;
          font-weight:900;
          cursor:pointer;
        }

        .aviso {
          margin-top:10px;
          padding:12px 14px;
          border:1px solid #efd89f;
          border-radius:9px;
          background:#fff9e9;
          color:#8a6514;
          font-size:9px;
        }

        .vazio {
          padding:28px;
          border:1px dashed #cbd5e1;
          border-radius:9px;
          color:#94a3b8;
          font-size:9px;
          text-align:center;
        }

        .conferencia {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:20px;
        }

        .comparacao {
          display:flex;
          align-items:center;
          gap:8px;
        }

        .comparacao > div {
          min-width:110px;
          padding:9px 11px;
          border-radius:8px;
          background:#f8fafc;
        }

        .comparacao span {
          display:block;
          color:#94a3b8;
          font-size:6px;
          font-weight:900;
        }

        .comparacao strong {
          display:block;
          margin-top:2px;
          color:#082e69;
          font-size:18px;
        }

        .conferencia-status {
          min-width:85px !important;
          font-size:8px;
          font-weight:900;
          text-align:center;
        }

        .conferencia-status.ok {
          background:#e7f7ee;
          color:#168447;
        }

        .conferencia-status.alerta {
          background:#fff7e6;
          color:#a66300;
        }

        @media(max-width:1000px) {
          .grid {
            grid-template-columns:
              repeat(2,1fr);
          }

          .indicadores {
            grid-template-columns:
              repeat(3,1fr);
          }
        }

        @media(max-width:700px) {
          .pagina {
            padding:14px 10px 30px;
          }

          .hero,
          .conferencia {
            align-items:flex-start;
            flex-direction:column;
          }

          .placar {
            width:100%;
          }

          .indicadores {
            grid-template-columns:
              repeat(2,1fr);
          }

          .grid {
            grid-template-columns:1fr;
          }

          .evento {
            grid-template-columns:
              45px 1fr;
          }

          .evento form {
            grid-column:1 / -1;
          }

          .excluir,
          .botao {
            width:100%;
          }

          .comparacao {
            width:100%;
            flex-wrap:wrap;
          }

          .comparacao > div {
            flex:1;
          }
        }
      `}</style>
    </main>
  );
}

function Indicador({
  titulo,
  valor,
}: {
  titulo: string;
  valor: number;
}) {
  return (
    <div className="indicador">
      <span>
        {titulo.toUpperCase()}
      </span>

      <strong>{valor}</strong>
    </div>
  );
}

function Campo({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="campo">
      <label htmlFor={name}>
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        min={
          type === "number"
            ? 0
            : undefined
        }
        placeholder={placeholder}
      />
    </div>
  );
}

function CampoSelect({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div className="campo">
      <label htmlFor={name}>
        {label}
      </label>

      <select
        id={name}
        name={name}
        defaultValue={
          options[0]?.value
        }
      >
        {options.map(
          (item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          )
        )}
      </select>
    </div>
  );
}

function nomeEvento(
  tipo: string
) {
  const mapa: Record<
    string,
    string
  > = {
    gol: "Gol",
    gol_contra:
      "Gol contra",
    penalti_convertido:
      "Pênalti convertido",
    penalti_perdido:
      "Pênalti perdido",
    assistencia:
      "Assistência",
    cartao_amarelo:
      "Cartão amarelo",
    cartao_vermelho:
      "Cartão vermelho",
    substituicao:
      "Substituição",
    lesao: "Lesão",
    outro: "Outro",
  };

  return mapa[tipo] || tipo;
}

function nomePeriodo(
  periodo?: string | null
) {
  const mapa: Record<
    string,
    string
  > = {
    primeiro_tempo:
      "1º tempo",
    segundo_tempo:
      "2º tempo",
    prorrogacao_1:
      "1ª prorrogação",
    prorrogacao_2:
      "2ª prorrogação",
    penaltis:
      "Pênaltis",
  };

  return periodo
    ? mapa[periodo] ||
        periodo
    : "";
}

function formatarData(
  data: string
) {
  const [
    ano,
    mes,
    dia,
  ] =
    data.split("-");

  return `${dia}/${mes}/${ano}`;
}
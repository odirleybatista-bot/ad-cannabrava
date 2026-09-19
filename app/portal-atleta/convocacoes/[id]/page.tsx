import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { responderConvocacao } from "./actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ConvocacaoDetalhePage({
  params,
}: Props) {
  const { id } =
    await params;

  const usuario =
    await getCurrentUser();

  if (!usuario) {
    redirect("/portalcannabrava");
  }

  if (!usuario.atletaId) {
    redirect("/portal-atleta/dados");
  }

  const supabase =
    await createClient();

  const {
    data: registro,
  } =
    await supabase
      .from(
        "convocacao_atletas"
      )
      .select(`
        id,
        atleta_id,
        resposta,
        resposta_em,
        observacao_atleta
      `)
      .eq(
        "convocacao_id",
        id
      )
      .eq(
        "atleta_id",
        usuario.atletaId
      )
      .maybeSingle();

  if (!registro) {
    notFound();
  }

  const {
    data: convocacao,
  } =
    await supabase
      .from("convocacoes")
      .select(`
        id,
        partida_id,
        status,
        mensagem,
        limite_confirmacao,
        publicada_em,
        encerrada_em
      `)
      .eq("id", id)
      .maybeSingle();

  if (!convocacao) {
    notFound();
  }

  const {
    data: partida,
  } =
    await supabase
      .from("partidas")
      .select(`
        id,
        adversario,
        tipo,
        modalidade,
        temporada,
        rodada,
        fase,
        grupo,
        data_jogo,
        horario,
        local,
        cidade,
        mando,
        status
      `)
      .eq(
        "id",
        convocacao.partida_id
      )
      .maybeSingle();

  if (!partida) {
    notFound();
  }

  const prazoEncerrado =
    Boolean(
      convocacao.limite_confirmacao &&
        new Date(
          convocacao.limite_confirmacao
        ).getTime() < Date.now()
    );

  const podeResponder =
    convocacao.status ===
      "aberta" &&
    !prazoEncerrado &&
    registro.resposta ===
      "pendente";

  const confirmar =
    responderConvocacao.bind(
      null,
      id,
      "confirmado"
    );

  const indisponivel =
    responderConvocacao.bind(
      null,
      id,
      "indisponivel"
    );

  return (
    <main className="pagina">
      <Link
        href="/portal-atleta/convocacoes"
        className="voltar"
      >
        ← Minhas convocações
      </Link>

      <section className="hero">
        <div>
          <span className="rotulo">
            VOCÊ FOI CONVOCADO
          </span>

          <h1>
            A.D. Cannabrava
            <b> x </b>
            {partida.adversario}
          </h1>

          <p>
            {nomeTipo(partida.tipo)}
            {" • "}
            {formatarData(
              partida.data_jogo
            )}
            {partida.horario
              ? ` • ${partida.horario.slice(0, 5)}`
              : ""}
          </p>
        </div>

        <Resposta
          resposta={
            registro.resposta
          }
        />
      </section>

      <section className="dados-jogo">
        <Info
          titulo="Data"
          valor={formatarData(
            partida.data_jogo
          )}
        />

        <Info
          titulo="Horário"
          valor={
            partida.horario
              ? partida.horario.slice(0, 5)
              : "A definir"
          }
        />

        <Info
          titulo="Local"
          valor={
            partida.local ||
            "A definir"
          }
        />

        <Info
          titulo="Cidade"
          valor={
            partida.cidade ||
            "Não informada"
          }
        />

        <Info
          titulo="Modalidade"
          valor={
            partida.modalidade ||
            "Futebol"
          }
        />
      </section>

      {convocacao.mensagem && (
        <section className="card mensagem">
          <span>
            MENSAGEM DA ASSOCIAÇÃO
          </span>

          <p>
            {convocacao.mensagem}
          </p>
        </section>
      )}

      <section className="card">
        <div className="titulo">
          <span>
            SUA RESPOSTA
          </span>

          <h2>
            Confirmação de disponibilidade
          </h2>

          <p>
            Informe se estará disponível
            para representar a A.D. Cannabrava.
          </p>
        </div>

        {convocacao.limite_confirmacao && (
          <div className="prazo">
            <span>
              Prazo para resposta
            </span>

            <strong>
              {formatarDataHora(
                convocacao.limite_confirmacao
              )}
            </strong>
          </div>
        )}

        {!podeResponder ? (
          <div className="fechada">
            <strong>
              {registro.resposta === "confirmado"
                ? "Presença confirmada"
                : registro.resposta === "indisponivel"
                ? "Indisponibilidade registrada"
                : "Respostas encerradas"}
            </strong>

            <span>
              {registro.resposta !== "pendente"
                ? "Sua resposta já foi registrada e não pode ser alterada pelo portal."
                : prazoEncerrado
                ? "O prazo para confirmação terminou."
                : "Esta convocação não está aberta para novas respostas."}
            </span>
          </div>
        ) : (
          <>
            <form
              id="form-confirmar"
              action={confirmar}
            >
              <div className="campo">
                <label htmlFor="observacao-confirmar">
                  Observação opcional
                </label>

                <textarea
                  id="observacao-confirmar"
                  name="observacao_atleta"
                  rows={3}
                  defaultValue={
                    registro.observacao_atleta ||
                    ""
                  }
                  placeholder="Se necessário, deixe uma observação..."
                />
              </div>

              <button
                type="submit"
                className="botao confirmar"
              >
                CONFIRMO MINHA PRESENÇA
              </button>
            </form>

            <form
              action={indisponivel}
              className="form-indisponivel"
            >
              <input
                type="hidden"
                name="observacao_atleta"
                value={
                  registro.observacao_atleta ||
                  ""
                }
              />

              <button
                type="submit"
                className="botao indisponivel"
              >
                NÃO ESTAREI DISPONÍVEL
              </button>
            </form>
          </>
        )}

        {registro.resposta_em && (
          <div className="ultima-resposta">
            Última resposta registrada em{" "}
            {formatarDataHora(
              registro.resposta_em
            )}
          </div>
        )}
      </section>

      <style>{`
        .pagina {
          width: 100%;
          max-width: 1050px;
          margin: 0 auto;
          padding: 22px 30px 40px;
        }

        .voltar {
          display: inline-flex;
          margin-bottom: 12px;
          color: #1763d6;
          font-size: 10px;
          font-weight: 900;
          text-decoration: none;
        }

        .hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 22px;
          border-radius: 15px;
          background: #082e69;
          color: white;
        }

        .rotulo {
          font-size: 8px;
          font-weight: 900;
          color: #8ee1ae;
          letter-spacing: .08em;
        }

        .hero h1 {
          margin: 5px 0;
          color: white;
          font-size: 30px;
        }

        .hero h1 b {
          color: #8fa7c5;
          font-weight: 500;
        }

        .hero p {
          margin: 0;
          color: #c4d1e0;
          font-size: 10px;
        }

        .resposta {
          display: inline-flex;
          padding: 8px 11px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 900;
        }

        .resposta.confirmado {
          background: #e7f7ee;
          color: #168447;
        }

        .resposta.pendente {
          background: #fff7e6;
          color: #a66300;
        }

        .resposta.indisponivel {
          background: #fff0f0;
          color: #b42318;
        }

        .dados-jogo {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          margin-top: 10px;
        }

        .info {
          padding: 12px;
          border: 1px solid #dce5f0;
          border-radius: 10px;
          background: white;
        }

        .info span {
          display: block;
          color: #94a3b8;
          font-size: 7px;
          font-weight: 900;
        }

        .info strong {
          display: block;
          margin-top: 3px;
          color: #082e69;
          font-size: 10px;
        }

        .card {
          margin-top: 10px;
          padding: 18px;
          border: 1px solid #dce5f0;
          border-radius: 13px;
          background: white;
        }

        .mensagem {
          border-left: 4px solid #168447;
        }

        .mensagem > span,
        .titulo > span {
          color: #168447;
          font-size: 7px;
          font-weight: 900;
        }

        .mensagem p {
          margin: 7px 0 0;
          color: #475569;
          font-size: 11px;
          line-height: 1.6;
        }

        .titulo h2 {
          margin: 3px 0;
          color: #082e69;
          font-size: 18px;
        }

        .titulo p {
          margin: 0 0 15px;
          color: #64748b;
          font-size: 9px;
        }

        .prazo {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 14px;
          padding: 10px 12px;
          border-radius: 8px;
          background: #f8fafc;
        }

        .prazo span {
          color: #64748b;
          font-size: 8px;
        }

        .prazo strong {
          color: #334155;
          font-size: 9px;
        }

        .campo label {
          display: block;
          margin-bottom: 5px;
          color: #475569;
          font-size: 8px;
          font-weight: 900;
        }

        .campo textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 10px;
          resize: vertical;
        }

        .botao {
          width: 100%;
          min-height: 45px;
          margin-top: 9px;
          border: 0;
          border-radius: 9px;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
        }

        .confirmar {
          background: #168447;
          color: white;
        }

        .indisponivel {
          background: white;
          color: #b42318;
          border: 1px solid #efc7c3;
        }

        .ultima-resposta {
          margin-top: 12px;
          color: #94a3b8;
          font-size: 8px;
          text-align: center;
        }

        .fechada {
          padding: 20px;
          border-radius: 9px;
          background: #f8fafc;
          text-align: center;
        }

        .fechada strong {
          display: block;
          color: #475569;
        }

        .fechada span {
          display: block;
          margin-top: 4px;
          color: #94a3b8;
          font-size: 9px;
        }

        @media(max-width:750px) {
          .pagina {
            padding: 16px 14px 30px;
          }

          .hero {
            align-items: flex-start;
            flex-direction: column;
          }

          .dados-jogo {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </main>
  );
}

function Info({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="info">
      <span>
        {titulo.toUpperCase()}
      </span>

      <strong>{valor}</strong>
    </div>
  );
}

function Resposta({
  resposta,
}: {
  resposta: string;
}) {
  const mapa: Record<string, string> = {
    confirmado: "PRESENÇA CONFIRMADA",
    pendente: "AGUARDANDO RESPOSTA",
    indisponivel: "INDISPONÍVEL",
  };

  return (
    <span className={`resposta ${resposta}`}>
      {mapa[resposta] || resposta}
    </span>
  );
}

function nomeTipo(tipo: string) {
  const mapa: Record<string, string> = {
    oficial: "Jogo Oficial",
    amistoso: "Amistoso",
    jogo_treino: "Jogo-treino",
  };

  return mapa[tipo] || tipo;
}

function formatarData(data: string) {
  const [ano, mes, dia] =
    data.split("-");

  return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(data: string) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Bahia",
    }
  ).format(new Date(data));
}
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PortalCannabravaPage() {
  const supabase = await createClient();

  const hoje = new Date()
    .toISOString()
    .slice(0, 10);

  const { data: proximasPartidas } =
    await supabase
      .from("partidas")
      .select(`
        id,
        adversario,
        tipo,
        modalidade,
        data_jogo,
        horario,
        local,
        cidade,
        status,
        gols_cannabrava,
        gols_adversario
      `)
      .gte("data_jogo", hoje)
      .in("status", [
        "agendada",
        "confirmada",
      ])
      .order("data_jogo", {
        ascending: true,
      })
      .limit(4);

  const { data: ultimosResultados } =
    await supabase
      .from("partidas")
      .select(`
        id,
        adversario,
        tipo,
        modalidade,
        data_jogo,
        gols_cannabrava,
        gols_adversario,
        status
      `)
      .eq("status", "finalizada")
      .order("data_jogo", {
        ascending: false,
      })
      .limit(4);

  return (
    <main className="pagina">
      <header className="cabecalho">
        <div className="marca">
          <img
            src="/escudo.png"
            alt="A.D. Cannabrava"
          />

          <div>
            <span>
              ASSOCIAÇÃO DESPORTIVA
            </span>

            <strong>
              PORTAL CANNABRAVA
            </strong>
          </div>
        </div>

        <nav>
          <a href="#noticias">
            Notícias
          </a>

          <a href="#jogos">
            Jogos
          </a>

          <a href="#resultados">
            Resultados
          </a>

          <a href="#institucional">
            Institucional
          </a>

          <Link
            href="/login"
            className="area-restrita"
          >
            Área do Atleta
          </Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-conteudo">
          <span className="tag">
            A.D. CANNABRAVA • 2026
          </span>

          <h1>
            Portal Cannabrava
          </h1>

          <p>
            Notícias, jogos, resultados
            e informações oficiais da
            Associação Desportiva
            Cannabrava.
          </p>

          <div className="hero-acoes">
            <a
              href="#noticias"
              className="botao principal"
            >
              Ver notícias
            </a>

            <a
              href="#jogos"
              className="botao secundario"
            >
              Próximos jogos
            </a>
          </div>
        </div>


      </section>

      <section
        id="noticias"
        className="secao"
      >
        <div className="secao-topo">
          <span>
            ACOMPANHE A ASSOCIAÇÃO
          </span>

          <h2>
            Notícias e informações
          </h2>

          <p>
            Principais acontecimentos
            da A.D. Cannabrava.
          </p>
        </div>

        <div className="noticias-grid">
          <article className="noticia destaque">
            <div className="imagem-noticia">
              <img
                src="/escudo.png"
                alt="A.D. Cannabrava"
              />
            </div>

            <div className="noticia-conteudo">
              <span>
                INSTITUCIONAL
              </span>

              <h3>
                A.D. Cannabrava inicia
                sua trajetória esportiva
              </h3>

              <p>
                A associação foi criada
                para fortalecer o esporte,
                formar atletas e ampliar
                oportunidades para a
                comunidade de Canarana.
              </p>
            </div>
          </article>

          <article className="noticia">
            <div className="noticia-conteudo">
              <span>
                FUTEBOL
              </span>

              <h3>
                Primeira aparição com
                vitória por 2 x 1
              </h3>

              <p>
                A camisa ainda não era
                a oficial, mas o futebol
                foi original e de qualidade.
              </p>
            </div>
          </article>

          <article className="noticia">
            <div className="noticia-conteudo">
              <span>
                PROJETO
              </span>

              <h3>
                Esporte para além das
                quatro linhas
              </h3>

              <p>
                O projeto busca fomentar
                o esporte coletivo e
                individual e contribuir
                para a formação de jovens.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section
        id="jogos"
        className="secao secao-cinza"
      >
        <div className="secao-topo">
          <span>
            CALENDÁRIO
          </span>

          <h2>
            Próximos jogos
          </h2>

          <p>
            Acompanhe os próximos
            compromissos da Cannabrava.
          </p>
        </div>

        {!proximasPartidas ||
        proximasPartidas.length === 0 ? (
          <div className="vazio">
            Nenhuma partida agendada
            no momento.
          </div>
        ) : (
          <div className="jogos-grid">
            {proximasPartidas.map(
              (partida: any) => (
                <article
                  key={partida.id}
                  className="jogo"
                >
                  <div className="data-jogo">
                    <strong>
                      {dia(
                        partida.data_jogo
                      )}
                    </strong>

                    <span>
                      {mes(
                        partida.data_jogo
                      )}
                    </span>
                  </div>

                  <div className="jogo-conteudo">
                    <span className="tipo">
                      {nomeTipo(
                        partida.tipo
                      )}
                    </span>

                    <h3>
                      A.D. Cannabrava
                      <b> x </b>
                      {partida.adversario}
                    </h3>

                    <p>
                      {partida.horario
                        ? partida.horario.slice(
                            0,
                            5
                          )
                        : "Horário a definir"}

                      {" • "}

                      {partida.local ||
                        "Local a definir"}
                    </p>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>

      <section
        id="resultados"
        className="secao"
      >
        <div className="secao-topo">
          <span>
            RESULTADOS
          </span>

          <h2>
            Últimas partidas
          </h2>

          <p>
            Resultados recentes da
            A.D. Cannabrava.
          </p>
        </div>

        {!ultimosResultados ||
        ultimosResultados.length === 0 ? (
          <div className="vazio">
            Nenhuma partida finalizada
            disponível.
          </div>
        ) : (
          <div className="resultados">
            {ultimosResultados.map(
              (partida: any) => (
                <article
                  key={partida.id}
                  className="resultado"
                >
                  <div>
                    <span>
                      {formatarData(
                        partida.data_jogo
                      )}
                    </span>

                    <strong>
                      A.D. Cannabrava
                      <b> x </b>
                      {partida.adversario}
                    </strong>
                  </div>

                  <div className="placar">
                    <strong>
                      {partida.gols_cannabrava ??
                        0}
                    </strong>

                    <b>x</b>

                    <strong>
                      {partida.gols_adversario ??
                        0}
                    </strong>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>

      <section
        id="institucional"
        className="institucional"
      >
        <div>
          <span>
            A.D. CANNABRAVA
          </span>

          <h2>
            Esporte, formação e
            pertencimento.
          </h2>

          <p>
            A Associação Desportiva
            Cannabrava nasceu para
            incentivar a prática
            esportiva, fortalecer o
            esporte local e criar
            oportunidades para atletas
            e jovens de Canarana.
          </p>

          <strong>
            Força, Foco e União.
          </strong>
        </div>

        <img
          src="/escudo.png"
          alt="A.D. Cannabrava"
        />
      </section>

      <footer>
        <div>
          <strong>
            PORTAL CANNABRAVA
          </strong>

          <span>
            Associação Desportiva
            Cannabrava
          </span>
        </div>

        <div>
          <span>
            Canarana - Bahia
          </span>

          <span>
            © 2026
          </span>
        </div>
      </footer>

      <style>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        .pagina {
          min-height: 100vh;
          background: #f7f9fc;
          color: #334155;
        }

        .cabecalho {
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          padding: 10px 6%;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .marca {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .marca img {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }

        .marca span {
          display: block;
          color: #168447;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .marca strong {
          display: block;
          color: #082e69;
          font-size: 16px;
        }

        nav {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        nav a {
          color: #475569;
          font-size: 9px;
          font-weight: 800;
          text-decoration: none;
        }

        .area-restrita {
          padding: 9px 12px;
          border-radius: 8px;
          background: #082e69;
          color: white !important;
        }

        .hero {
          position: relative;
          min-height: 500px;
          display: flex;
          align-items: center;
          padding: 65px 8%;
          overflow: hidden;

          background-image:
            linear-gradient(
              90deg,
              rgba(4, 24, 58, .72) 0%,
              rgba(4, 24, 58, .48) 37%,
              rgba(4, 24, 58, .12) 70%,
              rgba(4, 24, 58, .03) 100%
            ),
            url("/portal-cannabrava-hero.png");

          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          color: white;
        }

        .hero-conteudo {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 650px;
        }

        .tag {
          display: inline-flex;
          padding: 6px 9px;
          border-radius: 999px;
          background: rgba(255,255,255,.1);
          color: #8ee1ae;
          font-size: 8px;
          font-weight: 900;
        }

        .hero h1 {
          margin: 13px 0 10px;
          color: white;
          font-size: clamp(
            38px,
            6vw,
            72px
          );
          line-height: .95;
        }

        .hero p {
          max-width: 550px;
          margin: 0;
          color: #c4d1e0;
          font-size: 15px;
          line-height: 1.6;
        }

        .hero-acoes {
          display: flex;
          gap: 9px;
          margin-top: 23px;
        }

        .botao {
          min-height: 43px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 17px;
          border-radius: 9px;
          font-size: 9px;
          font-weight: 900;
          text-decoration: none;
        }

        .principal {
          background: #168447;
          color: white;
        }

        .secundario {
          border: 1px solid rgba(255,255,255,.35);
          color: white;
        }


        .secao {
          padding: 58px 7%;
        }

        .secao-cinza {
          background: #eef3f8;
        }

        .secao-topo span,
        .institucional span {
          color: #168447;
          font-size: 8px;
          font-weight: 900;
        }

        .secao-topo h2,
        .institucional h2 {
          margin: 4px 0;
          color: #082e69;
          font-size: 30px;
        }

        .secao-topo p {
          margin: 0 0 22px;
          color: #64748b;
          font-size: 11px;
        }

        .noticias-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 12px;
        }

        .noticia {
          padding: 20px;
          border: 1px solid #dce5f0;
          border-radius: 14px;
          background: white;
        }

        .noticia.destaque {
          grid-row: span 2;
          display: grid;
          grid-template-columns: .45fr 1fr;
          gap: 20px;
          align-items: center;
        }

        .imagem-noticia {
          min-height: 230px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #082e69;
        }

        .imagem-noticia img {
          width: 65%;
          max-width: 160px;
        }

        .noticia span,
        .tipo {
          color: #168447;
          font-size: 7px;
          font-weight: 900;
        }

        .noticia h3 {
          margin: 5px 0 7px;
          color: #082e69;
          font-size: 18px;
        }

        .noticia p {
          margin: 0;
          color: #64748b;
          font-size: 10px;
          line-height: 1.6;
        }

        .jogos-grid {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 10px;
        }

        .jogo {
          display: flex;
          gap: 13px;
          padding: 14px;
          border: 1px solid #dce5f0;
          border-radius: 12px;
          background: white;
        }

        .data-jogo {
          flex: 0 0 55px;
          width: 55px;
          height: 55px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #eaf2ff;
        }

        .data-jogo strong {
          color: #082e69;
          font-size: 20px;
        }

        .data-jogo span {
          color: #1763d6;
          font-size: 7px;
          font-weight: 900;
        }

        .jogo h3 {
          margin: 4px 0;
          color: #082e69;
          font-size: 13px;
        }

        .jogo h3 b {
          color: #94a3b8;
          font-weight: 500;
        }

        .jogo p {
          margin: 0;
          color: #64748b;
          font-size: 8px;
        }

        .resultados {
          display: grid;
          gap: 8px;
        }

        .resultado {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 13px 15px;
          border: 1px solid #dce5f0;
          border-radius: 11px;
          background: white;
        }

        .resultado span {
          display: block;
          color: #94a3b8;
          font-size: 7px;
        }

        .resultado strong {
          display: block;
          margin-top: 3px;
          color: #082e69;
          font-size: 12px;
        }

        .placar {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .placar strong {
          font-size: 22px;
        }

        .placar b {
          color: #94a3b8;
        }

        .institucional {
          display: grid;
          grid-template-columns: 1fr .4fr;
          align-items: center;
          gap: 35px;
          padding: 60px 8%;
          background: #082e69;
          color: white;
        }

        .institucional h2 {
          color: white;
          font-size: 34px;
        }

        .institucional p {
          color: #c4d1e0;
          font-size: 12px;
          line-height: 1.7;
        }

        .institucional img {
          width: 180px;
          max-width: 100%;
          justify-self: center;
        }

        footer {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 22px 7%;
          background: #061e48;
          color: white;
        }

        footer strong,
        footer span {
          display: block;
        }

        footer span {
          margin-top: 2px;
          color: #9eb0c5;
          font-size: 8px;
        }

        .vazio {
          padding: 35px;
          border: 1px dashed #cbd5e1;
          border-radius: 10px;
          background: white;
          color: #94a3b8;
          text-align: center;
        }

        @media(max-width:950px) {
          .cabecalho {
            align-items: flex-start;
            flex-direction: column;
          }

          .noticias-grid {
            grid-template-columns: 1fr;
          }

          .hero {
            min-height: 450px;
            background-position: 58% center;
          }

          .noticia.destaque {
            grid-row: auto;
          }

          .jogos-grid {
            grid-template-columns: 1fr;
          }
        }

        @media(max-width:650px) {
          .cabecalho {
            position: static;
            padding: 12px 16px;
          }

          nav a:not(.area-restrita) {
            display: none;
          }

          .hero {
            min-height: 390px;
            padding: 45px 18px;
          }

          .secao {
            padding: 38px 14px;
          }

          .noticia.destaque {
            grid-template-columns: 1fr;
          }

          .institucional {
            grid-template-columns: 1fr;
            padding: 45px 18px;
          }

          footer {
            flex-direction: column;
            padding: 20px 16px;
          }
        }
      `}</style>
    </main>
  );
}

function nomeTipo(tipo: string) {
  const mapa: Record<string,string> = {
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

function dia(data: string) {
  return data?.split("-")[2] || "--";
}

function mes(data: string) {
  const meses = [
    "JAN","FEV","MAR","ABR",
    "MAI","JUN","JUL","AGO",
    "SET","OUT","NOV","DEZ",
  ];

  const indice =
    Number(data.split("-")[1]) - 1;

  return meses[indice] || "";
}
import ProdutosLojaSidebar from "@/components/portal/ProdutosLojaSidebar";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ContadorAcessos from "@/components/portal/ContadorAcessos";

export const dynamic = "force-dynamic";

const patrocinadores = [
  {
    nome: "Sport Car",
    logo: "/patrocinadores/sport-car.jpeg",
  },
  {
    nome: "OK Contax",
    logo: "/patrocinadores/ok-contax.jpeg",
  },
  {
    nome: "O Ferraco",
    logo: "/patrocinadores/o-ferraco.jpeg",
  },
  {
    nome: "João Pneus",
    logo: "/patrocinadores/joao-pneus.jpeg",
  },
  {
    nome: "Café Salobro",
    logo: "/patrocinadores/cafe-salobro.jpeg",
  },
  {
    nome: "Dojo Alpha",
    logo: "/patrocinadores/dojo-alpha.jpeg",
  },
  {
    nome: "Lava Jato",
    logo: "/patrocinadores/lava-jato.jpeg",
  },
  {
    nome: "Luz do Sol",
    logo: "/patrocinadores/luz-do-sol.jpeg",
  },
  {
    nome: "Monkey Gastro Bar",
    logo: "/patrocinadores/monkey.jpeg",
  },
];

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
        status
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
            src="/branding/escudo.png"
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
            href="/portalcannabrava/loja"
            className="menu-loja"
          >
            Loja
          </Link>

          <Link
            href="/login"
            className="area-atleta"
          >
            Área do Atleta
          </Link>
        </nav>
      </header>

      <section className="area-destaque">
        <div className="hero">
          <div className="hero-conteudo">
            <span className="tag">
              A.D. CANNABRAVA • 2026
            </span>

            <h1>
              Portal Cannabrava
            </h1>

            <p>
              Notícias, jogos,
              resultados e informações
              oficiais da Associação
              Desportiva Cannabrava.
            </p>

            <div className="hero-acoes">
              <a
                href="#noticias"
                className="botao verde"
              >
                Ver notícias
              </a>

              <a
                href="#jogos"
                className="botao transparente"
              >
                Próximos jogos
              </a>
            </div>
          </div>
        </div>

        <div className="lateral-portal">

        <aside className="patrocinadores">
          <div className="patrocinadores-titulo">
            <span>
              APOIAM
            </span>

            <strong>
              NOSSOS
              <br />
              PATROCINADORES
            </strong>
          </div>

          <div className="patrocinadores-janela">
            <div className="patrocinadores-scroll">
              {[...patrocinadores, ...patrocinadores].map(
                (patrocinador, index) => (
                  <div
                    className="patrocinador"
                    key={`${patrocinador.nome}-${index}`}
                  >
                    <img
                      src={patrocinador.logo}
                      alt={patrocinador.nome}
                    />

                    <span>
                      {patrocinador.nome}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </aside>

        <ProdutosLojaSidebar />

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
                src="/branding/escudo.png"
                alt="A.D. Cannabrava"
              />
            </div>

            <div>
              <span>
                INSTITUCIONAL
              </span>

              <h3>
                A.D. Cannabrava inicia
                sua trajetória esportiva
              </h3>

              <p>
                A associação foi criada
                para fortalecer o
                esporte, formar atletas
                e ampliar oportunidades
                para a comunidade de
                Canarana.
              </p>
            </div>
          </article>

          <article className="noticia">
            <span>
              FUTEBOL
            </span>

            <h3>
              Primeira aparição com
              vitória por 2 x 1
            </h3>

            <p>
              A camisa ainda não era a
              oficial, mas o futebol foi
              original e de qualidade.
            </p>
          </article>

          <article className="noticia">
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
              para a formação dos
              jovens.
            </p>
          </article>
        </div>
      </section>

      <section
        id="jogos"
        className="secao fundo-cinza"
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
            Nenhuma partida agendada.
          </div>
        ) : (
          <div className="jogos-grid">
            {proximasPartidas.map(
              (partida: any) => (
                <article
                  className="jogo"
                  key={partida.id}
                >
                  <div className="data">
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

                  <div>
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
        </div>

        {!ultimosResultados ||
        ultimosResultados.length === 0 ? (
          <div className="vazio">
            Nenhum resultado disponível.
          </div>
        ) : (
          <div className="resultados">
            {ultimosResultados.map(
              (partida: any) => (
                <article
                  className="resultado"
                  key={partida.id}
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
          src="/branding/escudo.png"
          alt="A.D. Cannabrava"
        />
      </section>

      <section className="faixa-contador">
        <div>
          <span className="contador-rotulo">
            PORTAL CANNABRAVA EM NÚMEROS
          </span>

          <h2>
            Nossa comunidade acompanha de perto.
          </h2>
        </div>

        <ContadorAcessos />
      </section>

      <footer>
        <div>
          <strong>
            PORTAL CANNABRAVA
          </strong>

          <span>
            Associação Desportiva Cannabrava
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
          min-height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 9px 6%;
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
          color: #334155;
          font-size: 9px;
          font-weight: 900;
          text-decoration: none;
        }

        .area-atleta {
          padding: 10px 13px;
          border-radius: 8px;
          background: #082e69;
          color: white !important;
        }

        .area-destaque {
          width: 100%;
          display: grid;
          grid-template-columns:
            minmax(0, 90fr)
            minmax(135px, 10fr);
          min-height: 455px;
          background: #082e69;
        }

        .hero {
          position: relative;
          min-width: 0;
          min-height: 455px;
          display: flex;
          align-items: center;
          overflow: hidden;
          padding: 48px 7%;

          background-image:
            linear-gradient(
              90deg,
              rgba(3, 23, 55, .80) 0%,
              rgba(3, 23, 55, .55) 31%,
              rgba(3, 23, 55, .15) 58%,
              rgba(3, 23, 55, .02) 100%
            ),
            url("/portal/portal-cannabrava-hero.png");

          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
        }

        .hero-conteudo {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 620px;
        }

        .tag {
          display: inline-flex;
          padding: 6px 9px;
          border-radius: 999px;
          background: rgba(22,132,71,.8);
          color: white;
          font-size: 7px;
          font-weight: 900;
        }

        .hero h1 {
          margin: 13px 0 8px;
          color: white;
          font-size: clamp(
            38px,
            5vw,
            68px
          );
          line-height: .98;
          font-weight: 400;
        }

        .hero p {
          max-width: 590px;
          margin: 0;
          color: #fff;
          font-size: 14px;
          line-height: 1.55;
        }

        .hero-acoes {
          display: flex;
          gap: 9px;
          margin-top: 22px;
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

        .verde {
          background: #168447;
          color: white;
        }

        .transparente {
          border: 1px solid rgba(255,255,255,.5);
          background: rgba(5,33,72,.25);
          color: white;
        }

        .patrocinadores {
          min-width: 135px;
          height: 455px;
          padding: 13px 9px;
          overflow: hidden;
          border-left: 1px solid rgba(255,255,255,.1);
          background:
            linear-gradient(
              180deg,
              #061e48,
              #0b3976
            );
        }

        .patrocinadores-titulo {
          height: 58px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .patrocinadores-titulo span {
          color: #73d79c;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: .12em;
        }

        .patrocinadores-titulo strong {
          margin-top: 3px;
          color: white;
          font-size: 8px;
          line-height: 1.25;
        }

        .patrocinadores-janela {
          position: relative;
          height: calc(100% - 58px);
          overflow: hidden;
          mask-image:
            linear-gradient(
              to bottom,
              transparent 0,
              black 7%,
              black 93%,
              transparent 100%
            );
        }

        .patrocinadores-scroll {
          display: flex;
          flex-direction: column;
          gap: 11px;
          animation:
            subirPatrocinadores
            38s
            linear
            infinite;
        }

        .patrocinadores-scroll:hover {
          animation-play-state: paused;
        }

        .patrocinador {
          flex: 0 0 88px;
          min-height: 88px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 8px 5px;
          border-radius: 10px;
          background: white;
          box-shadow:
            0 5px 15px
            rgba(0,0,0,.15);
        }

        .patrocinador img {
          width: 100%;
          max-width: 95px;
          max-height: 57px;
          object-fit: contain;
        }

        .patrocinador span {
          color: #475569;
          font-size: 6px;
          font-weight: 800;
          text-align: center;
        }

        @keyframes subirPatrocinadores {
          0% {
            transform:
              translateY(0);
          }

          100% {
            transform:
              translateY(
                calc(-50% - 5px)
              );
          }
        }

        .secao {
          padding: 48px 7%;
        }

        .fundo-cinza {
          background: #eef3f8;
        }

        .secao-topo span,
        .institucional span {
          color: #168447;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .secao-topo h2,
        .institucional h2 {
          margin: 4px 0;
          color: #082e69;
          font-size: 29px;
        }

        .secao-topo p {
          margin: 0 0 20px;
          color: #64748b;
          font-size: 10px;
        }

        .noticias-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 11px;
        }

        .noticia {
          padding: 19px;
          border: 1px solid #dce5f0;
          border-radius: 13px;
          background: white;
        }

        .noticia.destaque {
          grid-row: span 2;
          display: grid;
          grid-template-columns: .4fr 1fr;
          align-items: center;
          gap: 18px;
        }

        .imagem-noticia {
          min-height: 205px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #082e69;
        }

        .imagem-noticia img {
          width: 65%;
          max-width: 150px;
        }

        .noticia > span,
        .noticia > div > span,
        .tipo {
          color: #168447;
          font-size: 7px;
          font-weight: 900;
        }

        .noticia h3 {
          margin: 5px 0 7px;
          color: #082e69;
          font-size: 17px;
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
          gap: 9px;
        }

        .jogo {
          display: flex;
          gap: 12px;
          padding: 13px;
          border: 1px solid #dce5f0;
          border-radius: 11px;
          background: white;
        }

        .data {
          flex: 0 0 53px;
          width: 53px;
          height: 53px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #eaf2ff;
        }

        .data strong {
          color: #082e69;
          font-size: 19px;
        }

        .data span {
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
          border-radius: 10px;
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
          gap: 9px;
        }

        .placar strong {
          font-size: 21px;
        }

        .placar b {
          color: #94a3b8;
        }

        .institucional {
          display: grid;
          grid-template-columns: 1fr .3fr;
          align-items: center;
          gap: 35px;
          padding: 55px 8%;
          background: #082e69;
          color: white;
        }

        .institucional h2 {
          color: white;
          font-size: 32px;
        }

        .institucional p {
          max-width: 700px;
          color: #c4d1e0;
          font-size: 11px;
          line-height: 1.7;
        }

        .institucional > div > strong {
          color: #8ee1ae;
        }

        .institucional img {
          width: 155px;
          max-width: 100%;
          justify-self: center;
        }

        footer {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 20px 7%;
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
          padding: 32px;
          border: 1px dashed #cbd5e1;
          border-radius: 10px;
          background: white;
          color: #94a3b8;
          font-size: 9px;
          text-align: center;
        }

        @media(max-width:1050px) {
          .area-destaque {
            grid-template-columns:
              minmax(0, 86fr)
              minmax(125px, 14fr);
          }

          .noticias-grid {
            grid-template-columns: 1fr;
          }

          .noticia.destaque {
            grid-row: auto;
          }
        }

        @media(max-width:760px) {
          .cabecalho {
            position: static;
            align-items: flex-start;
            flex-direction: column;
            padding: 12px 16px;
          }

          nav {
            width: 100%;
            overflow-x: auto;
          }

          nav a:not(.area-atleta):not(.menu-loja) {
            display: none;
          }

          .area-destaque {
            display: block;
            min-height: 400px;
          }

          .hero {
            min-height: 400px;
            padding: 38px 18px;
            background-position:
              45% center;
          }

          .hero h1 {
            font-size: 40px;
          }

          .hero p {
            max-width: 410px;
            font-size: 12px;
          }

          .patrocinadores {
            display: none;
          }

          .secao {
            padding: 36px 14px;
          }

          .noticia.destaque {
            grid-template-columns: 1fr;
          }

          .imagem-noticia {
            min-height: 160px;
          }

          .jogos-grid {
            grid-template-columns: 1fr;
          }

          .institucional {
            grid-template-columns: 1fr;
            padding: 42px 18px;
          }

          footer {
            flex-direction: column;
            padding: 19px 16px;
          }
        }

        @media(prefers-reduced-motion: reduce) {
          .patrocinadores-scroll {
            animation: none;
          }
        }

        /* ====================================================
           MOBILE - PORTAL CANNABRAVA
           Banner compacto + patrocinadores horizontais
           ==================================================== */

        @keyframes patrocinadoresMobile {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(calc(-50% - 5px));
          }
        }

        @media (max-width: 760px) {

          .cabecalho {
            position: static;
            min-height: 74px;
            padding: 8px 16px;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }

          .marca {
            gap: 7px;
          }

          .marca img {
            width: 42px;
            height: 42px;
          }

          .marca span {
            font-size: 6px;
          }

          .marca strong {
            font-size: 14px;
          }

          nav {
            width: auto;
            flex: 0 0 auto;
            overflow: visible;
          }

          nav a:not(.area-atleta):not(.menu-loja) {
            display: none;
          }

          .area-atleta {
            padding: 9px 11px;
            white-space: nowrap;
            font-size: 8px;
          }

          /* Área principal deixa de ser duas colunas */
          .area-destaque {
            display: flex !important;
            flex-direction: column;
            width: 100%;
            min-height: 0;
            background: #082e69;
          }

          /* Banner */
          .hero {
            width: 100%;
            min-height: 330px;
            padding: 28px 20px 30px;
            display: flex;
            align-items: center;

            background-size: cover;
            background-position: 52% center;
            background-repeat: no-repeat;
          }

          .hero-conteudo {
            max-width: 360px;
          }

          .tag {
            padding: 5px 8px;
            font-size: 6px;
          }

          .hero h1 {
            margin: 11px 0 8px;
            font-size: clamp(
              34px,
              11vw,
              47px
            );
            line-height: 1;
          }

          .hero p {
            max-width: 330px;
            font-size: 11px;
            line-height: 1.5;
          }

          .hero-acoes {
            gap: 7px;
            margin-top: 17px;
          }

          .botao {
            min-height: 39px;
            padding: 0 13px;
            font-size: 8px;
          }

          /* ================================================
             PATROCINADORES NO SMARTPHONE
             ================================================ */

          .patrocinadores {
            display: block !important;
            width: 100%;
            min-width: 0;
            height: 145px;
            padding: 7px 0 9px;
            overflow: hidden;

            border-left: 0;
            border-top:
              1px solid
              rgba(255,255,255,.12);

            background:
              linear-gradient(
                90deg,
                #061e48,
                #0b3976
              );
          }

          .patrocinadores-titulo {
            width: 100%;
            height: 31px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 5px;
          }

          .patrocinadores-titulo span {
            font-size: 5px;
            letter-spacing: .1em;
          }

          .patrocinadores-titulo strong {
            margin: 0;
            font-size: 7px;
            line-height: 1;
          }

          .patrocinadores-titulo strong br {
            display: none;
          }

          .patrocinadores-janela {
            width: 100%;
            height: 98px;
            overflow: hidden;

            mask-image:
              linear-gradient(
                to right,
                transparent 0,
                black 5%,
                black 95%,
                transparent 100%
              );

            -webkit-mask-image:
              linear-gradient(
                to right,
                transparent 0,
                black 5%,
                black 95%,
                transparent 100%
              );
          }

          .patrocinadores-scroll {
            width: max-content;
            height: 100%;

            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 8px;

            animation:
              patrocinadoresMobile
              32s
              linear
              infinite;
          }

          .patrocinador {
            flex: 0 0 125px;
            width: 125px;
            min-height: 86px;
            height: 86px;

            padding: 6px;
            gap: 2px;

            border-radius: 9px;
          }

          .patrocinador img {
            width: auto;
            max-width: 110px;
            height: auto;
            max-height: 61px;
            object-fit: contain;
          }

          .patrocinador span {
            font-size: 5px;
          }

          /* Conteúdo abaixo */
          .secao {
            padding: 34px 16px;
          }

          .secao-topo h2 {
            font-size: 25px;
          }

          .noticias-grid {
            grid-template-columns: 1fr;
          }

          .noticia.destaque {
            grid-template-columns: 1fr;
            grid-row: auto;
          }

          .imagem-noticia {
            min-height: 150px;
          }

          .jogos-grid {
            grid-template-columns: 1fr;
          }

          .institucional {
            grid-template-columns: 1fr;
            padding: 40px 18px;
          }

          .institucional img {
            width: 125px;
          }

          footer {
            flex-direction: column;
            padding: 18px 16px;
          }
        }

        .faixa-contador {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          padding: 25px 7%;
          border-top: 1px solid #dce5f0;
          background: white;
        }

        .contador-rotulo {
          display: block;
          color: #168447;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .09em;
        }

        .faixa-contador h2 {
          margin: 4px 0 0;
          color: #082e69;
          font-size: 18px;
        }

        .contador-acessos {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 12px 18px;
          border: 1px solid #dce5f0;
          border-radius: 12px;
          background: #f7f9fc;
        }

        .contador-acessos > div {
          min-width: 115px;
          text-align: center;
        }

        .contador-acessos span {
          display: block;
          color: #64748b;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: .06em;
        }

        .contador-acessos strong {
          display: block;
          margin-top: 3px;
          color: #082e69;
          font-size: 21px;
        }

        .contador-acessos i {
          width: 1px;
          height: 35px;
          background: #dce5f0;
        }

        .contador-acessos.carregando {
          color: #94a3b8;
          font-size: 8px;
        }

        @media(max-width:760px) {
          .faixa-contador {
            align-items: stretch;
            flex-direction: column;
            gap: 14px;
            padding: 22px 16px;
          }

          .faixa-contador h2 {
            font-size: 17px;
          }

          .contador-acessos {
            width: 100%;
            justify-content: space-around;
            padding: 12px 8px;
          }

          .contador-acessos > div {
            min-width: 0;
            flex: 1;
          }

          .contador-acessos strong {
            font-size: 20px;
          }
        }
      `}</style>
          <ProdutosLojaSidebar />
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
    "JAN",
    "FEV",
    "MAR",
    "ABR",
    "MAI",
    "JUN",
    "JUL",
    "AGO",
    "SET",
    "OUT",
    "NOV",
    "DEZ",
  ];

  const indice =
    Number(
      data.split("-")[1]
    ) - 1;

  return meses[indice] || "";
}
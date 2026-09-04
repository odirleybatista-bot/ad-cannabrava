"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AberturaPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 6500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="splash">
      <div className="luz luz-1" />
      <div className="luz luz-2" />

      <div className="faixa faixa-azul" />
      <div className="faixa faixa-branca" />
      <div className="faixa faixa-verde" />

      <div className="particulas">
        {Array.from({ length: 16 }).map((_, index) => (
          <span
            key={index}
            style={{ "--i": index } as any}
          />
        ))}
      </div>

      <section className="conteudo">
        <div className="escudo-area">
          <div className="anel anel-1" />
          <div className="anel anel-2" />

          <img
            src="/escudo.png"
            alt="A.D. Cannabrava"
            className="escudo"
          />
        </div>

        <div className="nome-area">
          <span className="associacao">
            ASSOCIAÇÃO DESPORTIVA
          </span>

          <img
            src="/cannabrava-wordmark.png"
            alt="Cannabrava"
            className="wordmark"
          />

          <div className="divisor">
            <span />
            <i />
            <span />
          </div>

          <p className="lema">
            FORÇA • FOCO • UNIÃO
          </p>

          <small>
            Sistema Oficial de Gestão
          </small>
        </div>

        <div className="carregamento">
          <div className="barra">
            <span />
          </div>

          <div className="info">
            <span>Carregando sistema</span>
            <strong>2026</strong>
          </div>
        </div>
      </section>

      <div className="rodape">
        ASSOCIAÇÃO DESPORTIVA CANNABRAVA
      </div>

      <style jsx>{`
        .splash {
          position: fixed;
          inset: 0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(
              circle at center,
              #10458b 0%,
              #082f66 35%,
              #041c40 70%,
              #020d1d 100%
            );
          color: white;
        }

        .splash::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              120deg,
              transparent 25%,
              rgba(255,255,255,.06) 50%,
              transparent 75%
            );
          transform: translateX(-120%);
          animation: brilho 5s ease-in-out infinite;
        }

        .luz {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: .3;
        }

        .luz-1 {
          width: 450px;
          height: 450px;
          left: -130px;
          top: -150px;
          background: #168447;
          animation: moverLuz1 8s ease-in-out infinite alternate;
        }

        .luz-2 {
          width: 500px;
          height: 500px;
          right: -170px;
          bottom: -170px;
          background: #1763d6;
          animation: moverLuz2 10s ease-in-out infinite alternate;
        }

        .faixa {
          position: absolute;
          width: 140%;
          height: 75px;
          left: -20%;
          opacity: .12;
          transform: rotate(-8deg);
        }

        .faixa-azul {
          top: 12%;
          background: linear-gradient(
            90deg,
            transparent,
            #2e80ff,
            transparent
          );
          animation: faixaA 8s ease-in-out infinite alternate;
        }

        .faixa-branca {
          top: 47%;
          height: 38px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.8),
            transparent
          );
          animation: faixaB 10s ease-in-out infinite alternate;
        }

        .faixa-verde {
          bottom: 10%;
          background: linear-gradient(
            90deg,
            transparent,
            #25b962,
            transparent
          );
          animation: faixaC 9s ease-in-out infinite alternate;
        }

        .particulas {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .particulas span {
          position: absolute;
          left: calc((var(--i) * 6 + 4) * 1%);
          bottom: -10px;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(255,255,255,.7);
          box-shadow: 0 0 10px rgba(255,255,255,.5);
          animation:
            subir calc(8s + var(--i) * .4s)
            linear infinite;
          animation-delay:
            calc(var(--i) * -.7s);
        }

        .conteudo {
          position: relative;
          z-index: 5;
          width: min(94%, 760px);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .escudo-area {
          position: relative;
          width: 210px;
          height: 210px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 5px;
        }

        .escudo {
          width: 155px;
          height: 155px;
          object-fit: contain;
          z-index: 3;
          filter:
            drop-shadow(0 18px 26px rgba(0,0,0,.42))
            drop-shadow(0 0 12px rgba(255,255,255,.14));
          animation:
            entradaEscudo 1.4s cubic-bezier(.16,1,.3,1) both,
            flutuar 4s 1.4s ease-in-out infinite;
        }

        .anel {
          position: absolute;
          border: 1px solid rgba(255,255,255,.11);
          border-radius: 50%;
        }

        .anel-1 {
          inset: 8px;
          animation: girar 16s linear infinite;
        }

        .anel-2 {
          inset: 27px;
          animation: girarReverso 11s linear infinite;
        }

        .nome-area {
          width: 100%;
          animation: entradaNome 1s .5s ease both;
        }

        .associacao {
          display: block;
          margin-bottom: -4px;
          color: rgba(255,255,255,.78);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .32em;
        }

        .wordmark {
          display: block;
          width: min(620px, 92vw);
          height: auto;
          margin: 0 auto;
          object-fit: contain;
          filter:
            drop-shadow(0 10px 16px rgba(0,0,0,.35))
            drop-shadow(0 0 12px rgba(30,110,220,.3));
          animation:
            wordmarkEntrada 1.3s .55s
            cubic-bezier(.16,1,.3,1) both;
        }

        .divisor {
          width: 220px;
          display: grid;
          grid-template-columns: 1fr 7px 1fr;
          gap: 9px;
          align-items: center;
          margin: -4px auto 10px;
        }

        .divisor span {
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.4)
          );
        }

        .divisor span:last-child {
          transform: rotate(180deg);
        }

        .divisor i {
          width: 7px;
          height: 7px;
          background: #27bf68;
          transform: rotate(45deg);
          box-shadow: 0 0 10px #27bf68;
        }

        .lema {
          margin: 0;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .28em;
        }

        .nome-area small {
          display: block;
          margin-top: 8px;
          color: rgba(255,255,255,.48);
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .08em;
        }

        .carregamento {
          width: min(360px, 80%);
          margin-top: 30px;
          animation: entradaCarga .8s 1.1s ease both;
        }

        .barra {
          position: relative;
          height: 2px;
          overflow: hidden;
          border-radius: 10px;
          background: rgba(255,255,255,.12);
        }

        .barra span {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 0;
          background: linear-gradient(
            90deg,
            #1763d6,
            white,
            #168447
          );
          animation: carregar 5.5s .6s ease forwards;
        }

        .info {
          display: flex;
          justify-content: space-between;
          margin-top: 7px;
          color: rgba(255,255,255,.38);
          font-size: 7px;
          font-weight: 900;
        }

        .rodape {
          position: absolute;
          bottom: 20px;
          width: 100%;
          text-align: center;
          color: rgba(255,255,255,.2);
          font-size: 6px;
          font-weight: 900;
          letter-spacing: .23em;
        }

        @keyframes entradaEscudo {
          from {
            opacity: 0;
            transform: scale(.55) translateY(35px);
            filter: blur(10px);
          }

          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes flutuar {
          0%,100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes wordmarkEntrada {
          from {
            opacity: 0;
            transform: scale(.82) translateY(18px);
            filter: blur(9px);
          }

          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes entradaNome {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes entradaCarga {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes carregar {
          0% {
            width: 0;
          }
          35% {
            width: 42%;
          }
          70% {
            width: 76%;
          }
          100% {
            width: 100%;
          }
        }

        @keyframes girar {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes girarReverso {
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes subir {
          from {
            transform: translateY(0);
            opacity: 0;
          }

          15% {
            opacity: .65;
          }

          to {
            transform: translateY(-105vh);
            opacity: 0;
          }
        }

        @keyframes brilho {
          0%, 25% {
            transform: translateX(-120%);
          }
          70%, 100% {
            transform: translateX(120%);
          }
        }

        @keyframes moverLuz1 {
          to {
            transform: translate(70px, 40px);
          }
        }

        @keyframes moverLuz2 {
          to {
            transform: translate(-60px, -35px);
          }
        }

        @keyframes faixaA {
          to {
            transform: translateX(7%) rotate(-5deg);
          }
        }

        @keyframes faixaB {
          to {
            transform: translateX(-7%) rotate(-10deg);
          }
        }

        @keyframes faixaC {
          to {
            transform: translateX(6%) rotate(-11deg);
          }
        }

        @media (max-width: 700px) {
          .escudo-area {
            width: 165px;
            height: 165px;
          }

          .escudo {
            width: 125px;
            height: 125px;
          }

          .associacao {
            font-size: 8px;
            letter-spacing: .22em;
          }

          .wordmark {
            width: 94vw;
          }

          .lema {
            font-size: 7.5px;
            letter-spacing: .2em;
          }
        }
      `}</style>
    </main>
  );
}
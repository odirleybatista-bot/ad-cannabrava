"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      const supabase = createClient();

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: senha,
        });

      if (loginError) {
        setErro(
          loginError.message.toLowerCase().includes("invalid")
            ? "E-mail ou senha inválidos."
            : loginError.message
        );

        setCarregando(false);
        return;
      }

      const { data: acesso, error: acessoError } =
        await supabase.rpc("meu_acesso");

      if (acessoError) {
        console.error("Erro ao consultar acesso:", acessoError);

        setErro(
          "Acesso autenticado, mas não foi possível identificar o perfil do usuário."
        );

        setCarregando(false);
        return;
      }

      const registro = Array.isArray(acesso)
        ? acesso[0]
        : acesso;

      const perfisRaw =
        registro?.perfis ?? [];

      const perfis: string[] = Array.isArray(perfisRaw)
        ? perfisRaw.map((item: unknown) => {
            if (typeof item === "string") {
              return item.toLowerCase();
            }

            if (
              item &&
              typeof item === "object" &&
              "nome" in item
            ) {
              return String(
                (item as { nome: unknown }).nome
              ).toLowerCase();
            }

            return "";
          })
        : [String(perfisRaw).toLowerCase()];

      const ehAdministrativo = perfis.some((perfil) =>
        [
          "administrador",
          "diretoria",
          "comissão técnica",
          "comissao tecnica",
        ].includes(perfil)
      );

      const ehAtleta =
        perfis.includes("atleta");

      if (ehAdministrativo) {
        router.replace("/admin");
        router.refresh();
        return;
      }

      if (ehAtleta) {
        if (registro?.atleta_id) {
          router.replace("/portal-atleta");
        } else {
          router.replace("/portal-atleta/dados");
        }

        router.refresh();
        return;
      }

      setErro(
        "Seu usuário está autenticado, mas ainda não possui um perfil de acesso válido."
      );

      setCarregando(false);
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível concluir o acesso. Tente novamente."
      );

      setCarregando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <img
          src="/auth/login.png"
          alt="A.D. Cannabrava"
          className="login-background"
        />
      </section>

      <section className="login-area">
        <div className="login-box">
          <div className="login-title">
            <img
              src="/branding/escudo.png"
              alt="A.D. Cannabrava"
              className="login-logo"
            />

            <h1>A.D. CANNABRAVA</h1>

            <p>
              Área de acesso ao sistema
            </p>
          </div>

          <form
            onSubmit={entrar}
            className="login-form"
          >
            {erro && (
              <div className="login-error">
                {erro}
              </div>
            )}

            <label>
              E-mail

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                required
              />
            </label>

            <label>
              Senha

              <input
                type="password"
                value={senha}
                onChange={(event) =>
                  setSenha(event.target.value)
                }
                autoComplete="current-password"
                required
              />
            </label>

            <button
              type="submit"
              disabled={carregando}
              className="login-button"
            >
              {carregando
                ? "Entrando..."
                : "Entrar"}
            </button>
          </form>

          <div className="novo-acesso">
            <strong>
              Ainda não possui acesso?
            </strong>

            <span>
              Atletas podem criar o próprio acesso ao portal.
            </span>

            <a href="/cadastro">
              Criar meu acesso
            </a>
          </div>

          <footer>
            <span>
              Associação Desportiva Cannabrava
            </span>

            <span>
              Sistema Oficial de Gestão
            </span>
          </footer>
        </div>
      </section>

      <style jsx>{`
        .login-page {
          width: 100%;
          min-height: 100dvh;
          display: grid;

          /*
            Agora somente duas áreas:
            imagem e login.
          */
          grid-template-columns:
            minmax(0, 64%)
            minmax(420px, 36%);

          overflow-x: hidden;
          background: #ffffff;
        }

        .login-visual {
          position: relative;
          height: 100dvh;
          overflow-x: hidden;
          background: #ffffff;
        }

        .login-background {
          width: 100%;
          height: 100%;

          /*
            Mantém toda a imagem visível.
          */
          object-fit: contain;
          object-position: center center;

          display: block;
          background: #ffffff;
        }

        .login-area {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;

          background: #ffffff;

          padding:
            32px 48px;
        }

        .login-box {
          width: 100%;
          max-width: 440px;
        }

        .login-title {
          margin-bottom: 28px;
        }

        .login-logo {
          width: 58px;
          height: 58px;

          object-fit: contain;

          margin-bottom: 13px;
        }

        .login-title h1 {
          margin: 0;

          color: #082f6b;

          font-size: 29px;
          line-height: 1.05;

          font-weight: 800;

          letter-spacing:
            0.02em;
        }

        .login-title p {
          margin:
            7px 0 0;

          color:
            #60708a;

          font-size:
            15px;
        }

        .login-form {
          display: flex;
          flex-direction: column;

          gap: 17px;
        }

        .login-form label {
          display: flex;
          flex-direction: column;

          gap: 7px;

          color:
            #12243d;

          font-size:
            13px;

          font-weight:
            700;
        }

        .login-form input {
          width: 100%;

          box-sizing:
            border-box;

          height: 48px;

          border:
            1px solid #bfd0e8;

          border-radius:
            11px;

          background:
            #edf4ff;

          padding:
            0 15px;

          color:
            #10233f;

          font-size:
            14px;

          outline: none;

          transition:
            0.2s;
        }

        .login-form input:focus {
          border-color:
            #0b3978;

          box-shadow:
            0 0 0 3px
            rgba(
              11,
              57,
              120,
              0.08
            );
        }

        .login-button {
          height: 48px;

          border: 0;

          border-radius:
            11px;

          background:
            #092f6c;

          color:
            #ffffff;

          font-size:
            14px;

          font-weight:
            700;

          cursor:
            pointer;

          transition:
            0.2s;
        }

        .login-button:hover {
          background:
            #072657;
        }

        .login-button:disabled {
          opacity:
            0.65;

          cursor:
            wait;
        }

        .login-error {
          border:
            1px solid #fecaca;

          border-radius:
            10px;

          background:
            #fff1f2;

          color:
            #b91c1c;

          padding:
            11px 13px;

          font-size:
            13px;
        }

        .novo-acesso {
          margin-top:
            22px;

          padding:
            18px;

          border:
            1px solid #d7e4f5;

          border-radius:
            12px;

          background:
            #f2f7ff;

          text-align:
            center;

          display:
            flex;

          flex-direction:
            column;

          align-items:
            center;

          gap:
            5px;
        }

        .novo-acesso strong {
          color:
            #12243d;

          font-size:
            14px;
        }

        .novo-acesso span {
          color:
            #62718a;

          font-size:
            12px;
        }

        .novo-acesso a {
          margin-top:
            8px;

          padding:
            9px 18px;

          border:
            1px solid #0a3776;

          border-radius:
            9px;

          color:
            #092f6c;

          background:
            #ffffff;

          font-size:
            13px;

          font-weight:
            700;

          text-decoration:
            none;
        }

        footer {
          border-top:
            1px solid #dce5f1;

          margin-top:
            24px;

          padding-top:
            18px;

          text-align:
            center;

          display:
            flex;

          flex-direction:
            column;

          gap:
            4px;

          color:
            #8595ad;

          font-size:
            11px;
        }

        @media (
          max-width: 1200px
        ) {
          .login-page {
            grid-template-columns:
              minmax(0, 58%)
              minmax(400px, 42%);
          }

          .login-area {
            padding:
              30px;
          }
        }

        @media (
          max-width: 900px
        ) {
          .login-page {
            grid-template-columns:
              48% 52%;
          }

          .login-background {
            object-fit:
              cover;

            object-position:
              35% center;
          }
        }

        @media (
          max-width: 700px
        ) {
          .login-page {
            display:
              block;

            overflow-y:
              auto;
          }

          .login-visual {
            height:
              260px;
          }

          .login-background {
            object-fit:
              cover;

            object-position:
              center 40%;
          }

          .login-area {
            min-height:
              calc(
                100vh - 260px
              );

            padding:
              28px 22px;

            align-items:
              flex-start;
          }

          .login-title {
            text-align:
              center;
          }

          .login-logo {
            margin-left:
              auto;

            margin-right:
              auto;
          }

          .login-title h1 {
            font-size:
              24px;
          }
        }
      `}</style>
    </main>
  );
}
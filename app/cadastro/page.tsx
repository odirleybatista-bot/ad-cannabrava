"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { criarAcesso } from "./actions";

export default function CadastroPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] =
    useState("");

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");
    setMensagem("");
    setCarregando(true);

    const formData = new FormData();

    formData.set("nome", nome);
    formData.set("email", email);
    formData.set("senha", senha);
    formData.set(
      "confirmar_senha",
      confirmarSenha
    );

    try {
      const resultado =
        await criarAcesso(formData);

      if (!resultado?.sucesso) {
        setErro(
          resultado?.mensagem ||
            "Não foi possível criar o acesso."
        );

        setCarregando(false);
        return;
      }

      if (resultado.confirmarEmail) {
        setMensagem(
          resultado.mensagem ||
            "Acesso criado. Verifique seu e-mail."
        );

        setCarregando(false);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível concluir o cadastro."
      );

      setCarregando(false);
    }
  }

  return (
    <main className="cadastro-page">
      <section className="cadastro-visual">
        <img
          src="/auth/login.png"
          alt="A.D. Cannabrava"
          className="cadastro-background"
        />
      </section>

      <section className="cadastro-area">
        <div className="cadastro-box">
          <div className="cadastro-title">
            <img
              src="/branding/escudo.png"
              alt="A.D. Cannabrava"
              className="cadastro-logo"
            />

            <h1>Criar meu acesso</h1>

            <h2>Portal do Atleta</h2>

            <p>
              Crie seu acesso para iniciar seu cadastro
              como atleta da Associação Desportiva
              Cannabrava.
            </p>
          </div>

          <form
            onSubmit={enviar}
            className="cadastro-form"
          >
            {erro && (
              <div className="cadastro-error">
                {erro}
              </div>
            )}

            {mensagem && (
              <div className="cadastro-success">
                {mensagem}
              </div>
            )}

            <label>
              Nome completo

              <input
                type="text"
                value={nome}
                onChange={(event) =>
                  setNome(event.target.value)
                }
                placeholder="Seu nome completo"
                required
              />
            </label>

            <label>
              E-mail

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="seuemail@exemplo.com"
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
                placeholder="Mínimo de 6 caracteres"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>

            <label>
              Confirmar senha

              <input
                type="password"
                value={confirmarSenha}
                onChange={(event) =>
                  setConfirmarSenha(
                    event.target.value
                  )
                }
                placeholder="Digite novamente"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>

            <button
              type="submit"
              disabled={carregando}
              className="cadastro-button"
            >
              {carregando
                ? "Criando acesso..."
                : "Criar meu acesso"}
            </button>
          </form>

          <div className="voltar-login">
            <span>
              Já possui acesso?
            </span>

            <a href="/login">
              Entrar no sistema
            </a>
          </div>
        </div>
      </section>

      <style jsx>{`
        .cadastro-page {
          width: 100%;
          min-height: 100dvh;

          display: grid;

          grid-template-columns:
            minmax(0, 62%)
            minmax(430px, 38%);

          background: #ffffff;

          overflow-x: hidden;
        }

        .cadastro-visual {
          height: 100dvh;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow-x: hidden;

          background: #ffffff;
        }

        .cadastro-background {
          width: 100%;
          height: 100%;

          object-fit: contain;
          object-position: center center;

          display: block;
        }

        .cadastro-area {
          min-height: 100dvh;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 24px 44px;

          background: #ffffff;

          overflow-y: auto;
        }

        .cadastro-box {
          width: 100%;
          max-width: 470px;
        }

        .cadastro-title {
          margin-bottom: 22px;
        }

        .cadastro-logo {
          width: 58px;
          height: 58px;

          object-fit: contain;

          margin-bottom: 11px;
        }

        .cadastro-title h1 {
          margin: 0;

          color: #082f6b;

          font-size: 30px;
          line-height: 1.1;

          font-weight: 800;
        }

        .cadastro-title h2 {
          margin: 7px 0 0;

          color: #60708a;

          font-size: 16px;
          font-weight: 500;
        }

        .cadastro-title p {
          margin: 15px 0 0;

          color: #60708a;

          font-size: 14px;
          line-height: 1.5;
        }

        .cadastro-form {
          display: flex;
          flex-direction: column;

          gap: 14px;
        }

        .cadastro-form label {
          display: flex;
          flex-direction: column;

          gap: 6px;

          color: #12243d;

          font-size: 13px;
          font-weight: 700;
        }

        .cadastro-form input {
          width: 100%;

          box-sizing: border-box;

          height: 48px;

          border:
            1px solid #bfd0e8;

          border-radius: 11px;

          background: #ffffff;

          padding:
            0 15px;

          color: #10233f;

          font-size: 14px;

          outline: none;

          transition: 0.2s;
        }

        .cadastro-form input:focus {
          border-color: #0b3978;

          box-shadow:
            0 0 0 3px
            rgba(11, 57, 120, 0.08);
        }

        .cadastro-button {
          height: 48px;

          margin-top: 4px;

          border: 0;

          border-radius: 11px;

          background: #092f6c;

          color: #ffffff;

          font-size: 14px;
          font-weight: 700;

          cursor: pointer;
        }

        .cadastro-button:hover {
          background: #072657;
        }

        .cadastro-button:disabled {
          opacity: 0.65;

          cursor: wait;
        }

        .cadastro-error {
          padding: 11px 13px;

          border:
            1px solid #fecaca;

          border-radius: 10px;

          background: #fff1f2;

          color: #b91c1c;

          font-size: 13px;
        }

        .cadastro-success {
          padding: 11px 13px;

          border:
            1px solid #bbf7d0;

          border-radius: 10px;

          background: #f0fdf4;

          color: #166534;

          font-size: 13px;
        }

        .voltar-login {
          margin-top: 18px;

          padding-top: 14px;

          border-top:
            1px solid #dce5f1;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 7px;

          color: #64748b;

          font-size: 12px;
        }

        .voltar-login a {
          color: #082f6b;

          font-weight: 800;

          text-decoration: none;
        }

        .voltar-login a:hover {
          text-decoration: underline;
        }

        @media (max-width: 1200px) {
          .cadastro-page {
            grid-template-columns:
              minmax(0, 56%)
              minmax(430px, 44%);
          }

          .cadastro-area {
            padding: 24px 30px;
          }
        }

        @media (max-width: 900px) {
          .cadastro-page {
            grid-template-columns:
              45% 55%;
          }

          .cadastro-background {
            object-fit: cover;

            object-position: 35% center;
          }
        }

        @media (max-width: 700px) {
          .cadastro-page {
            display: block;
            width: 100%;
            min-height: 100dvh;
            overflow-x: hidden;
            overflow-y: auto;
          }

          .cadastro-visual {
            width: 100%;
            height: 210px;
            min-height: 210px;
          }

          .cadastro-background {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center 38%;
          }

          .cadastro-area {
            width: 100%;
            min-height: calc(100dvh - 210px);
            padding: 22px 18px 30px;
            align-items: flex-start;
          }

          .cadastro-box {
            width: 100%;
            max-width: 100%;
          }

          .cadastro-title {
            text-align: center;
            margin-bottom: 20px;
          }

          .cadastro-logo {
            margin-left: auto;
            margin-right: auto;
          }

          .cadastro-title h1 {
            font-size: 25px;
          }

          .cadastro-form input,
          .cadastro-form button {
            font-size: 16px;
          }
        }
      `}</style>
    </main>
  );
}
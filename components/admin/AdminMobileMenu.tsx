"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminMobileMenu({
  nome,
}: {
  nome: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const router = useRouter();

  async function sair() {
    setSaindo(true);

    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/portalcannabrava");
    router.refresh();
  }

  function fechar() {
    setAberto(false);
  }

  return (
    <div className="mobile">
      <button
        className="botao-menu"
        type="button"
        onClick={() => setAberto(!aberto)}
        aria-label="Abrir menu"
      >
        <span />
        <span />
        <span />
      </button>

      {aberto && (
        <div className="painel">
          <div className="usuario">
            <strong>{nome}</strong>
            <span>Área Administrativa</span>
          </div>

          <nav>
            <Link href="/admin" onClick={fechar}>
              Dashboard
            </Link>

            <strong className="secao">
              GESTÃO ESPORTIVA
            </strong>

            <Link
              href="/admin/esportivo/atletas"
              onClick={fechar}
            >
              Atletas
            </Link>

            <Link
              href="/admin/esportivo/comissao-tecnica"
              onClick={fechar}
            >
              Comissão Técnica
            </Link>

            <Link
              href="/admin/esportivo/competicoes"
              onClick={fechar}
            >
              Competições
            </Link>

            <Link
              href="/admin/esportivo/partidas"
              onClick={fechar}
            >
              Partidas
            </Link>

            <Link
              href="/admin/esportivo/convocacoes"
              onClick={fechar}
            >
              Convocações
            </Link>

            <Link
              href="/admin/esportivo/estatisticas"
              onClick={fechar}
            >
              Estatísticas
            </Link>

            <strong className="secao">
              GESTÃO FINANCEIRA
            </strong>

            <Link
              href="/admin/financeiro"
              onClick={fechar}
            >
              Financeiro
            </Link>

            <Link
              href="/admin/financeiro/patrocinadores"
              onClick={fechar}
            >
              Patrocinadores
            </Link>

            <strong className="secao">
              RELATÓRIOS
            </strong>

            <Link
              href="/admin/relatorios/esportivo"
              onClick={fechar}
            >
              Relatórios Esportivos
            </Link>

            <Link
              href="/admin/auditoria"
              onClick={fechar}
            >
              Auditoria
            </Link>

            <Link
              href="/admin/configuracoes"
              onClick={fechar}
            >
              Configurações
            </Link>
          </nav>

          <button
            className="sair"
            type="button"
            onClick={sair}
            disabled={saindo}
          >
            {saindo ? "Saindo..." : "Sair"}
          </button>
        </div>
      )}

      <style jsx>{`
        .mobile {
          display: none;
          margin-left: auto;
        }

        .botao-menu {
          width: 40px;
          height: 40px;
          padding: 9px;
          border: 1px solid rgba(255,255,255,.18);
          border-radius: 9px;
          background: rgba(255,255,255,.08);
        }

        .botao-menu span {
          display: block;
          width: 100%;
          height: 2px;
          margin: 4px 0;
          border-radius: 3px;
          background: white;
        }

        .painel {
          position: absolute;
          top: 62px;
          left: 0;
          right: 0;
          max-height: calc(100vh - 62px);
          overflow-y: auto;
          padding: 12px;
          background: #062758;
          border-top: 1px solid rgba(255,255,255,.08);
          box-shadow: 0 16px 35px rgba(0,0,0,.22);
        }

        .usuario {
          padding: 10px 8px 13px;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }

        .usuario strong {
          display: block;
          color: white;
          font-size: 10px;
        }

        .usuario span {
          display: block;
          margin-top: 2px;
          color: rgba(255,255,255,.6);
          font-size: 8px;
        }

        nav {
          padding: 6px 0;
        }

        nav a {
          min-height: 43px;
          display: flex;
          align-items: center;
          padding: 0 10px;
          border-radius: 8px;
          color: rgba(255,255,255,.8);
          font-size: 10px;
          font-weight: 750;
          text-decoration: none;
        }

        nav a:hover {
          background: rgba(255,255,255,.08);
          color: white;
        }

        .secao {
          display: block;
          padding: 13px 10px 5px;
          color: #5fd28c;
          font-size: 7px;
          letter-spacing: .08em;
        }

        .sair {
          width: 100%;
          min-height: 43px;
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 8px;
          background: rgba(255,255,255,.06);
          color: white;
          font-size: 9px;
          font-weight: 800;
        }

        @media (max-width: 1050px) {
          .mobile {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}
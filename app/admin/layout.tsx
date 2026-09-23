import PedidoLojaNotificacao from "@/components/admin/PedidoLojaNotificacao";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getCurrentUser();

  if (!usuario) {
    redirect("/portalcannabrava");
  }

  const inicial =
    (usuario.nome || "Administrador")
      .trim()
      .charAt(0)
      .toUpperCase();

  return (
    <div className="estrutura-admin">
      <header className="cabecalho-admin">
        <div className="cabecalho-superior">
          <Link
            href="/admin"
            className="marca"
          >
            <img
              src="/branding/escudo.png"
              alt="A.D. Cannabrava"
            />

            <div className="marca-texto">
              <strong>
                A.D. CANNABRAVA
              </strong>

              <span>
                Sistema de Gestão
              </span>
            </div>
          </Link>

          <div className="usuario">
            <div className="usuario-info">
              <strong>
                Área Restrita
              </strong>

              <span>
                {usuario.nome ||
                  "Administrador"}
              </span>
            </div>

            <div className="avatar">
              {inicial}
            </div>

            <PedidoLojaNotificacao />

            <AdminLogoutButton />
          </div>
        </div>

        <nav className="menu-desktop">
          <Link href="/admin">
            Dashboard
          </Link>

          <div className="grupo">
            <button type="button">
              Gestão Administrativa
              <span>▼</span>
            </button>

            <div className="submenu">
              <Link href="/admin/administrativo/diretoria">
                Diretoria
              </Link>

              <Link href="/admin/administrativo/associados">
                Associados
              </Link>

              <Link href="/admin/administrativo/assembleias">
                Assembleias e Atas
              </Link>

              <Link href="/admin/administrativo/documentos">
                Documentos Institucionais
              </Link>

              <Link href="/admin/administrativo/patrimonio">
                Patrimônio e Materiais
              </Link>
            </div>
          </div>

          <div className="grupo">
            <button type="button">
              Gestão Esportiva
              <span>▼</span>
            </button>

            <div className="submenu">
              <Link href="/admin/esportivo/atletas">
                Atletas
              </Link>

              <Link href="/admin/esportivo/comissao-tecnica">
                Comissão Técnica
              </Link>

              <Link href="/admin/esportivo/competicoes">
                Competições
              </Link>

              <Link href="/admin/esportivo/partidas">
                Partidas
              </Link>

              <Link href="/admin/esportivo/convocacoes">
                Convocações
              </Link>

              <Link href="/admin/esportivo/estatisticas">
                Estatísticas
              </Link>
            </div>
          </div>

          <div className="grupo">
            <button type="button">
              Gestão Financeira
              <span>▼</span>
            </button>

            <div className="submenu">
              <Link href="/admin/financeiro">
                Visão Geral
              </Link>

              <Link href="/admin/financeiro/patrocinadores">
                Patrocinadores
              </Link>

              <Link href="/admin/financeiro/contas-pagar">
                Contas a Pagar
              </Link>

              <Link href="/admin/financeiro/contas-receber">
                Contas a Receber
              </Link>
            </div>
          </div>

          <div className="grupo">
            <button type="button">
              Relatórios
              <span>▼</span>
            </button>

            <div className="submenu">
              <Link href="/admin/relatorios/esportivo">
                Esportivo
              </Link>

              <Link href="/admin/relatorios/financeiro">
                Financeiro
              </Link>
            </div>
          </div>
          <div className="grupo">
            <button type="button">
              Loja Cannabrava
              <span>▼</span>
            </button>

            <div className="submenu">
              <Link href="/admin/loja">
                Produtos
              </Link>

              <Link href="/admin/loja/pedidos">
                Pedidos
              </Link>

              <Link
                href="/portalcannabrava/loja"
                target="_blank"
              >
                Loja Pública
              </Link>
            </div>
          </div>

          <Link href="/admin/auditoria">
            Auditoria
          </Link>

          <div className="grupo">
            <button type="button">
              Configurações
              <span>▼</span>
            </button>

            <div className="submenu">
              <Link href="/admin/configuracoes">
                Geral
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="conteudo-admin">
        {children}
      </main>

      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          width: 100%;
          max-width: 100%;
          margin: 0;
          overflow-x: hidden;
        }

        .estrutura-admin {
          width: 100%;
          max-width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          background: #f5f8fc;
        }

        .cabecalho-admin {
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
          background: #ffffff;
          box-shadow:
            0 1px 7px
            rgba(8, 46, 105, .08);
        }

        .cabecalho-superior {
          width: 100%;
          min-height: 86px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 0 22px;
        }

        .marca {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #082e69;
          text-decoration: none;
        }

        .marca img {
          flex: 0 0 auto;
          width: 58px;
          height: 58px;
          object-fit: contain;
        }

        .marca-texto {
          min-width: 0;
        }

        .marca-texto strong {
          display: block;
          color: #082e69;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: .02em;
          white-space: nowrap;
        }

        .marca-texto span {
          display: block;
          margin-top: 3px;
          color: #64748b;
          font-size: 11px;
        }

        .usuario {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .usuario-info {
          text-align: right;
        }

        .usuario-info strong {
          display: block;
          color: #082e69;
          font-size: 10px;
        }

        .usuario-info span {
          display: block;
          max-width: 150px;
          margin-top: 2px;
          overflow: hidden;
          color: #64748b;
          font-size: 9px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .avatar {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #082e69;
          color: #ffffff;
          font-size: 14px;
          font-weight: 900;
        }

        .menu-desktop {
          width: 100%;
          min-height: 66px;
          display: flex;
          align-items: stretch;
          gap: 4px;
          padding: 0 22px;
          background: #082e69;
        }

        .menu-desktop > a,
        .grupo > button {
          min-height: 66px;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 11px;
          border: 0;
          background: transparent;
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
          text-decoration: none;
          cursor: pointer;
        }

        .grupo {
          position: relative;
        }

        .grupo > button span {
          font-size: 8px;
          opacity: .8;
        }

        .grupo:hover > button,
        .menu-desktop > a:hover {
          background:
            rgba(255,255,255,.08);
        }

        .submenu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          min-width: 220px;
          padding: 7px;
          border: 1px solid #e2e8f0;
          border-radius: 0 0 10px 10px;
          background: #ffffff;
          box-shadow:
            0 12px 30px
            rgba(0,0,0,.15);
        }

        .grupo:hover .submenu {
          display: block;
        }

        .submenu a {
          display: block;
          padding: 9px 10px;
          border-radius: 7px;
          color: #334155;
          font-size: 9px;
          font-weight: 700;
          text-decoration: none;
        }

        .submenu a:hover {
          background: #f1f5f9;
          color: #082e69;
        }

        .conteudo-admin {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          overflow-x: hidden;
        }

        @media (max-width: 1050px) {
          .cabecalho-superior {
            min-height: 62px;
            gap: 8px;
            padding: 0 12px;
          }

          .marca {
            gap: 8px;
          }

          .marca img {
            width: 42px;
            height: 42px;
          }

          .marca-texto strong {
            max-width: 220px;
            overflow: hidden;
            font-size: 12px;
            text-overflow: ellipsis;
          }

          .marca-texto span {
            font-size: 8px;
          }

          .menu-desktop {
            display: none;
          }

          .usuario-info,
          .avatar {
            display: none;
          }

          .usuario {
            margin-left: auto;
          }
        }

        @media (max-width: 430px) {
          .cabecalho-superior {
            min-height: 60px;
            padding: 0 9px;
          }

          .marca img {
            width: 38px;
            height: 38px;
          }

          .marca-texto strong {
            max-width: 190px;
            font-size: 11px;
          }

          .marca-texto span {
            font-size: 7px;
          }
        }

        @media (max-width: 360px) {
          .marca-texto strong {
            max-width: 155px;
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}
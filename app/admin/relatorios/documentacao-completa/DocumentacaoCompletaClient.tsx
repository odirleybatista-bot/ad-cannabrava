"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Documento = {
  tipo: string;
  status: string | null;
};

type Atleta = {
  id: string;
  nome: string;
  apelido: string | null;
  cpf: string | null;
  modalidade: string | null;
  posicao: string | null;
  status: string | null;
  atleta_documentos?: Documento[] | null;
};

const DOCUMENTOS = [
  "identidade",
  "residencia",
  "eleitoral",
];

function documentacaoCompleta(
  atleta: Atleta
) {
  return DOCUMENTOS.every(
    (tipo) =>
      atleta.atleta_documentos?.some(
        (documento) =>
          documento.tipo === tipo &&
          documento.status === "aprovado"
      )
  );
}

function statusLabel(
  status: string | null
) {
  const mapa: Record<string, string> = {
    pre_cadastro: "Pré-cadastro",
    documentos_enviados: "Documentos enviados",
    em_analise: "Em análise",
    aprovado: "Aprovado",
    vinculado: "Vinculado",
    termo_liberado: "Termo liberado",
    ativo: "Ativo",
    suspenso: "Suspenso",
    inativo: "Inativo",
  };

  return mapa[status || ""] ||
    status ||
    "Pendente";
}

export default function DocumentacaoCompletaClient({
  atletas,
}: {
  atletas: Atleta[];
}) {
  const router = useRouter();

  const [selecionados, setSelecionados] =
    useState<string[]>([]);

  const [busca, setBusca] =
    useState("");

  const [somenteCompletos, setSomenteCompletos] =
    useState(false);

  const atletasFiltrados =
    useMemo(() => {
      const texto =
        busca.trim().toLowerCase();

      return atletas.filter(
        (atleta) => {
          const buscaOk =
            !texto ||
            atleta.nome
              .toLowerCase()
              .includes(texto) ||
            atleta.apelido
              ?.toLowerCase()
              .includes(texto) ||
            atleta.cpf
              ?.toLowerCase()
              .includes(texto);

          const docsOk =
            !somenteCompletos ||
            documentacaoCompleta(atleta);

          return buscaOk && docsOk;
        }
      );
    }, [
      atletas,
      busca,
      somenteCompletos,
    ]);

  function alternar(
    id: string
  ) {
    setSelecionados(
      (lista) =>
        lista.includes(id)
          ? lista.filter(
              (item) =>
                item !== id
            )
          : [...lista, id]
    );
  }

  function selecionarTodos() {
    setSelecionados(
      (listaAtual) => {
        const conjunto =
          new Set(listaAtual);

        atletasFiltrados.forEach(
          (atleta) =>
            conjunto.add(
              atleta.id
            )
        );

        return Array.from(
          conjunto
        );
      }
    );
  }

  function limpar() {
    setSelecionados([]);
  }

  function gerar() {
    if (
      selecionados.length === 0
    ) {
      alert(
        "Selecione pelo menos um atleta."
      );

      return;
    }

    const ids =
      selecionados.join(",");

    router.push(
      `/admin/relatorios/documentacao-completa/imprimir?ids=${encodeURIComponent(ids)}`
    );
  }

  const completos =
    atletas.filter(
      documentacaoCompleta
    ).length;

  return (
    <main className="pagina">
      <section className="topo">
        <div>
          <span className="secao">
            RELATÓRIOS
          </span>

          <h1>
            Documentação Completa
          </h1>

          <p>
            Selecione os atletas que
            deverão compor o relatório.
          </p>
        </div>

        <button
          type="button"
          className="gerar"
          onClick={gerar}
          disabled={
            selecionados.length === 0
          }
        >
          Gerar relatório
        </button>
      </section>

      <section className="indicadores">
        <div className="indicador">
          <span>
            ATLETAS
          </span>

          <strong>
            {atletas.length}
          </strong>

          <small>
            cadastrados
          </small>
        </div>

        <div className="indicador completo">
          <span>
            DOCUMENTAÇÃO COMPLETA
          </span>

          <strong>
            {completos}
          </strong>

          <small>
            três documentos aprovados
          </small>
        </div>

        <div className="indicador selecionado">
          <span>
            SELECIONADOS
          </span>

          <strong>
            {selecionados.length}
          </strong>

          <small>
            entrarão no relatório
          </small>
        </div>
      </section>

      <section className="painel">
        <div className="filtros">
          <div className="campo">
            <label>
              Buscar atleta
            </label>

            <input
              value={busca}
              onChange={(event) =>
                setBusca(
                  event.target.value
                )
              }
              placeholder="Nome, apelido ou CPF"
            />
          </div>

          <label className="checkbox-filtro">
            <input
              type="checkbox"
              checked={
                somenteCompletos
              }
              onChange={(event) =>
                setSomenteCompletos(
                  event.target.checked
                )
              }
            />

            <span>
              Somente documentação completa
            </span>
          </label>

          <div className="acoes">
            <button
              type="button"
              onClick={
                selecionarTodos
              }
            >
              Selecionar todos
            </button>

            <button
              type="button"
              className="secundario"
              onClick={limpar}
            >
              Limpar seleção
            </button>
          </div>
        </div>

        <div className="cabecalho-lista">
          <div />
          <span>ATLETA</span>
          <span>POSIÇÃO</span>
          <span>MODALIDADE</span>
          <span>DOCUMENTAÇÃO</span>
          <span>SITUAÇÃO</span>
        </div>

        {atletasFiltrados.map(
          (atleta) => {
            const completo =
              documentacaoCompleta(
                atleta
              );

            const marcado =
              selecionados.includes(
                atleta.id
              );

            return (
              <label
                key={atleta.id}
                className={`linha ${
                  marcado
                    ? "marcado"
                    : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={
                    marcado
                  }
                  onChange={() =>
                    alternar(
                      atleta.id
                    )
                  }
                />

                <div className="atleta">
                  <strong>
                    {atleta.nome}
                  </strong>

                  <small>
                    {atleta.apelido ||
                      atleta.cpf ||
                      "—"}
                  </small>
                </div>

                <span>
                  {atleta.posicao ||
                    "—"}
                </span>

                <span>
                  {atleta.modalidade ||
                    "Futebol"}
                </span>

                <span
                  className={`badge ${
                    completo
                      ? "ok"
                      : "pendente"
                  }`}
                >
                  {completo
                    ? "Completa"
                    : "Incompleta"}
                </span>

                <span className="status">
                  {statusLabel(
                    atleta.status
                  )}
                </span>
              </label>
            );
          }
        )}
      </section>

      <style jsx>{`
        .pagina {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 22px 26px 40px;
        }

        .topo {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 15px;
        }

        .secao {
          color: #168447;
          font-size: 8px;
          font-weight: 900;
        }

        h1 {
          margin: 3px 0;
          color: #082e69;
          font-size: 28px;
        }

        .topo p {
          margin: 0;
          color: #64748b;
          font-size: 10px;
        }

        .gerar {
          min-height: 42px;
          padding: 0 17px;
          border: 0;
          border-radius: 9px;
          background: #082e69;
          color: white;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
        }

        .gerar:disabled {
          opacity: .45;
        }

        .indicadores {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 9px;
          margin-bottom: 11px;
        }

        .indicador {
          padding: 13px 15px;
          border: 1px solid #dce5f0;
          border-radius: 11px;
          background: white;
        }

        .indicador span {
          display: block;
          color: #64748b;
          font-size: 7px;
          font-weight: 900;
        }

        .indicador strong {
          display: block;
          margin-top: 6px;
          color: #082e69;
          font-size: 22px;
        }

        .indicador small {
          color: #94a3b8;
          font-size: 8px;
        }

        .completo {
          border-left: 3px solid #168447;
        }

        .selecionado {
          border-left: 3px solid #1763d6;
        }

        .painel {
          overflow: hidden;
          border: 1px solid #dce5f0;
          border-radius: 12px;
          background: white;
        }

        .filtros {
          display: grid;
          grid-template-columns:
            minmax(250px, 1fr)
            auto
            auto;
          gap: 14px;
          align-items: end;
          padding: 13px 15px;
          background: #f8fafc;
        }

        .campo label {
          display: block;
          margin-bottom: 4px;
          color: #64748b;
          font-size: 7px;
          font-weight: 900;
        }

        .campo input {
          width: 100%;
          height: 38px;
          padding: 0 10px;
          border: 1px solid #d6e0eb;
          border-radius: 8px;
        }

        .checkbox-filtro {
          min-height: 38px;
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 8px;
          font-weight: 800;
        }

        .acoes {
          display: flex;
          gap: 7px;
        }

        .acoes button {
          min-height: 38px;
          padding: 0 12px;
          border: 0;
          border-radius: 8px;
          background: #082e69;
          color: white;
          font-size: 8px;
          font-weight: 900;
          cursor: pointer;
        }

        .acoes .secundario {
          border: 1px solid #d6e0eb;
          background: white;
          color: #64748b;
        }

        .cabecalho-lista,
        .linha {
          display: grid;
          grid-template-columns:
            40px
            minmax(250px, 1.5fr)
            130px
            130px
            130px
            140px;
          gap: 10px;
          align-items: center;
        }

        .cabecalho-lista {
          min-height: 35px;
          padding: 0 15px;
          background: #fbfcfd;
          color: #8795a8;
          font-size: 6.5px;
          font-weight: 900;
        }

        .linha {
          min-height: 60px;
          padding: 8px 15px;
          border-top: 1px solid #edf1f5;
          color: #536178;
          font-size: 9px;
          cursor: pointer;
        }

        .linha.marcado {
          background: #f7fbff;
        }

        .linha input {
          width: 16px;
          height: 16px;
          accent-color: #168447;
        }

        .atleta strong {
          display: block;
          color: #082e69;
          font-size: 10px;
        }

        .atleta small {
          color: #94a3b8;
          font-size: 7px;
        }

        .badge,
        .status {
          width: fit-content;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 7px;
          font-weight: 900;
        }

        .badge.ok {
          background: #e7f7ee;
          color: #168447;
        }

        .badge.pendente {
          background: #fff5e8;
          color: #b96900;
        }

        .status {
          background: #f1f5f9;
          color: #64748b;
        }

        @media (max-width: 800px) {
          .pagina {
            padding: 15px 10px 30px;
          }

          .topo {
            display: block;
          }

          .gerar {
            width: 100%;
            margin-top: 12px;
          }

          .indicadores {
            grid-template-columns: 1fr 1fr;
          }

          .indicador:last-child {
            grid-column: 1 / -1;
          }

          .filtros {
            grid-template-columns: 1fr;
          }

          .cabecalho-lista {
            display: none;
          }

          .linha {
            grid-template-columns:
              30px 1fr auto;
          }

          .linha > span:nth-of-type(1),
          .linha > span:nth-of-type(2),
          .linha .status {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
import Link from "next/link";

const fixos = [
  {
    nome: "Básico",
    descricao:
      "Plano de entrada para empresas que desejam apoiar continuamente o projeto.",
    beneficios: [
      "Divulgação do patrocinador nas redes sociais do clube",
      "Inclusão da marca na área de parceiros do site",
      "Menção institucional como parceiro da A.D. Cannabrava",
    ],
  },
  {
    nome: "Intermediário",
    descricao:
      "Plano com maior frequência de exposição e participação institucional.",
    beneficios: [
      "Todos os benefícios do plano Básico",
      "Maior frequência de divulgação nas redes sociais",
      "Inclusão da marca em peças institucionais selecionadas",
      "Destaque na página de patrocinadores",
    ],
  },
  {
    nome: "Plus",
    descricao:
      "Plano voltado a parceiros que desejam maior presença nas ações do clube.",
    beneficios: [
      "Todos os benefícios do plano Intermediário",
      "Presença da marca em materiais promocionais do clube",
      "Divulgação em campanhas e ações especiais",
      "Maior destaque nas publicações de patrocinadores",
      "Possibilidade de ações conjuntas com o clube",
    ],
  },
  {
    nome: "Premium",
    descricao:
      "Maior nível de exposição entre os patrocinadores fixos.",
    beneficios: [
      "Todos os benefícios do plano Plus",
      "Maior exposição institucional entre os patrocinadores fixos",
      "Prioridade de destaque nas peças oficiais de divulgação",
      "Presença em materiais estratégicos do clube",
      "Ações promocionais personalizadas",
      "Destaque especial no site e nas redes sociais",
    ],
  },
];

const pontuais = [
  {
    nome: "Ouro",
    descricao:
      "Categoria de maior destaque para ações ou eventos específicos.",
    beneficios: [
      "Maior nível de destaque da ação ou evento patrocinado",
      "Presença da marca nas principais peças relacionadas à ação",
      "Divulgação especial nas redes sociais",
      "Menção de destaque como patrocinador",
    ],
  },
  {
    nome: "Prata",
    descricao:
      "Categoria intermediária para apoio a ações específicas.",
    beneficios: [
      "Divulgação da marca nas peças relacionadas à ação",
      "Publicação nas redes sociais",
      "Identificação como patrocinador da ação",
    ],
  },
  {
    nome: "Bronze",
    descricao:
      "Categoria destinada a apoios pontuais com divulgação institucional.",
    beneficios: [
      "Inclusão da marca em materiais selecionados",
      "Menção nas redes sociais",
      "Identificação como apoiador da ação",
    ],
  },
  {
    nome: "Apoiador",
    descricao:
      "Reconhecimento institucional para empresas e pessoas que contribuam com ações específicas.",
    beneficios: [
      "Reconhecimento institucional pelo apoio",
      "Inclusão da marca ou nome em agradecimentos",
      "Divulgação conforme a natureza da parceria",
    ],
  },
];

function CardPlano({
  nome,
  descricao,
  beneficios,
  tipo,
}: {
  nome: string;
  descricao: string;
  beneficios: string[];
  tipo: "fixo" | "pontual";
}) {
  return (
    <article className={`card ${tipo}`}>
      <div className="topo-card">
        <div>
          <span className="tipo">
            {tipo === "fixo"
              ? "PATROCÍNIO FIXO"
              : "PATROCÍNIO PONTUAL"}
          </span>

          <h3>{nome}</h3>
        </div>

        <div className="selo">
          {tipo === "fixo" ? "Mensal" : "Pontual"}
        </div>
      </div>

      <p className="descricao">
        {descricao}
      </p>

      <div className="beneficios-titulo">
        O que oferece
      </div>

      <ul>
        {beneficios.map((beneficio) => (
          <li key={beneficio}>
            <span className="check">✓</span>
            <span>{beneficio}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/admin/financeiro/patrocinadores/novo?tipo=${tipo}&plano=${encodeURIComponent(
          nome
        )}`}
        className="botao"
      >
        Cadastrar patrocinador
      </Link>
    </article>
  );
}

export default function PatrocinadoresPage() {
  return (
    <main className="pagina">
      <section className="cabecalho">
        <div>
          <div className="secao">
            GESTÃO FINANCEIRA
          </div>

          <h1>Patrocinadores</h1>

          <p>
            Gerencie os planos de patrocínio e as parcerias da Associação Desportiva Cannabrava.
          </p>
        </div>

        <Link
          href="/admin/financeiro/patrocinadores/novo"
          className="novo"
        >
          + Novo patrocinador
        </Link>
      </section>

      <section className="bloco">
        <div className="titulo-bloco">
          <div>
            <h2>Patrocínios Fixos</h2>

            <p>
              Parcerias contínuas com cobrança mensal e benefícios definidos conforme o plano contratado.
            </p>
          </div>
        </div>

        <div className="grade">
          {fixos.map((plano) => (
            <CardPlano
              key={plano.nome}
              {...plano}
              tipo="fixo"
            />
          ))}
        </div>
      </section>

      <section className="bloco">
        <div className="titulo-bloco">
          <div>
            <h2>Patrocínios Pontuais</h2>

            <p>
              Apoios destinados a eventos, campanhas, materiais ou ações específicas.
            </p>
          </div>
        </div>

        <div className="grade">
          {pontuais.map((plano) => (
            <CardPlano
              key={plano.nome}
              {...plano}
              tipo="pontual"
            />
          ))}
        </div>
      </section>

      <style>{`
        .pagina {
          max-width: 1750px;
          margin: 0 auto;
          padding: 22px 30px 40px;
        }

        .cabecalho {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .secao {
          color: #1763d6;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .cabecalho h1 {
          margin: 3px 0 4px;
          color: #082e69;
          font-size: 31px;
        }

        .cabecalho p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
        }

        .novo {
          padding: 11px 16px;
          border-radius: 10px;
          background: #082e69;
          color: #ffffff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        }

        .bloco {
          margin-bottom: 28px;
        }

        .titulo-bloco {
          margin-bottom: 11px;
        }

        .titulo-bloco h2 {
          margin: 0;
          color: #082e69;
          font-size: 20px;
        }

        .titulo-bloco p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 12px;
        }

        .grade {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .card {
          display: flex;
          flex-direction: column;
          min-height: 355px;
          padding: 18px;
          background: #ffffff;
          border: 1px solid #dce5f0;
          border-radius: 14px;
          box-shadow:
            0 2px 5px rgba(15, 23, 42, .03);
        }

        .card.fixo {
          border-top: 4px solid #1763d6;
        }

        .card.pontual {
          border-top: 4px solid #168447;
        }

        .topo-card {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .tipo {
          display: block;
          color: #94a3b8;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .card h3 {
          margin: 3px 0 0;
          color: #082e69;
          font-size: 22px;
        }

        .selo {
          padding: 4px 8px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 9px;
          font-weight: 800;
        }

        .descricao {
          min-height: 52px;
          margin: 13px 0;
          color: #64748b;
          font-size: 11px;
          line-height: 1.45;
        }

        .beneficios-titulo {
          padding-top: 10px;
          border-top: 1px solid #eef2f7;
          color: #334155;
          font-size: 11px;
          font-weight: 800;
        }

        .card ul {
          flex: 1;
          list-style: none;
          padding: 0;
          margin: 10px 0 17px;
        }

        .card li {
          display: flex;
          gap: 7px;
          margin-bottom: 8px;
          color: #475569;
          font-size: 11px;
          line-height: 1.35;
        }

        .check {
          color: #168447;
          font-weight: 900;
        }

        .botao {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          border: 1px solid #b9c8dc;
          border-radius: 9px;
          color: #082e69;
          background: #ffffff;
          text-decoration: none;
          font-size: 11px;
          font-weight: 800;
        }

        .botao:hover {
          background: #f5f8fc;
        }

        @media (max-width: 1250px) {
          .grade {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .pagina {
            padding: 18px 15px 30px;
          }

          .cabecalho {
            align-items: flex-start;
            flex-direction: column;
          }

          .cabecalho h1 {
            font-size: 26px;
          }

          .novo {
            width: 100%;
            text-align: center;
          }

          .grade {
            grid-template-columns: 1fr;
          }

          .card {
            min-height: auto;
          }
        }
      `}</style>
    </main>
  );
}
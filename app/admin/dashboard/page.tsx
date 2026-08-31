export default function DashboardPage() {
  const cards = [
    {
      title: "Atletas ativos",
      value: "0",
      description: "Temporada atual",
    },
    {
      title: "Contas a pagar",
      value: "R$ 0,00",
      description: "Em aberto",
    },
    {
      title: "Contas a receber",
      value: "R$ 0,00",
      description: "Em aberto",
    },
    {
      title: "Saldo disponível",
      value: "R$ 0,00",
      description: "Caixa + bancos",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <p className="mt-1 text-sm text-slate-500">
          Visão geral da Associação Desportiva Cannabrava.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border bg-white p-5"
          >
            <span className="text-xs font-semibold uppercase text-slate-500">
              {card.title}
            </span>

            <strong className="mt-2 block text-2xl">
              {card.value}
            </strong>

            <span className="mt-1 block text-xs text-slate-400">
              {card.description}
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}
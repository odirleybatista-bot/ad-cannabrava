import Link from "next/link";

export default function AdminSidebar() {
  return (
    <aside className="min-h-screen w-64 border-r bg-white p-4">
      <Link href="/admin/dashboard" className="mb-8 block font-bold">
        A.D. Cannabrava
      </Link>

      <nav className="space-y-1 text-sm">
        <Link
          href="/admin/dashboard"
          className="block rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          Dashboard
        </Link>

        <p className="px-3 pt-5 text-xs font-bold uppercase text-slate-400">
          Gestão Administrativa
        </p>

        <Link
          href="/admin/administrativo/diretoria"
          className="block rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          Diretoria
        </Link>

        <Link
          href="/admin/administrativo/associados"
          className="block rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          Associados
        </Link>

        <p className="px-3 pt-5 text-xs font-bold uppercase text-slate-400">
          Gestão Esportiva
        </p>

        <Link
          href="/admin/esportivo/atletas"
          className="block rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          Atletas
        </Link>

        <Link
          href="/admin/esportivo/partidas"
          className="block rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          Partidas
        </Link>

        <Link
          href="/admin/esportivo/competicoes"
          className="block rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          Competições
        </Link>

        <p className="px-3 pt-5 text-xs font-bold uppercase text-slate-400">
          Gestão Financeira
        </p>

        <Link
          href="/admin/financeiro/contas-pagar"
          className="block rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          Contas a Pagar
        </Link>

        <Link
          href="/admin/financeiro/arquivo-fiscal"
          className="block rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          Arquivo Fiscal
        </Link>

        <Link
          href="/admin/financeiro/contas-receber"
          className="block rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          Contas a Receber
        </Link>

        <Link
          href="/admin/financeiro/caixa-bancos"
          className="block rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          Caixa e Bancos
        </Link>

        <p className="px-3 pt-5 text-xs font-bold uppercase text-slate-400">
          Sistema
        </p>

        <Link
          href="/admin/relatorios"
          className="block rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          Relatórios
        </Link>

        <Link
          href="/admin/auditoria"
          className="block rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          Auditoria
        </Link>

        <Link
          href="/admin/configuracoes"
          className="block rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          Configurações
        </Link>
      </nav>
    </aside>
  );
}
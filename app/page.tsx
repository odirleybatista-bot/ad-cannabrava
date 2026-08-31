import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 p-10">
      <h1 className="text-3xl font-bold">
        A.D. Cannabrava
      </h1>

      <p className="mt-2 text-slate-600">
        Site oficial da Associação Desportiva Cannabrava.
      </p>

      <Link
        href="/admin/dashboard"
        className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-3 text-white"
      >
        Área Restrita
      </Link>
    </main>
  );
}
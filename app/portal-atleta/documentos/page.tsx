import { requireCurrentAthlete } from "@/lib/auth/current-athlete";
import DocumentosClient from "./DocumentosClient";

export default async function DocumentosPage() {
  const { atletaId } =
    await requireCurrentAthlete();

  return (
    <DocumentosClient
      atletaId={atletaId}
    />
  );
}
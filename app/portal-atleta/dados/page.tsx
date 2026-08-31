"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { salvarAtleta } from "./actions";

export default function MeusDadosPage() {
  const router = useRouter();

  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setSalvo(false);
    setSalvando(true);

    try {
      const formData = new FormData(event.currentTarget);
      const resultado = await salvarAtleta(formData);

      if (!resultado.sucesso) {
        setErro(
          resultado.mensagem ||
            "Não foi possível salvar o cadastro."
        );
        return;
      }

      setSalvo(true);

      setTimeout(() => {
        router.push("/portal-atleta/documentos");
      }, 1200);

    } catch (error) {
      console.error("Erro ao salvar cadastro:", error);

      setErro(
        "Ocorreu um erro ao salvar o cadastro. Tente novamente."
      );

    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">

        <div>
          <h1 className="text-3xl font-black text-[#08265a]">
            Meus Dados
          </h1>

          <p className="mt-1 text-slate-500">
            Mantenha seus dados pessoais e esportivos atualizados.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Situação cadastral
          </p>

          <p className="text-sm font-bold text-emerald-800">
            Cadastro em atualização
          </p>
        </div>

      </div>

      {erro && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {erro}
        </div>
      )}

      {salvo && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
          Dados salvos com sucesso. Redirecionando para Documentos...
        </div>
      )}

      <form onSubmit={salvar} className="space-y-6">

        <Secao
          titulo="Identificação"
          descricao="Informações principais do atleta."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            <Campo
              label="Nome completo"
              name="nome"
              placeholder="Nome completo"
              required
              className="xl:col-span-2"
            />

            <Campo
              label="Apelido esportivo"
              name="apelido"
              placeholder="Como deseja ser identificado"
            />

            <Campo
              label="CPF"
              name="cpf"
              placeholder="000.000.000-00"
              required
            />

            <Campo
              label="RG"
              name="rg"
              placeholder="Número do documento"
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Data de nascimento
              </label>

              <input
                name="data_nascimento"
                type="date"
                required
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-blue-600"
              />
            </div>

          </div>
        </Secao>

        <Secao
          titulo="Contato"
          descricao="Dados utilizados para comunicação com a associação."
        >
          <div className="grid gap-5 md:grid-cols-2">

            <Campo
              label="Telefone / WhatsApp"
              name="telefone"
              placeholder="(00) 00000-0000"
              required
            />

            <Campo
              label="E-mail"
              name="email"
              type="email"
              placeholder="atleta@email.com"
              required
            />

          </div>
        </Secao>

        <Secao
          titulo="Endereço"
          descricao="Endereço residencial informado pelo atleta."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            <Campo
              label="CEP"
              name="cep"
              placeholder="00000-000"
            />

            <Campo
              label="Cidade"
              name="cidade"
              placeholder="Cidade"
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Estado
              </label>

              <select
                name="uf"
                defaultValue="BA"
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none"
              >
                <option value="BA">Bahia</option>
                <option value="AL">Alagoas</option>
                <option value="SE">Sergipe</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="MG">Minas Gerais</option>
                <option value="GO">Goiás</option>
                <option value="DF">Distrito Federal</option>
                <option value="SP">São Paulo</option>
              </select>
            </div>

            <Campo
              label="Bairro"
              name="bairro"
              placeholder="Bairro"
            />

            <Campo
              label="Logradouro"
              name="logradouro"
              placeholder="Rua, avenida, povoado..."
              className="md:col-span-2"
            />

            <Campo
              label="Número"
              name="numero"
              placeholder="Número"
            />

            <Campo
              label="Complemento"
              name="complemento"
              placeholder="Complemento"
            />

          </div>
        </Secao>

        <Secao
          titulo="Informações esportivas"
          descricao="Informações utilizadas na gestão esportiva."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Modalidade
              </label>

              <select
                name="modalidade"
                defaultValue="Futebol"
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none"
              >
                <option value="Futebol">
                  Futebol
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Posição
              </label>

              <select
                name="posicao"
                defaultValue=""
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none"
              >
                <option value="">Selecione</option>
                <option value="Goleiro">Goleiro</option>
                <option value="Zagueiro">Zagueiro</option>
                <option value="Lateral direito">Lateral direito</option>
                <option value="Lateral esquerdo">Lateral esquerdo</option>
                <option value="Volante">Volante</option>
                <option value="Meia">Meia</option>
                <option value="Ponta">Ponta</option>
                <option value="Atacante">Atacante</option>
              </select>
            </div>

            <Campo
              label="Número preferencial"
              name="numero_camisa"
              type="number"
              placeholder="Ex.: 10"
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Pé preferencial
              </label>

              <select
                name="pe_preferencial"
                defaultValue=""
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none"
              >
                <option value="">Selecione</option>
                <option value="Direito">Direito</option>
                <option value="Esquerdo">Esquerdo</option>
                <option value="Ambidestro">Ambidestro</option>
              </select>
            </div>

            <Campo
              label="Altura (cm)"
              name="altura"
              type="number"
              placeholder="Ex.: 180"
            />

            <Campo
              label="Peso (kg)"
              name="peso"
              type="number"
              placeholder="Ex.: 78"
            />

            <Campo
              label="Registro esportivo"
              name="registro_esportivo"
              placeholder="Opcional"
            />

          </div>
        </Secao>

        <Secao
          titulo="Contato de emergência"
          descricao="Pessoa que poderá ser contatada em caso de necessidade."
        >
          <div className="grid gap-5 md:grid-cols-3">

            <Campo
              label="Nome"
              name="emergencia_nome"
              placeholder="Nome do contato"
            />

            <Campo
              label="Parentesco / relação"
              name="emergencia_parentesco"
              placeholder="Ex.: mãe, pai, cônjuge"
            />

            <Campo
              label="Telefone"
              name="emergencia_telefone"
              placeholder="(00) 00000-0000"
            />

          </div>
        </Secao>

        <div className="flex flex-wrap items-center justify-end gap-3 pb-8">

          <button
            type="reset"
            className="h-12 rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Limpar alterações
          </button>

          <button
            type="submit"
            disabled={salvando}
            className="h-12 rounded-xl bg-[#08265a] px-8 text-sm font-bold text-white hover:bg-[#0b3478] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar dados"}
          </button>

        </div>

      </form>
    </div>
  );
}

function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">

      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#08265a]">
          {titulo}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {descricao}
        </p>
      </div>

      {children}

    </section>
  );
}

function Campo({
  label,
  name,
  placeholder,
  type = "text",
  required = false,
  className = "",
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
      />

    </div>
  );
}
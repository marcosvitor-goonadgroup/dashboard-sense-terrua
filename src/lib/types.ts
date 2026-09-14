/** Uma linha da API = a resposta de UMA pergunta, dentro de uma seção, de uma pesquisa. */
export type Linha = {
  pesquisa_id: string;
  resposta_id: string;
  matriz: string;
  cliente: string;
  evento: string;
  data_evento: string | null;
  gerente: string | null;
  assessor: string | null;
  status_pesquisa: string;
  nome_respondente: string | null;
  cargo_respondente: string | null;
  data_resposta: string | null;
  secao: string;
  secao_codigo: string;
  secao_nao_se_aplica: boolean;
  juridico_participou: boolean | null;
  pergunta: string;
  pergunta_ordem: number;
  nota: number | null;
  comentario_secao: string | null;
  secao_ordem: number;
  data_inicio: string | null;
  data_fim: string | null;
};

export type RespostaApi = {
  success: boolean;
  event: string;
  source: string;
  totalTables: number;
  tables: {
    dados_respostas_pesquisas?: {
      count: number;
      data: Linha[];
    };
  };
};

/** O que a sessão autenticada pode enxergar. */
export type Escopo =
  | { tipo: "admin"; nome: string }
  | { tipo: "matriz"; nome: string; matriz: string };

export type Sessao = {
  usuario: string;
  escopo: Escopo;
  exp: number;
};

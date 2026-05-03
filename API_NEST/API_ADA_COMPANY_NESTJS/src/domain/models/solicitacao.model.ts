export interface Solicitacao {
  id_solicitacao: string;
  id_cliente: string;
  site: string;
  tipo_pacote: 'A' | 'AA' | 'AAA';
  observacoes?: string;
  selected_issues?: any;
  status: 'PENDENTE' | 'EM_ANALISE' | 'ORCAMENTO_CRIADO' | 'ORCAMENTO_APROVADO' | 'CANCELADA';
  id_pacote?: string;
  cod_orcamento?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


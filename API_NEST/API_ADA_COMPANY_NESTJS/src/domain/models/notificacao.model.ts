export interface NotificacaoModel {
  _id?: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro';
  userId: string;
  lida: boolean;
  dataLeitura?: Date;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateNotificacaoRequest {
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro';
  userId: string;
  metadata?: Record<string, any>;
}



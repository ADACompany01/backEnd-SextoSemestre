export interface Usuario {
  id_usuario: string;
  nome_completo: string;
  telefone: string;
  email: string;
  senha: string;
  tipo_usuario: 'funcionario' | 'cliente';
} 
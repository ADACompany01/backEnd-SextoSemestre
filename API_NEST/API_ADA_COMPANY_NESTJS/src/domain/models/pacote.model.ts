import { TipoPacote } from '../../interfaces/http/dtos/requests/create-pacote.dto';

export interface Pacote {
  id_pacote?: string;
  id_cliente: string;
  tipo_pacote: TipoPacote;
  valor_base: number;
} 
import { IsNumber, IsDateString, IsUUID } from 'class-validator';

export class CreateOrcamentoDto {
  @IsNumber()
  valor_orcamento: number;

  @IsDateString()
  data_orcamento: Date;

  @IsDateString()
  data_validade: Date;

  @IsUUID()
  id_pacote: string;
} 
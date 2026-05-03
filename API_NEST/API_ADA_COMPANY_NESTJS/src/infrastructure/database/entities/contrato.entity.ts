import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Orcamento } from './orcamento.entity';

export enum StatusContrato {
  EM_ANALISE = 'EM_ANALISE',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CANCELADO = 'CANCELADO',
  CONCLUIDO = 'CONCLUIDO'
}

@Table({ tableName: 'contratos' })
export class Contrato extends Model<Contrato> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    field: 'id_contrato',
  })
  id_contrato: string;

  @Column({
    type: DataType.DECIMAL(10,2),
    allowNull: false,
    field: 'valor_contrato',
  })
  valor_contrato: number;

  @ForeignKey(() => Orcamento)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'cod_orcamento',
  })
  cod_orcamento: string;

  @BelongsTo(() => Orcamento)
  orcamento: Orcamento;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'status_contrato',
  })
  status_contrato: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'data_inicio',
  })
  data_inicio: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'data_entrega',
  })
  data_entrega: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'arquivo_contrato',
  })
  arquivo_contrato?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'contrato_assinado_url',
  })
  contrato_assinado_url?: string;
} 
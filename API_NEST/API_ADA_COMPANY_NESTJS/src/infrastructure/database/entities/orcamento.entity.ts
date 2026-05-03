import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne } from 'sequelize-typescript';
import { Pacote } from './pacote.entity';
import { Contrato } from './contrato.entity';

@Table({ tableName: 'orcamentos' })
export class Orcamento extends Model<Orcamento> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    field: 'cod_orcamento',
  })
  cod_orcamento: string;

  @Column({
    type: DataType.DECIMAL(10,2),
    allowNull: false,
    field: 'valor_orcamento',
  })
  valor_orcamento: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'data_orcamento',
  })
  data_orcamento: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'data_validade',
  })
  data_validade: Date;

  @ForeignKey(() => Pacote)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'id_pacote',
  })
  id_pacote: string;

  @BelongsTo(() => Pacote)
  pacote: Pacote;

  @HasOne(() => Contrato)
  contrato: Contrato;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'arquivo_orcamento',
  })
  arquivo_orcamento?: string;
} 
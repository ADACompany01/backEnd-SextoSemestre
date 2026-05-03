import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne } from 'sequelize-typescript';
import { Cliente } from './cliente.entity';
import { Orcamento } from './orcamento.entity';
// import { Orcamento } from './orcamento.entity'; // Será criado depois

export enum TipoPacote {
  A = 'A',
  AA = 'AA',
  AAA = 'AAA'
}

@Table({ tableName: 'pacotes' })
export class Pacote extends Model<Pacote> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    field: 'id_pacote',
  })
  id_pacote: string;

  @ForeignKey(() => Cliente)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'id_cliente',
  })
  id_cliente: string;

  @BelongsTo(() => Cliente)
  cliente: Cliente;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'tipo_pacote',
  })
  tipo_pacote: string;

  @Column({
    type: DataType.DECIMAL(10,2),
    allowNull: false,
    field: 'valor_base',
  })
  valor_base: number;

  @HasOne(() => Orcamento)
  orcamento: Orcamento;
} 
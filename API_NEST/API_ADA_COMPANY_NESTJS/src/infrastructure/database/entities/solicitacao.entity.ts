import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Cliente } from './cliente.entity';

@Table({ tableName: 'solicitacoes' })
export class Solicitacao extends Model<Solicitacao> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    field: 'id_solicitacao',
  })
  id_solicitacao: string;

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
    field: 'site',
  })
  site: string;

  @Column({
    type: DataType.ENUM('A', 'AA', 'AAA'),
    allowNull: false,
    field: 'tipo_pacote',
  })
  tipo_pacote: 'A' | 'AA' | 'AAA';

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'observacoes',
  })
  observacoes?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    field: 'selected_issues',
  })
  selected_issues?: any;

  @Column({
    type: DataType.ENUM('PENDENTE', 'EM_ANALISE', 'ORCAMENTO_CRIADO', 'ORCAMENTO_APROVADO', 'CANCELADA'),
    allowNull: false,
    defaultValue: 'PENDENTE',
    field: 'status',
  })
  status: 'PENDENTE' | 'EM_ANALISE' | 'ORCAMENTO_CRIADO' | 'ORCAMENTO_APROVADO' | 'CANCELADA';

  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'id_pacote',
  })
  id_pacote?: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'cod_orcamento',
  })
  cod_orcamento?: string;
}


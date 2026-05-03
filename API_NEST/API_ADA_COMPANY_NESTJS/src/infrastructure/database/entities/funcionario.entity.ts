import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Usuario } from './usuario.entity';

@Table({ tableName: 'funcionarios' })
export class Funcionario extends Model<Funcionario> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    field: 'id_funcionario',
  })
  id_funcionario: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'nome_completo',
  })
  nome_completo: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    field: 'email',
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'telefone',
  })
  telefone: string;

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'id_usuario',
  })
  id_usuario: string;

  @BelongsTo(() => Usuario)
  usuario: Usuario;
} 
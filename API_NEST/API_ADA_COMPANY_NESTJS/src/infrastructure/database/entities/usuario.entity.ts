import { Table, Column, Model, DataType, HasOne } from 'sequelize-typescript';
import { Cliente } from './cliente.entity';
import { Funcionario } from './funcionario.entity';

@Table({ tableName: 'usuarios' })
export class Usuario extends Model<Usuario> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    field: 'id_usuario',
  })
  id_usuario: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'nome_completo',
  })
  nome_completo: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'telefone',
  })
  telefone: string;

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
    field: 'senha',
  })
  senha: string;

  @Column({
    type: DataType.ENUM('funcionario', 'cliente'),
    allowNull: false,
    field: 'tipo_usuario',
  })
  tipo_usuario: 'funcionario' | 'cliente';

  @HasOne(() => Cliente)
  cliente: Cliente;

  @HasOne(() => Funcionario)
  funcionario: Funcionario;
} 
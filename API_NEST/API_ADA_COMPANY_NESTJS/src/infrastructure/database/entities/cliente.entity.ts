import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Usuario } from './usuario.entity';
import { Pacote } from './pacote.entity';
// import { Pacote } from './pacote.entity'; // Será criado depois

@Table({ tableName: 'clientes' })
export class Cliente extends Model<Cliente> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    field: 'id_cliente',
  })
  id_cliente: string;

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
    field: 'cnpj',
  })
  cnpj: string;

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

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'id_usuario',
  })
  id_usuario: string;

  @BelongsTo(() => Usuario)
  usuario: Usuario;

  @HasMany(() => Pacote)
  pacotes: Pacote[];
} 
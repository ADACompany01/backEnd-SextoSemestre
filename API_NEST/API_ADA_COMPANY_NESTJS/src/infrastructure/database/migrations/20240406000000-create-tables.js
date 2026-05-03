'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Criar tabela de usuários primeiro
    await queryInterface.createTable('usuarios', {
      id_usuario: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      nome_completo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      telefone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      senha: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tipo_usuario: {
        type: Sequelize.ENUM('funcionario', 'cliente'),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Criar tabela de funcionários
    await queryInterface.createTable('funcionarios', {
      id_funcionario: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      nome_completo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      telefone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      id_usuario: {
        type: Sequelize.UUID,
        allowNull: true, // Será atualizado após a criação do usuário
        references: {
          model: 'usuarios',
          key: 'id_usuario',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Criar tabela de clientes
    await queryInterface.createTable('clientes', {
      id_cliente: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      nome_completo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cnpj: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      telefone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      id_usuario: {
        type: Sequelize.UUID,
        allowNull: true, // Será atualizado após a criação do usuário
        references: {
          model: 'usuarios',
          key: 'id_usuario',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Criar tabela de pacotes
    await queryInterface.createTable('pacotes', {
      id_pacote: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      id_cliente: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'clientes',
          key: 'id_cliente',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tipo_pacote: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      valor_base: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Criar tabela de orçamentos
    await queryInterface.createTable('orcamentos', {
      cod_orcamento: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      valor_orcamento: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      data_orcamento: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      data_validade: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      id_pacote: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'pacotes',
          key: 'id_pacote',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Criar tabela de contratos
    await queryInterface.createTable('contratos', {
      id_contrato: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      valor_contrato: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      cod_orcamento: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'orcamentos',
          key: 'cod_orcamento',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status_contrato: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      data_inicio: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      data_entrega: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('contratos');
    await queryInterface.dropTable('orcamentos');
    await queryInterface.dropTable('pacotes');
    await queryInterface.dropTable('clientes');
    await queryInterface.dropTable('funcionarios');
    await queryInterface.dropTable('usuarios');
  },
}; 
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('solicitacoes', {
      id_solicitacao: {
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
      site: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tipo_pacote: {
        type: Sequelize.ENUM('A', 'AA', 'AAA'),
        allowNull: false,
      },
      observacoes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      selected_issues: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('PENDENTE', 'EM_ANALISE', 'ORCAMENTO_CRIADO', 'CANCELADA'),
        allowNull: false,
        defaultValue: 'PENDENTE',
      },
      id_pacote: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'pacotes',
          key: 'id_pacote',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      cod_orcamento: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'orcamentos',
          key: 'cod_orcamento',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await queryInterface.dropTable('solicitacoes');
  }
};


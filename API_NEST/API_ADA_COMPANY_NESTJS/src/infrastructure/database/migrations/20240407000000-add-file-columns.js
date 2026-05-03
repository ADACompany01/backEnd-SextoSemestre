'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adicionar coluna arquivo_orcamento na tabela orcamentos
    await queryInterface.addColumn('orcamentos', 'arquivo_orcamento', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Adicionar coluna arquivo_contrato na tabela contratos
    await queryInterface.addColumn('contratos', 'arquivo_contrato', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Adicionar coluna contrato_assinado_url na tabela contratos
    await queryInterface.addColumn('contratos', 'contrato_assinado_url', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remover colunas na ordem inversa
    await queryInterface.removeColumn('contratos', 'contrato_assinado_url');
    await queryInterface.removeColumn('contratos', 'arquivo_contrato');
    await queryInterface.removeColumn('orcamentos', 'arquivo_orcamento');
  }
};


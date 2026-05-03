'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Alterar o tipo ENUM para incluir ORCAMENTO_APROVADO
    await queryInterface.sequelize.query(`
      ALTER TABLE solicitacoes 
      MODIFY COLUMN status ENUM('PENDENTE', 'EM_ANALISE', 'ORCAMENTO_CRIADO', 'ORCAMENTO_APROVADO', 'CANCELADA') 
      NOT NULL DEFAULT 'PENDENTE';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Reverter para o estado anterior (sem ORCAMENTO_APROVADO)
    await queryInterface.sequelize.query(`
      ALTER TABLE solicitacoes 
      MODIFY COLUMN status ENUM('PENDENTE', 'EM_ANALISE', 'ORCAMENTO_CRIADO', 'CANCELADA') 
      NOT NULL DEFAULT 'PENDENTE';
    `);
  }
};


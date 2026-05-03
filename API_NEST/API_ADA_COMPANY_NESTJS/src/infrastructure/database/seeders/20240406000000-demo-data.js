'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Criar funcionário
    const funcionario = await queryInterface.bulkInsert('funcionarios', [{
      id_funcionario: '00000000-0000-0000-0000-000000000002',
      nome_completo: 'João Silva',
      email: 'joao.silva@adacompany.com',
      telefone: '(11) 98888-8888',
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: true });

    // Criar cliente de demonstração
    const cliente = await queryInterface.bulkInsert('clientes', [{
      id_cliente: '00000000-0000-0000-0000-000000000003',
      nome_completo: 'Empresa Demo',
      cnpj: '12.345.678/0001-90',
      telefone: '(11) 97777-7777',
      email: 'demo@empresa.com',
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: true });

    // Criar usuário para o funcionário
    const funcionarioUser = await queryInterface.bulkInsert('usuarios', [{
      id_usuario: '00000000-0000-0000-0000-000000000001',
      nome_completo: funcionario[0].nome_completo,
      telefone: funcionario[0].telefone,
      email: funcionario[0].email,
      senha: await bcrypt.hash('admin123', 10),
      tipo_usuario: 'funcionario',
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: true });

    // Criar usuário para o cliente
    const clienteUser = await queryInterface.bulkInsert('usuarios', [{
      id_usuario: '00000000-0000-0000-0000-000000000004',
      nome_completo: cliente[0].nome_completo,
      telefone: cliente[0].telefone,
      email: cliente[0].email,
      senha: await bcrypt.hash('cliente123', 10),
      tipo_usuario: 'cliente',
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: true });

    // Atualizar funcionário com o id do usuário
    await queryInterface.bulkUpdate('funcionarios', {
      id_usuario: funcionarioUser[0].id_usuario,
      updatedAt: new Date()
    }, {
      id_funcionario: funcionario[0].id_funcionario
    });

    // Atualizar cliente com o id do usuário
    await queryInterface.bulkUpdate('clientes', {
      id_usuario: clienteUser[0].id_usuario,
      updatedAt: new Date()
    }, {
      id_cliente: cliente[0].id_cliente
    });

    // Criar pacote de demonstração
    const pacote = await queryInterface.bulkInsert('pacotes', [{
      id_pacote: '00000000-0000-0000-0000-000000000005',
      id_cliente: cliente[0].id_cliente,
      tipo_pacote: 'Pacote Básico',
      valor_base: 1000.00,
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: true });

    // Criar orçamento de demonstração
    const orcamento = await queryInterface.bulkInsert('orcamentos', [{
      cod_orcamento: '00000000-0000-0000-0000-000000000006',
      valor_orcamento: 1200.00,
      data_orcamento: new Date(),
      data_validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      id_pacote: pacote[0].id_pacote,
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: true });

    // Criar contrato de demonstração
    await queryInterface.bulkInsert('contratos', [{
      id_contrato: '00000000-0000-0000-0000-000000000007',
      valor_contrato: 1200.00,
      cod_orcamento: orcamento[0].cod_orcamento,
      status_contrato: 'Ativo',
      data_inicio: new Date(),
      data_entrega: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('contratos', null, {});
    await queryInterface.bulkDelete('orcamentos', null, {});
    await queryInterface.bulkDelete('pacotes', null, {});
    await queryInterface.bulkDelete('clientes', null, {});
    await queryInterface.bulkDelete('funcionarios', null, {});
    await queryInterface.bulkDelete('usuarios', null, {});
  }
}; 
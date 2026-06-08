/**
 * Testes de Máquina de Estados — Solicitação
 *
 * Funcionalidade: Ciclo de vida de uma Solicitação de Acessibilidade
 *
 * Estados possíveis:
 *   PENDENTE → EM_ANALISE → ORCAMENTO_CRIADO → ORCAMENTO_APROVADO
 *                                             → CANCELADA
 *              ↑           ↑
 *              └── CANCELADA (em qualquer etapa anterior)
 *
 * Cobertura implementada:
 *   - Cobertura de Estados   (TC-EST-01 a TC-EST-05)
 *   - Cobertura de Transições (TC-TR-01 a TC-TR-06)
 *   - Cobertura de Caminhos  (TC-PATH-01 a TC-PATH-04)
 *
 * Referência: PLANO_DE_TESTES.md — Seções 11.1, 11.2, 11.3
 */

import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateOrcamentoFromSolicitacaoUseCase } from './solicitacao/create-orcamento-from-solicitacao.use-case';
import { CreateSolicitacaoUseCase } from './solicitacao/create-solicitacao.use-case';
import { UpdateSolicitacaoUseCase } from './solicitacao/update-solicitacao.use-case';

const repo = (overrides: Record<string, jest.Mock> = {}) => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findByCliente: jest.fn(),
  findById: jest.fn(),
  findByPacote: jest.fn(),
  update: jest.fn(),
  ...overrides,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeUpdateUseCase(fromStatus: string, toStatus: string) {
  return new UpdateSolicitacaoUseCase(
    repo({
      findById: jest.fn().mockResolvedValue({ id_solicitacao: 's-1', status: fromStatus }),
      update: jest.fn().mockResolvedValue([1, [{ id_solicitacao: 's-1', status: toStatus }]]),
    }) as any,
  );
}

// ---------------------------------------------------------------------------
// COBERTURA DE ESTADOS
// ---------------------------------------------------------------------------

describe('Máquina de Estados — Cobertura de Estados', () => {
  /**
   * TC-EST-01
   * Estado: PENDENTE
   * Toda solicitação recém-criada deve iniciar no estado PENDENTE.
   */
  it('TC-EST-01: estado inicial PENDENTE ao criar solicitação', async () => {
    const solicitacaoRepo = repo({
      create: jest.fn().mockResolvedValue({ id_solicitacao: 's-est01', status: 'PENDENTE' }),
    });
    const clienteRepo = repo({
      findById: jest.fn().mockResolvedValue({ id_cliente: 'c-1' }),
    });

    const result = await new CreateSolicitacaoUseCase(
      solicitacaoRepo as any,
      clienteRepo as any,
    ).execute('c-1', { site: 'https://est01.com', tipo_pacote: 'A' } as any);

    expect(result.status).toBe('PENDENTE');
    expect(solicitacaoRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'PENDENTE' }),
    );
  });

  /**
   * TC-EST-02
   * Estado: EM_ANALISE
   * A solicitação pode ser atualizada para EM_ANALISE pelo funcionário.
   */
  it('TC-EST-02: estado EM_ANALISE alcançável via atualização', async () => {
    const result = await makeUpdateUseCase('PENDENTE', 'EM_ANALISE').execute('s-1', {
      status: 'EM_ANALISE',
    } as any);

    expect(result).toMatchObject({ status: 'EM_ANALISE' });
  });

  /**
   * TC-EST-03
   * Estado: ORCAMENTO_CRIADO
   * CreateOrcamentoFromSolicitacaoUseCase define status = ORCAMENTO_CRIADO.
   */
  it('TC-EST-03: estado ORCAMENTO_CRIADO definido ao gerar orçamento', async () => {
    const solicitacaoRepo = repo({
      findById: jest.fn().mockResolvedValue({
        id_solicitacao: 's-est03',
        id_cliente: 'c-1',
        tipo_pacote: 'A',
        status: 'EM_ANALISE',
      }),
      update: jest.fn(),
    });
    const createPacoteUseCase = { execute: jest.fn().mockResolvedValue({ id_pacote: 'p-1' }) };
    const createOrcamentoUseCase = { execute: jest.fn().mockResolvedValue({ cod_orcamento: 'o-est03' }) };

    await new CreateOrcamentoFromSolicitacaoUseCase(
      solicitacaoRepo as any,
      createPacoteUseCase as any,
      createOrcamentoUseCase as any,
      repo() as any,
    ).execute('s-est03');

    expect(solicitacaoRepo.update).toHaveBeenCalledWith(
      's-est03',
      expect.objectContaining({ status: 'ORCAMENTO_CRIADO' }),
    );
  });

  /**
   * TC-EST-04
   * Estado: ORCAMENTO_APROVADO
   * A solicitação pode ser atualizada para ORCAMENTO_APROVADO pelo cliente.
   */
  it('TC-EST-04: estado ORCAMENTO_APROVADO alcançável via atualização', async () => {
    const result = await makeUpdateUseCase('ORCAMENTO_CRIADO', 'ORCAMENTO_APROVADO').execute('s-1', {
      status: 'ORCAMENTO_APROVADO',
    } as any);

    expect(result).toMatchObject({ status: 'ORCAMENTO_APROVADO' });
  });

  /**
   * TC-EST-05
   * Estado: CANCELADA
   * A solicitação pode ser cancelada em qualquer etapa.
   */
  it('TC-EST-05: estado CANCELADA alcançável via atualização', async () => {
    const result = await makeUpdateUseCase('PENDENTE', 'CANCELADA').execute('s-1', {
      status: 'CANCELADA',
    } as any);

    expect(result).toMatchObject({ status: 'CANCELADA' });
  });
});

// ---------------------------------------------------------------------------
// COBERTURA DE TRANSIÇÕES
// ---------------------------------------------------------------------------

describe('Máquina de Estados — Cobertura de Transições', () => {
  /**
   * TC-TR-01
   * Transição: [inicial] → PENDENTE
   * Ação: criar solicitação
   */
  it('TC-TR-01: [inicial] → PENDENTE ao criar solicitação', async () => {
    const solicitacaoRepo = repo({
      create: jest.fn().mockResolvedValue({ id_solicitacao: 's-tr01', status: 'PENDENTE' }),
    });
    const clienteRepo = repo({
      findById: jest.fn().mockResolvedValue({ id_cliente: 'c-1' }),
    });

    const result = await new CreateSolicitacaoUseCase(
      solicitacaoRepo as any,
      clienteRepo as any,
    ).execute('c-1', { site: 'https://tr01.com', tipo_pacote: 'AA' } as any);

    expect(result.status).toBe('PENDENTE');
  });

  /**
   * TC-TR-02
   * Transição: PENDENTE → EM_ANALISE
   * Ação: funcionário inicia análise
   */
  it('TC-TR-02: PENDENTE → EM_ANALISE quando funcionário inicia análise', async () => {
    const repository = repo({
      findById: jest.fn().mockResolvedValue({ id_solicitacao: 's-tr02', status: 'PENDENTE' }),
      update: jest.fn().mockResolvedValue([1, [{ id_solicitacao: 's-tr02', status: 'EM_ANALISE' }]]),
    });

    const result = await new UpdateSolicitacaoUseCase(repository as any).execute('s-tr02', {
      status: 'EM_ANALISE',
    } as any);

    expect(result.status).toBe('EM_ANALISE');
    expect(repository.update).toHaveBeenCalledWith(
      's-tr02',
      expect.objectContaining({ status: 'EM_ANALISE' }),
    );
  });

  /**
   * TC-TR-03
   * Transição: EM_ANALISE → ORCAMENTO_CRIADO
   * Ação: funcionário cria orçamento a partir da solicitação
   */
  it('TC-TR-03: EM_ANALISE → ORCAMENTO_CRIADO ao criar orçamento', async () => {
    const solicitacaoRepo = repo({
      findById: jest.fn().mockResolvedValue({
        id_solicitacao: 's-tr03',
        id_cliente: 'c-1',
        tipo_pacote: 'AA',
        status: 'EM_ANALISE',
      }),
      update: jest.fn(),
    });
    const createPacoteUseCase = { execute: jest.fn().mockResolvedValue({ id_pacote: 'p-tr03' }) };
    const createOrcamentoUseCase = { execute: jest.fn().mockResolvedValue({ cod_orcamento: 'o-tr03' }) };

    const result = await new CreateOrcamentoFromSolicitacaoUseCase(
      solicitacaoRepo as any,
      createPacoteUseCase as any,
      createOrcamentoUseCase as any,
      repo() as any,
    ).execute('s-tr03');

    expect(result).toMatchObject({ cod_orcamento: 'o-tr03' });
    expect(solicitacaoRepo.update).toHaveBeenCalledWith(
      's-tr03',
      expect.objectContaining({ status: 'ORCAMENTO_CRIADO' }),
    );
  });

  /**
   * TC-TR-04
   * Transição: ORCAMENTO_CRIADO → ORCAMENTO_APROVADO
   * Ação: cliente aprova orçamento
   */
  it('TC-TR-04: ORCAMENTO_CRIADO → ORCAMENTO_APROVADO quando cliente aprova', async () => {
    const repository = repo({
      findById: jest.fn().mockResolvedValue({ id_solicitacao: 's-tr04', status: 'ORCAMENTO_CRIADO' }),
      update: jest
        .fn()
        .mockResolvedValue([1, [{ id_solicitacao: 's-tr04', status: 'ORCAMENTO_APROVADO' }]]),
    });

    const result = await new UpdateSolicitacaoUseCase(repository as any).execute('s-tr04', {
      status: 'ORCAMENTO_APROVADO',
    } as any);

    expect(result.status).toBe('ORCAMENTO_APROVADO');
  });

  /**
   * TC-TR-05
   * Transição: PENDENTE → CANCELADA
   * Ação: cliente cancela antes da análise
   */
  it('TC-TR-05: PENDENTE → CANCELADA quando cliente cancela antes da análise', async () => {
    const repository = repo({
      findById: jest.fn().mockResolvedValue({ id_solicitacao: 's-tr05', status: 'PENDENTE' }),
      update: jest.fn().mockResolvedValue([1, [{ id_solicitacao: 's-tr05', status: 'CANCELADA' }]]),
    });

    const result = await new UpdateSolicitacaoUseCase(repository as any).execute('s-tr05', {
      status: 'CANCELADA',
    } as any);

    expect(result.status).toBe('CANCELADA');
  });

  /**
   * TC-TR-06
   * Transição: ORCAMENTO_CRIADO → CANCELADA
   * Ação: cliente rejeita orçamento
   */
  it('TC-TR-06: ORCAMENTO_CRIADO → CANCELADA quando cliente rejeita orçamento', async () => {
    const repository = repo({
      findById: jest.fn().mockResolvedValue({ id_solicitacao: 's-tr06', status: 'ORCAMENTO_CRIADO' }),
      update: jest.fn().mockResolvedValue([1, [{ id_solicitacao: 's-tr06', status: 'CANCELADA' }]]),
    });

    const result = await new UpdateSolicitacaoUseCase(repository as any).execute('s-tr06', {
      status: 'CANCELADA',
    } as any);

    expect(result.status).toBe('CANCELADA');
  });
});

// ---------------------------------------------------------------------------
// COBERTURA DE CAMINHOS (SEQUÊNCIAS ESPECÍFICAS)
// ---------------------------------------------------------------------------

describe('Máquina de Estados — Cobertura de Caminhos', () => {
  /**
   * TC-PATH-01
   * Caminho: PENDENTE → EM_ANALISE → ORCAMENTO_CRIADO → ORCAMENTO_APROVADO
   * Fluxo feliz completo de uma solicitação aprovada.
   */
  it('TC-PATH-01: caminho feliz completo — PENDENTE → EM_ANALISE → ORCAMENTO_CRIADO → ORCAMENTO_APROVADO', async () => {
    const estados: string[] = [];

    // Passo 1: Criar solicitação (PENDENTE)
    const solicitacaoRepo = repo({
      create: jest.fn().mockResolvedValue({ id_solicitacao: 'path-01', status: 'PENDENTE' }),
    });
    const clienteRepo = repo({ findById: jest.fn().mockResolvedValue({ id_cliente: 'c-1' }) });

    const criada = await new CreateSolicitacaoUseCase(solicitacaoRepo as any, clienteRepo as any).execute(
      'c-1',
      { site: 'https://path01.com', tipo_pacote: 'AA' } as any,
    );
    estados.push(criada.status);
    expect(criada.status).toBe('PENDENTE');

    // Passo 2: Iniciar análise (EM_ANALISE)
    const repoAnalise = repo({
      findById: jest.fn().mockResolvedValue({ id_solicitacao: 'path-01', status: 'PENDENTE' }),
      update: jest.fn().mockResolvedValue([1, [{ id_solicitacao: 'path-01', status: 'EM_ANALISE' }]]),
    });
    const emAnalise = await new UpdateSolicitacaoUseCase(repoAnalise as any).execute('path-01', {
      status: 'EM_ANALISE',
    } as any);
    estados.push(emAnalise.status);
    expect(emAnalise.status).toBe('EM_ANALISE');

    // Passo 3: Criar orçamento (ORCAMENTO_CRIADO)
    const solicitacaoRepoOrc = repo({
      findById: jest.fn().mockResolvedValue({
        id_solicitacao: 'path-01',
        id_cliente: 'c-1',
        tipo_pacote: 'AA',
        status: 'EM_ANALISE',
      }),
      update: jest.fn(),
    });
    await new CreateOrcamentoFromSolicitacaoUseCase(
      solicitacaoRepoOrc as any,
      { execute: jest.fn().mockResolvedValue({ id_pacote: 'p-path01' }) } as any,
      { execute: jest.fn().mockResolvedValue({ cod_orcamento: 'o-path01' }) } as any,
      repo() as any,
    ).execute('path-01');
    expect(solicitacaoRepoOrc.update).toHaveBeenCalledWith(
      'path-01',
      expect.objectContaining({ status: 'ORCAMENTO_CRIADO' }),
    );
    estados.push('ORCAMENTO_CRIADO');

    // Passo 4: Aprovar orçamento (ORCAMENTO_APROVADO)
    const repoAprovacao = repo({
      findById: jest.fn().mockResolvedValue({ id_solicitacao: 'path-01', status: 'ORCAMENTO_CRIADO' }),
      update: jest
        .fn()
        .mockResolvedValue([1, [{ id_solicitacao: 'path-01', status: 'ORCAMENTO_APROVADO' }]]),
    });
    const aprovada = await new UpdateSolicitacaoUseCase(repoAprovacao as any).execute('path-01', {
      status: 'ORCAMENTO_APROVADO',
    } as any);
    estados.push(aprovada.status);
    expect(aprovada.status).toBe('ORCAMENTO_APROVADO');

    // Verificar sequência completa do caminho
    expect(estados).toEqual(['PENDENTE', 'EM_ANALISE', 'ORCAMENTO_CRIADO', 'ORCAMENTO_APROVADO']);
  });

  /**
   * TC-PATH-02
   * Caminho: PENDENTE → CANCELADA
   * Cancelamento antecipado antes de qualquer análise.
   */
  it('TC-PATH-02: cancelamento antecipado — PENDENTE → CANCELADA', async () => {
    const estados: string[] = [];

    // Passo 1: Criar solicitação (PENDENTE)
    const solicitacaoRepo = repo({
      create: jest.fn().mockResolvedValue({ id_solicitacao: 'path-02', status: 'PENDENTE' }),
    });
    const clienteRepo = repo({ findById: jest.fn().mockResolvedValue({ id_cliente: 'c-1' }) });

    const criada = await new CreateSolicitacaoUseCase(solicitacaoRepo as any, clienteRepo as any).execute(
      'c-1',
      { site: 'https://path02.com', tipo_pacote: 'A' } as any,
    );
    estados.push(criada.status);

    // Passo 2: Cancelar imediatamente (CANCELADA)
    const repoCancelamento = repo({
      findById: jest.fn().mockResolvedValue({ id_solicitacao: 'path-02', status: 'PENDENTE' }),
      update: jest.fn().mockResolvedValue([1, [{ id_solicitacao: 'path-02', status: 'CANCELADA' }]]),
    });
    const cancelada = await new UpdateSolicitacaoUseCase(repoCancelamento as any).execute('path-02', {
      status: 'CANCELADA',
    } as any);
    estados.push(cancelada.status);

    expect(estados).toEqual(['PENDENTE', 'CANCELADA']);
    expect(cancelada.status).toBe('CANCELADA');
  });

  /**
   * TC-PATH-03
   * Caminho: PENDENTE → EM_ANALISE → CANCELADA
   * Cancelamento durante a análise.
   */
  it('TC-PATH-03: cancelamento durante análise — PENDENTE → EM_ANALISE → CANCELADA', async () => {
    const estados: string[] = [];

    // Passo 1: PENDENTE
    const solicitacaoRepo = repo({
      create: jest.fn().mockResolvedValue({ id_solicitacao: 'path-03', status: 'PENDENTE' }),
    });
    const clienteRepo = repo({ findById: jest.fn().mockResolvedValue({ id_cliente: 'c-1' }) });

    const criada = await new CreateSolicitacaoUseCase(solicitacaoRepo as any, clienteRepo as any).execute(
      'c-1',
      { site: 'https://path03.com', tipo_pacote: 'AAA' } as any,
    );
    estados.push(criada.status);

    // Passo 2: EM_ANALISE
    const repoAnalise = repo({
      findById: jest.fn().mockResolvedValue({ id_solicitacao: 'path-03', status: 'PENDENTE' }),
      update: jest.fn().mockResolvedValue([1, [{ id_solicitacao: 'path-03', status: 'EM_ANALISE' }]]),
    });
    const emAnalise = await new UpdateSolicitacaoUseCase(repoAnalise as any).execute('path-03', {
      status: 'EM_ANALISE',
    } as any);
    estados.push(emAnalise.status);

    // Passo 3: CANCELADA
    const repoCancelamento = repo({
      findById: jest.fn().mockResolvedValue({ id_solicitacao: 'path-03', status: 'EM_ANALISE' }),
      update: jest.fn().mockResolvedValue([1, [{ id_solicitacao: 'path-03', status: 'CANCELADA' }]]),
    });
    const cancelada = await new UpdateSolicitacaoUseCase(repoCancelamento as any).execute('path-03', {
      status: 'CANCELADA',
    } as any);
    estados.push(cancelada.status);

    expect(estados).toEqual(['PENDENTE', 'EM_ANALISE', 'CANCELADA']);
  });

  /**
   * TC-PATH-04
   * Caminho: PENDENTE → EM_ANALISE → ORCAMENTO_CRIADO → CANCELADA
   * Rejeição do orçamento pelo cliente.
   */
  it('TC-PATH-04: rejeição do orçamento — PENDENTE → EM_ANALISE → ORCAMENTO_CRIADO → CANCELADA', async () => {
    const estados: string[] = [];

    // Passo 1: PENDENTE
    const solicitacaoRepo = repo({
      create: jest.fn().mockResolvedValue({ id_solicitacao: 'path-04', status: 'PENDENTE' }),
    });
    const clienteRepo = repo({ findById: jest.fn().mockResolvedValue({ id_cliente: 'c-1' }) });

    const criada = await new CreateSolicitacaoUseCase(solicitacaoRepo as any, clienteRepo as any).execute(
      'c-1',
      { site: 'https://path04.com', tipo_pacote: 'AA' } as any,
    );
    estados.push(criada.status);

    // Passo 2: EM_ANALISE
    const repoAnalise = repo({
      findById: jest.fn().mockResolvedValue({ id_solicitacao: 'path-04', status: 'PENDENTE' }),
      update: jest.fn().mockResolvedValue([1, [{ id_solicitacao: 'path-04', status: 'EM_ANALISE' }]]),
    });
    const emAnalise = await new UpdateSolicitacaoUseCase(repoAnalise as any).execute('path-04', {
      status: 'EM_ANALISE',
    } as any);
    estados.push(emAnalise.status);

    // Passo 3: ORCAMENTO_CRIADO
    const solicitacaoRepoOrc = repo({
      findById: jest.fn().mockResolvedValue({
        id_solicitacao: 'path-04',
        id_cliente: 'c-1',
        tipo_pacote: 'AA',
        status: 'EM_ANALISE',
      }),
      update: jest.fn(),
    });
    await new CreateOrcamentoFromSolicitacaoUseCase(
      solicitacaoRepoOrc as any,
      { execute: jest.fn().mockResolvedValue({ id_pacote: 'p-path04' }) } as any,
      { execute: jest.fn().mockResolvedValue({ cod_orcamento: 'o-path04' }) } as any,
      repo() as any,
    ).execute('path-04');
    estados.push('ORCAMENTO_CRIADO');

    // Passo 4: CANCELADA (cliente rejeita)
    const repoCancelamento = repo({
      findById: jest.fn().mockResolvedValue({ id_solicitacao: 'path-04', status: 'ORCAMENTO_CRIADO' }),
      update: jest.fn().mockResolvedValue([1, [{ id_solicitacao: 'path-04', status: 'CANCELADA' }]]),
    });
    const cancelada = await new UpdateSolicitacaoUseCase(repoCancelamento as any).execute('path-04', {
      status: 'CANCELADA',
    } as any);
    estados.push(cancelada.status);

    expect(estados).toEqual(['PENDENTE', 'EM_ANALISE', 'ORCAMENTO_CRIADO', 'CANCELADA']);
    expect(cancelada.status).toBe('CANCELADA');
  });

  /**
   * Teste adicional: transições inválidas são bloqueadas (estado inexistente)
   */
  it('TC-PATH-05: transição bloqueada quando solicitação não existe', async () => {
    const repository = repo({ findById: jest.fn().mockResolvedValue(null) });

    await expect(
      new UpdateSolicitacaoUseCase(repository as any).execute('s-inexistente', {
        status: 'EM_ANALISE',
      } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  /**
   * Teste adicional: não é possível criar orçamento quando já existe
   */
  it('TC-PATH-06: criação de orçamento duplicada na mesma solicitação lança ConflictException', async () => {
    const solicitacaoRepo = repo({
      findById: jest.fn().mockResolvedValue({
        id_solicitacao: 's-dup',
        id_cliente: 'c-1',
        tipo_pacote: 'A',
        cod_orcamento: 'o-existente',
      }),
    });

    await expect(
      new CreateOrcamentoFromSolicitacaoUseCase(
        solicitacaoRepo as any,
        {} as any,
        {} as any,
        {} as any,
      ).execute('s-dup'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

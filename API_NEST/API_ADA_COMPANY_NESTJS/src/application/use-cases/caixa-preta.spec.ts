/**
 * Testes de Caixa Preta — Partição de Equivalência e Análise de Valor Limite
 *
 * Técnica: Partição de Equivalência (PE) e Análise de Valor Limite (VL)
 * Módulos cobertos: CreateSolicitacao, CreateCliente, CreateOrcamento,
 *                   CreateOrcamentoFromSolicitacao, UpdateSolicitacao
 *
 * Referência: PLANO_DE_TESTES.md — Seções 8, 9 e 10
 */

import {
  ConflictException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { CreateClienteUseCase } from './cliente/create-cliente.use-case';
import { CreateOrcamentoUseCase } from './orcamento/create-orcamento.use-case';
import { CreateOrcamentoFromSolicitacaoUseCase } from './solicitacao/create-orcamento-from-solicitacao.use-case';
import { CreateSolicitacaoUseCase } from './solicitacao/create-solicitacao.use-case';
import { UpdateSolicitacaoUseCase } from './solicitacao/update-solicitacao.use-case';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hash-seguro'),
}));

const repo = (overrides: Record<string, jest.Mock> = {}) => ({
  create: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
  findByCliente: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findByIdUsuario: jest.fn(),
  findByPacote: jest.fn(),
  findByUsuario: jest.fn(),
  update: jest.fn(),
  ...overrides,
});

// ---------------------------------------------------------------------------
// PE-SOL — CreateSolicitacaoUseCase
// ---------------------------------------------------------------------------

describe('Caixa Preta — CreateSolicitacaoUseCase (Partição de Equivalência)', () => {
  /**
   * TC-CB-01 | PE-SOL-01
   * Partição VÁLIDA: cliente existe → solicitação criada com status PENDENTE
   */
  it('TC-CB-01 | PE-SOL-01: cria solicitação quando cliente existe (partição válida)', async () => {
    const solicitacaoRepo = repo({
      create: jest
        .fn()
        .mockResolvedValue({ id_solicitacao: 's-1', status: 'PENDENTE' }),
    });
    const clienteRepo = repo({
      findById: jest.fn().mockResolvedValue({ id_cliente: 'c-1' }),
    });

    const result = await new CreateSolicitacaoUseCase(
      solicitacaoRepo as any,
      clienteRepo as any,
    ).execute('c-1', { site: 'https://site.com', tipo_pacote: 'AA' } as any);

    expect(result).toMatchObject({ id_solicitacao: 's-1' });
    expect(solicitacaoRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ id_cliente: 'c-1', status: 'PENDENTE' }),
    );
  });

  /**
   * TC-CB-02 | PE-SOL-02
   * Partição INVÁLIDA: cliente não existe → NotFoundException
   */
  it('TC-CB-02 | PE-SOL-02: lança NotFoundException quando cliente não existe (partição inválida)', async () => {
    await expect(
      new CreateSolicitacaoUseCase(
        repo() as any,
        repo({ findById: jest.fn().mockResolvedValue(null) }) as any,
      ).execute('id-inexistente', {} as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  /**
   * TC-CB-03 | PE-SOL-03
   * Partição VÁLIDA: tipo_pacote = 'A' (limite inferior de tipo)
   */
  it("TC-CB-03 | PE-SOL-03: cria solicitação com tipo_pacote 'A' (partição válida)", async () => {
    const solicitacaoRepo = repo({
      create: jest.fn().mockResolvedValue({
        id_solicitacao: 's-2',
        status: 'PENDENTE',
        tipo_pacote: 'A',
      }),
    });
    const clienteRepo = repo({
      findById: jest.fn().mockResolvedValue({ id_cliente: 'c-1' }),
    });

    const result = await new CreateSolicitacaoUseCase(
      solicitacaoRepo as any,
      clienteRepo as any,
    ).execute('c-1', { site: 'https://a.com', tipo_pacote: 'A' } as any);

    expect(result).toMatchObject({ status: 'PENDENTE' });
  });

  /**
   * TC-CB-04 | PE-SOL-04
   * Partição VÁLIDA: tipo_pacote = 'AA' (valor central)
   */
  it("TC-CB-04 | PE-SOL-04: cria solicitação com tipo_pacote 'AA' (partição válida)", async () => {
    const solicitacaoRepo = repo({
      create: jest.fn().mockResolvedValue({
        id_solicitacao: 's-3',
        status: 'PENDENTE',
        tipo_pacote: 'AA',
      }),
    });
    const clienteRepo = repo({
      findById: jest.fn().mockResolvedValue({ id_cliente: 'c-1' }),
    });

    const result = await new CreateSolicitacaoUseCase(
      solicitacaoRepo as any,
      clienteRepo as any,
    ).execute('c-1', { site: 'https://aa.com', tipo_pacote: 'AA' } as any);

    expect(result).toMatchObject({ tipo_pacote: 'AA' });
  });

  /**
   * TC-CB-05 | PE-SOL-05
   * Partição VÁLIDA: tipo_pacote = 'AAA' (limite superior de tipo)
   */
  it("TC-CB-05 | PE-SOL-05: cria solicitação com tipo_pacote 'AAA' (partição válida)", async () => {
    const solicitacaoRepo = repo({
      create: jest.fn().mockResolvedValue({
        id_solicitacao: 's-4',
        status: 'PENDENTE',
        tipo_pacote: 'AAA',
      }),
    });
    const clienteRepo = repo({
      findById: jest.fn().mockResolvedValue({ id_cliente: 'c-1' }),
    });

    const result = await new CreateSolicitacaoUseCase(
      solicitacaoRepo as any,
      clienteRepo as any,
    ).execute('c-1', { site: 'https://aaa.com', tipo_pacote: 'AAA' } as any);

    expect(result).toMatchObject({ tipo_pacote: 'AAA' });
  });
});

// ---------------------------------------------------------------------------
// PE-CLI — CreateClienteUseCase
// ---------------------------------------------------------------------------

describe('Caixa Preta — CreateClienteUseCase (Partição de Equivalência)', () => {
  const dto: any = {
    nome_completo: 'Maria Silva',
    email: 'maria@email.com',
    senha: 'senha123',
    telefone: '11999990000',
    cnpj: '11.222.333/0001-44',
  };

  /**
   * TC-CB-06 | PE-CLI-01
   * Partição VÁLIDA: e-mail único → cliente criado com senha hasheada
   */
  it('TC-CB-06 | PE-CLI-01: cadastra cliente com e-mail único e senha hasheada (partição válida)', async () => {
    const clienteRepo = repo({
      create: jest.fn().mockResolvedValue({ id_cliente: 'c-new' }),
      findById: jest.fn().mockResolvedValue({ id_cliente: 'c-new', ...dto }),
    });
    const usuarioRepo = repo({
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id_usuario: 'u-1' }),
    });

    const result = await new CreateClienteUseCase(
      clienteRepo as any,
      usuarioRepo as any,
    ).execute(dto);

    expect(result).toMatchObject({ id_cliente: 'c-new' });
    expect(usuarioRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        senha: 'hash-seguro',
        tipo_usuario: 'cliente',
      }),
    );
  });

  /**
   * TC-CB-07 | PE-CLI-02
   * Partição INVÁLIDA: e-mail duplicado → HttpException
   */
  it('TC-CB-07 | PE-CLI-02: bloqueia cadastro com e-mail já registrado (partição inválida)', async () => {
    await expect(
      new CreateClienteUseCase(
        repo() as any,
        repo({
          findByEmail: jest
            .fn()
            .mockResolvedValue({ id_usuario: 'u-existente' }),
        }) as any,
      ).execute(dto),
    ).rejects.toBeInstanceOf(HttpException);
  });

  /**
   * TC-CB-08 | PE-CLI-03
   * Partição INVÁLIDA: falha de banco de dados → HttpException (500)
   */
  it('TC-CB-08 | PE-CLI-03: converte erro de banco em HttpException 500 (partição inválida)', async () => {
    await expect(
      new CreateClienteUseCase(
        repo() as any,
        repo({
          findByEmail: jest
            .fn()
            .mockRejectedValue(new Error('conexão perdida')),
        }) as any,
      ).execute(dto),
    ).rejects.toMatchObject({ status: 500 });
  });

  /**
   * TC-CB-06b | PE-CLI-04
   * Partição VÁLIDA: senha deve ser armazenada como hash, nunca em texto puro
   */
  it('TC-CB-06b | PE-CLI-04: senha nunca armazenada em texto puro (partição válida — segurança)', async () => {
    const clienteRepo = repo({
      create: jest.fn().mockResolvedValue({ id_cliente: 'c-sec' }),
      findById: jest.fn().mockResolvedValue({ id_cliente: 'c-sec' }),
    });
    const usuarioRepo = repo({
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id_usuario: 'u-sec' }),
    });

    await new CreateClienteUseCase(
      clienteRepo as any,
      usuarioRepo as any,
    ).execute(dto);

    const chamada = usuarioRepo.create.mock.calls[0][0];
    expect(chamada.senha).not.toBe(dto.senha);
    expect(chamada.senha).toBe('hash-seguro');
  });
});

// ---------------------------------------------------------------------------
// PE-ORC — CreateOrcamentoUseCase
// ---------------------------------------------------------------------------

describe('Caixa Preta — CreateOrcamentoUseCase (Partição de Equivalência + Valor Limite)', () => {
  /**
   * TC-CB-09 | PE-ORC-01
   * Partição VÁLIDA: pacote existe e não tem orçamento → orçamento criado
   */
  it('TC-CB-09 | PE-ORC-01: cria orçamento para pacote sem orçamento prévio (partição válida)', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-01T00:00:00Z'));

    const orcamentoRepo = repo({
      findByPacote: jest.fn().mockResolvedValue(null),
      create: jest
        .fn()
        .mockResolvedValue({ cod_orcamento: 'o-1', valor_orcamento: 1500 }),
    });
    const pacoteRepo = repo({
      findById: jest.fn().mockResolvedValue({ id_pacote: 'p-1' }),
    });

    const result = await new CreateOrcamentoUseCase(
      orcamentoRepo as any,
      pacoteRepo as any,
    ).execute({
      id_pacote: 'p-1',
      valor_orcamento: 1500,
    } as any);

    expect(result).toMatchObject({ cod_orcamento: 'o-1' });
    jest.useRealTimers();
  });

  /**
   * TC-CB-12 | VL-05
   * Análise de Valor Limite: data_validade deve ser exatamente hoje + 30 dias
   */
  it('TC-CB-12 | VL-05: validade do orçamento é exatamente hoje + 30 dias (valor limite temporal)', async () => {
    const dataBase = new Date('2026-04-01T00:00:00Z');
    const dataEsperada = new Date('2026-05-01T00:00:00Z');
    jest.useFakeTimers().setSystemTime(dataBase);

    const orcamentoRepo = repo({
      findByPacote: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ cod_orcamento: 'o-val' }),
    });
    const pacoteRepo = repo({
      findById: jest.fn().mockResolvedValue({ id_pacote: 'p-1' }),
    });

    await new CreateOrcamentoUseCase(
      orcamentoRepo as any,
      pacoteRepo as any,
    ).execute({
      id_pacote: 'p-1',
    } as any);

    expect(orcamentoRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data_orcamento: dataBase,
        data_validade: dataEsperada,
      }),
    );
    jest.useRealTimers();
  });

  /**
   * TC-CB-10 | PE-ORC-02
   * Partição INVÁLIDA: pacote inexistente → NotFoundException
   */
  it('TC-CB-10 | PE-ORC-02: lança NotFoundException quando pacote não existe (partição inválida)', async () => {
    const orcamentoRepo = repo({
      findByPacote: jest.fn().mockResolvedValue(null),
    });
    const pacoteRepo = repo({ findById: jest.fn().mockResolvedValue(null) });

    await expect(
      new CreateOrcamentoUseCase(
        orcamentoRepo as any,
        pacoteRepo as any,
      ).execute({ id_pacote: 'p-x' } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  /**
   * TC-CB-11 | PE-ORC-03
   * Partição INVÁLIDA: orçamento duplicado → ConflictException
   */
  it('TC-CB-11 | PE-ORC-03: lança ConflictException para orçamento duplicado (partição inválida)', async () => {
    const orcamentoRepo = repo({
      findByPacote: jest
        .fn()
        .mockResolvedValue({ cod_orcamento: 'o-existente' }),
    });

    await expect(
      new CreateOrcamentoUseCase(orcamentoRepo as any, repo() as any).execute({
        id_pacote: 'p-1',
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

// ---------------------------------------------------------------------------
// VL — CreateOrcamentoFromSolicitacaoUseCase (Análise de Valor Limite por tipo)
// ---------------------------------------------------------------------------

describe('Caixa Preta — CreateOrcamentoFromSolicitacaoUseCase (Análise de Valor Limite)', () => {
  const buildUseCase = (tipoPacote: string) => {
    const solicitacaoRepo = repo({
      findById: jest.fn().mockResolvedValue({
        id_solicitacao: 's-1',
        id_cliente: 'c-1',
        tipo_pacote: tipoPacote,
      }),
      update: jest.fn(),
    });
    const createPacoteUseCase = {
      execute: jest.fn().mockResolvedValue({ id_pacote: 'p-novo' }),
    };
    const createOrcamentoUseCase = {
      execute: jest.fn().mockResolvedValue({ cod_orcamento: 'o-1' }),
    };

    return { solicitacaoRepo, createPacoteUseCase, createOrcamentoUseCase };
  };

  /**
   * TC-CB-13 | VL-01
   * Valor Limite INFERIOR: tipo 'A' → valor base = R$ 1.000 (mínimo)
   */
  it("TC-CB-13 | VL-01: tipo 'A' gera valor base R$ 1.000 (limite inferior)", async () => {
    const { solicitacaoRepo, createPacoteUseCase, createOrcamentoUseCase } =
      buildUseCase('A');

    await new CreateOrcamentoFromSolicitacaoUseCase(
      solicitacaoRepo as any,
      createPacoteUseCase as any,
      createOrcamentoUseCase as any,
      repo() as any,
    ).execute('s-1');

    expect(createPacoteUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ valor_base: 1000 }),
    );
  });

  /**
   * TC-CB-14 | VL-02
   * Valor Central: tipo 'AA' → valor base = R$ 1.500
   */
  it("TC-CB-14 | VL-02: tipo 'AA' gera valor base R$ 1.500 (valor central)", async () => {
    const { solicitacaoRepo, createPacoteUseCase, createOrcamentoUseCase } =
      buildUseCase('AA');

    await new CreateOrcamentoFromSolicitacaoUseCase(
      solicitacaoRepo as any,
      createPacoteUseCase as any,
      createOrcamentoUseCase as any,
      repo() as any,
    ).execute('s-1');

    expect(createPacoteUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ valor_base: 1500 }),
    );
  });

  /**
   * TC-CB-15 | VL-03
   * Valor Limite SUPERIOR: tipo 'AAA' → valor base = R$ 2.000 (máximo)
   */
  it("TC-CB-15 | VL-03: tipo 'AAA' gera valor base R$ 2.000 (limite superior)", async () => {
    const { solicitacaoRepo, createPacoteUseCase, createOrcamentoUseCase } =
      buildUseCase('AAA');

    await new CreateOrcamentoFromSolicitacaoUseCase(
      solicitacaoRepo as any,
      createPacoteUseCase as any,
      createOrcamentoUseCase as any,
      repo() as any,
    ).execute('s-1');

    expect(createPacoteUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ valor_base: 2000 }),
    );
  });

  /**
   * TC-CB-16 | VL-04
   * Fora dos limites: tipo desconhecido + pacote não encontrado → fallback R$ 1.500
   */
  it('TC-CB-16 | VL-04: tipo desconhecido sem pacote existente usa fallback R$ 1.500 (fora dos limites)', async () => {
    const solicitacaoRepo = repo({
      findById: jest.fn().mockResolvedValue({
        id_solicitacao: 's-1',
        id_cliente: 'c-1',
        tipo_pacote: 'ZZ',
        id_pacote: 'p-inexistente',
      }),
      update: jest.fn(),
    });
    const createOrcamentoUseCase = {
      execute: jest.fn().mockResolvedValue({ cod_orcamento: 'o-1' }),
    };
    const pacoteRepo = repo({ findById: jest.fn().mockResolvedValue(null) });

    await new CreateOrcamentoFromSolicitacaoUseCase(
      solicitacaoRepo as any,
      { execute: jest.fn() } as any,
      createOrcamentoUseCase as any,
      pacoteRepo as any,
    ).execute('s-1');

    expect(createOrcamentoUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ valor_orcamento: 1500 }),
    );
  });
});

// ---------------------------------------------------------------------------
// PE-UPD — UpdateSolicitacaoUseCase
// ---------------------------------------------------------------------------

describe('Caixa Preta — UpdateSolicitacaoUseCase (Partição de Equivalência)', () => {
  /**
   * TC-CB-17 | PE-UPD-01
   * Partição VÁLIDA: solicitação existe e update afeta 1 linha
   */
  it('TC-CB-17 | PE-UPD-01: atualiza solicitação existente e retorna linha afetada (partição válida)', async () => {
    const repository = repo({
      findById: jest.fn().mockResolvedValue({ id_solicitacao: 's-1' }),
      update: jest
        .fn()
        .mockResolvedValue([
          1,
          [{ id_solicitacao: 's-1', status: 'EM_ANALISE' }],
        ]),
    });

    const result = await new UpdateSolicitacaoUseCase(
      repository as any,
    ).execute('s-1', {
      status: 'EM_ANALISE',
    } as any);

    expect(result).toMatchObject({ status: 'EM_ANALISE' });
  });

  /**
   * TC-CB-18 | PE-UPD-02
   * Partição INVÁLIDA: solicitação não encontrada → NotFoundException
   */
  it('TC-CB-18 | PE-UPD-02: lança NotFoundException quando solicitação não existe (partição inválida)', async () => {
    await expect(
      new UpdateSolicitacaoUseCase(
        repo({ findById: jest.fn().mockResolvedValue(null) }) as any,
      ).execute('s-inexistente', {} as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  /**
   * TC-CB-19 | PE-UPD-03
   * Partição INVÁLIDA: update afeta 0 linhas → NotFoundException
   */
  it('TC-CB-19 | PE-UPD-03: lança NotFoundException quando update afeta 0 linhas (partição inválida)', async () => {
    await expect(
      new UpdateSolicitacaoUseCase(
        repo({
          findById: jest.fn().mockResolvedValue({ id_solicitacao: 's-1' }),
          update: jest.fn().mockResolvedValue([0, []]),
        }) as any,
      ).execute('s-1', {} as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

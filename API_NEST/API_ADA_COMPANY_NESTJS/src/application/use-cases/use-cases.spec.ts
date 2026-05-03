import { BadRequestException, ConflictException, HttpException, NotFoundException } from '@nestjs/common';
import { CreateClienteUseCase } from './cliente/create-cliente.use-case';
import { DeleteClienteUseCase } from './cliente/delete-cliente.use-case';
import { GetClienteByEmailUseCase } from './cliente/get-cliente-by-email.use-case';
import { GetClienteByUsuarioUseCase } from './cliente/get-cliente-by-usuario.use-case';
import { GetClienteUseCase } from './cliente/get-cliente.use-case';
import { ListClientesUseCase } from './cliente/list-clientes.use-case';
import { UpdateClienteUseCase } from './cliente/update-cliente.use-case';
import { CreateContratoUseCase } from './contrato/create-contrato.use-case';
import { DeleteContratoUseCase } from './contrato/delete-contrato.use-case';
import { GetContratoUseCase } from './contrato/get-contrato.use-case';
import { ListContratosUseCase } from './contrato/list-contratos.use-case';
import { SignContratoUseCase } from './contrato/sign-contrato.use-case';
import { UpdateContratoUseCase } from './contrato/update-contrato.use-case';
import { CreateFuncionarioUseCase } from './funcionario/create-funcionario.use-case';
import { DeleteFuncionarioUseCase } from './funcionario/delete-funcionario.use-case';
import { GetFuncionarioByEmailUseCase } from './funcionario/get-funcionario-by-email.use-case';
import { GetFuncionarioUseCase } from './funcionario/get-funcionario.use-case';
import { ListFuncionariosUseCase } from './funcionario/list-funcionarios.use-case';
import { UpdateFuncionarioUseCase } from './funcionario/update-funcionario.use-case';
import { CreateLogUseCase } from './log/create-log.use-case';
import { DeleteOldLogsUseCase } from './log/delete-old-logs.use-case';
import { GetLogStatsUseCase } from './log/get-log-stats.use-case';
import { GetLogUseCase } from './log/get-log.use-case';
import { GetLogsByDateRangeUseCase } from './log/get-logs-by-date-range.use-case';
import { GetLogsByLevelUseCase } from './log/get-logs-by-level.use-case';
import { GetLogsByUserUseCase } from './log/get-logs-by-user.use-case';
import { ListLogsUseCase } from './log/list-logs.use-case';
import { CreateNotificacaoUseCase } from './notificacao/create-notificacao.use-case';
import { GetNotificacoesUseCase } from './notificacao/get-notificacoes.use-case';
import { MarcarNotificacaoLidaUseCase } from './notificacao/marcar-notificacao-lida.use-case';
import { CreateOrcamentoUseCase } from './orcamento/create-orcamento.use-case';
import { DeleteOrcamentoUseCase } from './orcamento/delete-orcamento.use-case';
import { GetOrcamentoUseCase } from './orcamento/get-orcamento.use-case';
import { ListOrcamentosUseCase } from './orcamento/list-orcamentos.use-case';
import { UpdateOrcamentoUseCase } from './orcamento/update-orcamento.use-case';
import { CreatePacoteUseCase } from './pacote/create-pacote.use-case';
import { DeletePacoteUseCase } from './pacote/delete-pacote.use-case';
import { GetPacoteUseCase } from './pacote/get-pacote.use-case';
import { ListPacotesUseCase } from './pacote/list-pacotes.use-case';
import { UpdatePacoteUseCase } from './pacote/update-pacote.use-case';
import { CreateOrcamentoFromSolicitacaoUseCase } from './solicitacao/create-orcamento-from-solicitacao.use-case';
import { CreateSolicitacaoUseCase } from './solicitacao/create-solicitacao.use-case';
import { GetSolicitacaoUseCase } from './solicitacao/get-solicitacao.use-case';
import { GetSolicitacoesByClienteUseCase } from './solicitacao/get-solicitacoes-by-cliente.use-case';
import { ListSolicitacoesUseCase } from './solicitacao/list-solicitacoes.use-case';
import { UpdateSolicitacaoUseCase } from './solicitacao/update-solicitacao.use-case';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('senha-hash'),
}));

const repo = (overrides: Record<string, jest.Mock> = {}) => ({
  create: jest.fn(),
  delete: jest.fn(),
  deleteOldLogs: jest.fn(),
  findAll: jest.fn(),
  findByCliente: jest.fn(),
  findByDateRange: jest.fn(),
  findByEmail: jest.fn(),
  findByFilters: jest.fn(),
  findById: jest.fn(),
  findByIdUsuario: jest.fn(),
  findByLevel: jest.fn(),
  findByPacote: jest.fn(),
  findByUser: jest.fn(),
  findByUserId: jest.fn(),
  findByUsuario: jest.fn(),
  findNaoLidasByUserId: jest.fn(),
  findOne: jest.fn(),
  getStats: jest.fn(),
  getLogStats: jest.fn(),
  listarPorUsuario: jest.fn(),
  marcarComoLida: jest.fn(),
  marcarTodasComoLidas: jest.fn(),
  update: jest.fn(),
  ...overrides,
});

describe('use cases simples', () => {
  it.each([
    [GetClienteUseCase, 'findById', ['id-1']],
    [GetClienteByEmailUseCase, 'findByEmail', ['ana@email.com']],
    [GetClienteByUsuarioUseCase, 'findByIdUsuario', ['user-1']],
    [ListClientesUseCase, 'findAll', []],
    [GetContratoUseCase, 'findById', ['id-1']],
    [ListContratosUseCase, 'findAll', []],
    [GetFuncionarioUseCase, 'findById', ['id-1']],
    [GetFuncionarioByEmailUseCase, 'findByEmail', ['ana@email.com']],
    [ListFuncionariosUseCase, 'findAll', []],
    [GetOrcamentoUseCase, 'findById', ['id-1']],
    [ListOrcamentosUseCase, 'findAll', []],
    [GetPacoteUseCase, 'findById', ['id-1']],
    [ListPacotesUseCase, 'findAll', []],
    [GetSolicitacaoUseCase, 'findById', ['id-1']],
    [GetSolicitacoesByClienteUseCase, 'findByCliente', ['cliente-1']],
    [ListSolicitacoesUseCase, 'findAll', []],
  ])('%p delega para %s', async (UseCase: any, method: string, args: any[]) => {
    const repository = repo({ [method]: jest.fn().mockResolvedValue('resultado') });
    await expect(new UseCase(repository).execute(...args)).resolves.toBe('resultado');
    expect(repository[method]).toHaveBeenCalledWith(...args);
  });

  it.each([
    [DeleteContratoUseCase],
    [DeleteOrcamentoUseCase],
  ])('%p delega exclusao direta', async (UseCase: any) => {
    const repository = repo({ delete: jest.fn().mockResolvedValue(1) });
    await expect(new UseCase(repository).execute('id-1')).resolves.toBeUndefined();
    expect(repository.delete).toHaveBeenCalledWith('id-1');
  });

  it('DeletePacoteUseCase retorna o resultado do repository', async () => {
    const repository = repo({ delete: jest.fn().mockResolvedValue(1) });
    await expect(new DeletePacoteUseCase(repository as any).execute('id-1')).resolves.toBe(1);
    expect(repository.delete).toHaveBeenCalledWith('id-1');
  });

  it.each([
    [UpdateOrcamentoUseCase],
  ])('%p delega update direto', async (UseCase: any) => {
    const repository = repo({ update: jest.fn().mockResolvedValue(['ok']) });
    await expect(new UseCase(repository).execute('id-1', { status: 'OK' })).resolves.toEqual(['ok']);
    expect(repository.update).toHaveBeenCalledWith('id-1', { status: 'OK' });
  });

  it('UpdatePacoteUseCase atualiza e retorna busca final', async () => {
    const repository = repo({
      update: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue({ id_pacote: 'id-1', status: 'OK' }),
    });
    await expect(new UpdatePacoteUseCase(repository as any).execute('id-1', { status: 'OK' } as any)).resolves.toEqual({ id_pacote: 'id-1', status: 'OK' });
    expect(repository.update).toHaveBeenCalledWith('id-1', { status: 'OK' });
  });

  it('GetLogUseCase falha quando log nao existe', async () => {
    await expect(new GetLogUseCase(repo({ findById: jest.fn().mockResolvedValue(null) }) as any).execute('id', 'ts')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('cliente', () => {
  const dto: any = {
    nome_completo: 'Ana Souza',
    email: 'ana@email.com',
    senha: '123456',
    telefone: '11999999999',
    cnpj: '123',
  };

  it('cria usuario e cliente com senha criptografada', async () => {
    const cliente = { id_cliente: 'cliente-1', ...dto, id_usuario: 'user-1' };
    const clienteRepository = repo({
      create: jest.fn().mockResolvedValue({ id_cliente: 'cliente-1' }),
      findById: jest.fn().mockResolvedValue(cliente),
    });
    const usuarioRepository = repo({
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id_usuario: 'user-1' }),
    });

    await expect(new CreateClienteUseCase(clienteRepository as any, usuarioRepository as any).execute(dto)).resolves.toBe(cliente);
    expect(usuarioRepository.create).toHaveBeenCalledWith(expect.objectContaining({ senha: 'senha-hash', tipo_usuario: 'cliente' }));
    expect(clienteRepository.create).toHaveBeenCalledWith(expect.objectContaining({ id_usuario: 'user-1' }));
  });

  it('bloqueia email ja cadastrado', async () => {
    const useCase = new CreateClienteUseCase(repo() as any, repo({ findByEmail: jest.fn().mockResolvedValue({}) }) as any);
    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(HttpException);
  });

  it('transforma erro inesperado em HttpException', async () => {
    const useCase = new CreateClienteUseCase(repo() as any, repo({ findByEmail: jest.fn().mockRejectedValue(new Error('db off')) }) as any);
    await expect(useCase.execute(dto)).rejects.toMatchObject({ status: 500 });
  });

  it('atualiza cliente existente e retorna registro atualizado', async () => {
    const repository = repo({
      findById: jest.fn().mockResolvedValueOnce({ id_cliente: '1' }).mockResolvedValueOnce({ id_cliente: '1', nome_completo: 'Novo' }),
      update: jest.fn().mockResolvedValue(undefined),
    });
    await expect(new UpdateClienteUseCase(repository as any).execute('1', { nome_completo: 'Novo' } as any)).resolves.toMatchObject({ nome_completo: 'Novo' });
    expect(repository.update).toHaveBeenCalledWith('1', { nome_completo: 'Novo' });
  });

  it('falha ao atualizar cliente inexistente', async () => {
    await expect(new UpdateClienteUseCase(repo({ findById: jest.fn().mockResolvedValue(null) }) as any).execute('1', {} as any)).rejects.toBeInstanceOf(HttpException);
  });

  it('remove cliente existente', async () => {
    const repository = repo({ findById: jest.fn().mockResolvedValue({ id_cliente: '1' }), delete: jest.fn().mockResolvedValue(undefined) });
    await expect(new DeleteClienteUseCase(repository).execute('1')).resolves.toBeUndefined();
    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('falha ao remover cliente inexistente', async () => {
    await expect(new DeleteClienteUseCase(repo({ findById: jest.fn().mockResolvedValue(null) })).execute('1')).rejects.toBeInstanceOf(HttpException);
  });
});

describe('funcionario', () => {
  it('cria usuario funcionario e remove senha do payload do funcionario', async () => {
    const funcionarioRepository = repo({ create: jest.fn().mockResolvedValue({ id_funcionario: 'func-1' }) });
    const usuarioRepository = repo({ create: jest.fn().mockResolvedValue({ id_usuario: 'user-1' }) });
    const dto: any = { nome_completo: 'Joao', email: 'joao@email.com', telefone: '11', senha: '123' };

    await expect(new CreateFuncionarioUseCase(funcionarioRepository as any, usuarioRepository as any).execute(dto)).resolves.toEqual({ id_funcionario: 'func-1' });
    expect(usuarioRepository.create).toHaveBeenCalledWith(expect.objectContaining({ senha: 'senha-hash', tipo_usuario: 'funcionario' }));
    expect(funcionarioRepository.create).toHaveBeenCalledWith(expect.objectContaining({ id_usuario: 'user-1', senha: undefined }));
  });

  it('atualiza funcionario e retorna busca final', async () => {
    const repository = repo({
      findById: jest.fn().mockResolvedValue({ id_funcionario: '1' }),
      update: jest.fn(),
    });
    await expect(new UpdateFuncionarioUseCase(repository as any).execute('1', { nome_completo: 'Novo' } as any)).resolves.toMatchObject({ id_funcionario: '1' });
    expect(repository.update).toHaveBeenCalledWith('1', { nome_completo: 'Novo' });
  });

  it('remove funcionario delegando ao repositorio', async () => {
    const repository = repo({ delete: jest.fn() });
    await expect(new DeleteFuncionarioUseCase(repository as any).execute('1')).resolves.toBeUndefined();
    expect(repository.delete).toHaveBeenCalledWith('1');
  });
});

describe('cadastros com validacao de relacionamento', () => {
  it('cria pacote quando cliente existe', async () => {
    const pacoteRepository = repo({ create: jest.fn().mockResolvedValue({ id_pacote: 'pacote-1' }) });
    const clienteRepository = repo({ findById: jest.fn().mockResolvedValue({ id_cliente: 'cliente-1' }) });
    await expect(new CreatePacoteUseCase(pacoteRepository as any, clienteRepository as any).execute({ id_cliente: 'cliente-1' } as any)).resolves.toEqual({ id_pacote: 'pacote-1' });
  });

  it('falha ao criar pacote sem cliente', async () => {
    await expect(new CreatePacoteUseCase(repo() as any, repo({ findById: jest.fn().mockResolvedValue(null) }) as any).execute({ id_cliente: 'x' } as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('cria contrato convertendo datas quando orcamento existe', async () => {
    const contratoRepository = repo({ create: jest.fn().mockResolvedValue({ cod_contrato: 'c-1' }) });
    const orcamentoRepository = repo({ findById: jest.fn().mockResolvedValue({ cod_orcamento: 'o-1' }) });
    await expect(new CreateContratoUseCase(contratoRepository as any, orcamentoRepository as any).execute({
      cod_orcamento: 'o-1',
      data_inicio: '2026-01-01',
      data_entrega: '2026-01-31',
    } as any)).resolves.toEqual({ cod_contrato: 'c-1' });
    expect(contratoRepository.create).toHaveBeenCalledWith(expect.objectContaining({ data_inicio: expect.any(Date), data_entrega: expect.any(Date) }));
  });

  it('falha ao criar contrato sem orcamento', async () => {
    await expect(new CreateContratoUseCase(repo() as any, repo({ findById: jest.fn().mockResolvedValue(null) }) as any).execute({ cod_orcamento: 'o-1' } as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('cria solicitacao quando cliente existe', async () => {
    const solicitacaoRepository = repo({ create: jest.fn().mockResolvedValue({ id_solicitacao: 's-1' }) });
    const clienteRepository = repo({ findById: jest.fn().mockResolvedValue({ id_cliente: 'cliente-1' }) });
    await expect(new CreateSolicitacaoUseCase(solicitacaoRepository as any, clienteRepository as any).execute('cliente-1', { site: 'https://site.com', tipo_pacote: 'AA' } as any)).resolves.toEqual({ id_solicitacao: 's-1' });
    expect(solicitacaoRepository.create).toHaveBeenCalledWith(expect.objectContaining({ id_cliente: 'cliente-1', status: 'PENDENTE' }));
  });

  it('falha ao criar solicitacao sem cliente', async () => {
    await expect(new CreateSolicitacaoUseCase(repo() as any, repo({ findById: jest.fn().mockResolvedValue(null) }) as any).execute('cliente-1', {} as any)).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('updates com validacao', () => {
  it('atualiza contrato, converte datas e busca orcamento quando codigo muda', async () => {
    const contratoRepository = repo({
      findById: jest.fn()
        .mockResolvedValueOnce({ cod_contrato: 'c-1', cod_orcamento: 'o-antigo' })
        .mockResolvedValueOnce({ cod_contrato: 'c-1', cod_orcamento: 'o-novo' }),
      update: jest.fn().mockResolvedValue([1]),
    });
    const orcamentoRepository = repo({
      findById: jest.fn().mockResolvedValue({ cod_orcamento: 'o-novo', pacote: { id_cliente: 'cliente-1' } }),
    });

    await expect(new UpdateContratoUseCase(contratoRepository as any, orcamentoRepository as any).execute('c-1', {
      cod_orcamento: 'o-novo',
      data_inicio: '2026-01-01',
      data_entrega: '2026-02-01',
    } as any)).resolves.toMatchObject({ cod_orcamento: 'o-novo' });
    expect(contratoRepository.update).toHaveBeenCalledWith('c-1', expect.objectContaining({
      id_cliente: 'cliente-1',
      data_inicio: expect.any(Date),
      data_entrega: expect.any(Date),
    }));
  });

  it('UpdateContratoUseCase falha quando contrato, orcamento ou update nao existem', async () => {
    await expect(new UpdateContratoUseCase(repo({ findById: jest.fn().mockResolvedValue(null) }) as any, repo() as any).execute('c-1', {} as any)).rejects.toBeInstanceOf(NotFoundException);

    await expect(new UpdateContratoUseCase(
      repo({ findById: jest.fn().mockResolvedValue({ cod_orcamento: 'o-antigo' }) }) as any,
      repo({ findById: jest.fn().mockResolvedValue(null) }) as any,
    ).execute('c-1', { cod_orcamento: 'o-novo' } as any)).rejects.toBeInstanceOf(NotFoundException);

    await expect(new UpdateContratoUseCase(
      repo({ findById: jest.fn().mockResolvedValue({ cod_orcamento: 'o-1' }), update: jest.fn().mockResolvedValue([0]) }) as any,
      repo() as any,
    ).execute('c-1', {} as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('atualiza solicitacao e retorna linha afetada', async () => {
    const repository = repo({
      findById: jest.fn().mockResolvedValue({ id_solicitacao: 's-1' }),
      update: jest.fn().mockResolvedValue([1, [{ id_solicitacao: 's-1', status: 'APROVADA' }]]),
    });

    await expect(new UpdateSolicitacaoUseCase(repository as any).execute('s-1', { status: 'APROVADA' } as any)).resolves.toMatchObject({ status: 'APROVADA' });
  });

  it('UpdateSolicitacaoUseCase falha quando nao encontra solicitacao ou update afeta zero linhas', async () => {
    await expect(new UpdateSolicitacaoUseCase(repo({ findById: jest.fn().mockResolvedValue(null) }) as any).execute('s-1', {} as any)).rejects.toBeInstanceOf(NotFoundException);
    await expect(new UpdateSolicitacaoUseCase(repo({
      findById: jest.fn().mockResolvedValue({ id_solicitacao: 's-1' }),
      update: jest.fn().mockResolvedValue([0, []]),
    }) as any).execute('s-1', {} as any)).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('orcamento', () => {
  it('cria orcamento com validade de 30 dias quando pacote existe', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-01T00:00:00Z'));
    const orcamentoRepository = repo({ findByPacote: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({ cod_orcamento: 'o-1' }) });
    const pacoteRepository = repo({ findById: jest.fn().mockResolvedValue({ id_pacote: 'p-1' }) });

    await expect(new CreateOrcamentoUseCase(orcamentoRepository as any, pacoteRepository as any).execute({ id_pacote: 'p-1' } as any)).resolves.toEqual({ cod_orcamento: 'o-1' });
    expect(orcamentoRepository.create).toHaveBeenCalledWith(expect.objectContaining({ data_orcamento: new Date('2026-04-01T00:00:00Z'), data_validade: new Date('2026-05-01T00:00:00Z') }));
    jest.useRealTimers();
  });

  it('falha quando ja existe orcamento para o pacote', async () => {
    await expect(new CreateOrcamentoUseCase(repo({ findByPacote: jest.fn().mockResolvedValue({}) }) as any, repo() as any).execute({ id_pacote: 'p-1' } as any)).rejects.toBeInstanceOf(ConflictException);
  });

  it('falha quando pacote nao existe', async () => {
    const orcamentoRepository = repo({ findByPacote: jest.fn().mockResolvedValue(null) });
    await expect(new CreateOrcamentoUseCase(orcamentoRepository as any, repo({ findById: jest.fn().mockResolvedValue(null) }) as any).execute({ id_pacote: 'p-1' } as any)).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('solicitacao para orcamento', () => {
  it('cria pacote, orcamento e atualiza solicitacao', async () => {
    const solicitacaoRepository = repo({
      findById: jest.fn().mockResolvedValue({ id_solicitacao: 's-1', id_cliente: 'c-1', tipo_pacote: 'AAA' }),
      update: jest.fn(),
    });
    const createPacoteUseCase = { execute: jest.fn().mockResolvedValue({ id_pacote: 'p-1' }) };
    const createOrcamentoUseCase = { execute: jest.fn().mockResolvedValue({ cod_orcamento: 'o-1' }) };

    await expect(new CreateOrcamentoFromSolicitacaoUseCase(solicitacaoRepository as any, createPacoteUseCase as any, createOrcamentoUseCase as any, repo() as any).execute('s-1')).resolves.toEqual({ cod_orcamento: 'o-1' });
    expect(createPacoteUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({ valor_base: 2000 }));
    expect(solicitacaoRepository.update).toHaveBeenCalledWith('s-1', expect.objectContaining({ status: 'ORCAMENTO_CRIADO' }));
  });

  it('usa valor base do pacote existente quando valor nao foi informado', async () => {
    const solicitacaoRepository = repo({ findById: jest.fn().mockResolvedValue({ id_solicitacao: 's-1', id_cliente: 'c-1', tipo_pacote: 'A', id_pacote: 'p-1' }), update: jest.fn() });
    const createOrcamentoUseCase = { execute: jest.fn().mockResolvedValue({ cod_orcamento: 'o-1' }) };
    const pacoteRepository = repo({ findById: jest.fn().mockResolvedValue({ id_pacote: 'p-1', valor_base: '1234.50' }) });

    await new CreateOrcamentoFromSolicitacaoUseCase(solicitacaoRepository as any, { execute: jest.fn() } as any, createOrcamentoUseCase as any, pacoteRepository as any).execute('s-1');
    expect(createOrcamentoUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({ valor_orcamento: 1234.5 }));
  });

  it('usa valor informado mesmo quando pacote existente tem outro valor', async () => {
    const solicitacaoRepository = repo({ findById: jest.fn().mockResolvedValue({ id_solicitacao: 's-1', id_cliente: 'c-1', tipo_pacote: 'A', id_pacote: 'p-1' }), update: jest.fn() });
    const createOrcamentoUseCase = { execute: jest.fn().mockResolvedValue({ cod_orcamento: 'o-1' }) };

    await new CreateOrcamentoFromSolicitacaoUseCase(solicitacaoRepository as any, { execute: jest.fn() } as any, createOrcamentoUseCase as any, repo() as any).execute('s-1', 999);
    expect(createOrcamentoUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({ valor_orcamento: 999 }));
  });

  it('usa valor base padrao quando tipo de pacote nao mapeado e pacote nao e encontrado', async () => {
    const solicitacaoRepository = repo({ findById: jest.fn().mockResolvedValue({ id_solicitacao: 's-1', id_cliente: 'c-1', tipo_pacote: 'ZZ', id_pacote: 'p-1' }), update: jest.fn() });
    const createOrcamentoUseCase = { execute: jest.fn().mockResolvedValue({ cod_orcamento: 'o-1' }) };
    const pacoteRepository = repo({ findById: jest.fn().mockResolvedValue(null) });

    await new CreateOrcamentoFromSolicitacaoUseCase(solicitacaoRepository as any, { execute: jest.fn() } as any, createOrcamentoUseCase as any, pacoteRepository as any).execute('s-1');
    expect(createOrcamentoUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({ valor_orcamento: 1500 }));
  });

  it('falha quando solicitacao nao existe ou ja tem orcamento', async () => {
    await expect(new CreateOrcamentoFromSolicitacaoUseCase(repo({ findById: jest.fn().mockResolvedValue(null) }) as any, {} as any, {} as any, {} as any).execute('s-1')).rejects.toBeInstanceOf(NotFoundException);
    await expect(new CreateOrcamentoFromSolicitacaoUseCase(repo({ findById: jest.fn().mockResolvedValue({ cod_orcamento: 'o-1' }) }) as any, {} as any, {} as any, {} as any).execute('s-1')).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('log e notificacoes', () => {
  it('delega operacoes de log', async () => {
    const repository = repo({
      create: jest.fn().mockResolvedValue({ id: 'l-1' }),
      deleteOldLogs: jest.fn().mockResolvedValue(2),
      findByDateRange: jest.fn().mockResolvedValue({ items: [] }),
      findByFilters: jest.fn().mockResolvedValue({ logs: [], lastEvaluatedKey: undefined }),
      findById: jest.fn().mockResolvedValue({ id: 'l-1' }),
      findByLevel: jest.fn().mockResolvedValue({ items: [] }),
      findByUserId: jest.fn().mockResolvedValue({ logs: [] }),
      findAll: jest.fn().mockResolvedValue({ items: [], lastEvaluatedKey: undefined }),
      getLogStats: jest.fn().mockResolvedValue({ total: 1 }),
    });

    await expect(new CreateLogUseCase(repository as any).execute({ level: 'info' } as any)).resolves.toEqual({ id: 'l-1' });
    await expect(new DeleteOldLogsUseCase(repository as any).execute('2026-01-01')).resolves.toBe(2);
    await expect(new GetLogUseCase(repository as any).execute('id', 'ts')).resolves.toEqual({ id: 'l-1' });
    await expect(new GetLogsByDateRangeUseCase(repository as any).execute('a', 'b', 10, { k: 1 })).resolves.toEqual({ items: [] });
    await expect(new GetLogsByLevelUseCase(repository as any).execute('error', 10)).resolves.toEqual({ items: [] });
    await expect(new GetLogsByUserUseCase(repository as any).execute('u-1')).resolves.toEqual({ logs: [] });
    await expect(new ListLogsUseCase(repository as any).execute({ limit: 5 } as any)).resolves.toEqual({ logs: [], lastEvaluatedKey: undefined });
    await expect(new GetLogStatsUseCase(repository as any).execute()).resolves.toEqual({ total: 1 });
  });

  it('delega operacoes de notificacao', async () => {
    const repository = repo({
      create: jest.fn().mockResolvedValue({ id: 'n-1' }),
      findByUserId: jest.fn().mockResolvedValue([{ id: 'n-1' }]),
      findNaoLidasByUserId: jest.fn().mockResolvedValue([{ id: 'n-1' }]),
      countNaoLidas: jest.fn().mockResolvedValue(1),
      marcarComoLida: jest.fn().mockResolvedValue({ id: 'n-1', lida: true }),
      marcarTodasComoLidas: jest.fn().mockResolvedValue(3),
    });

    await expect(new CreateNotificacaoUseCase(repository as any).execute({ titulo: 'Oi' } as any)).resolves.toEqual({ id: 'n-1' });
    await expect(new GetNotificacoesUseCase(repository as any).execute('u-1', true)).resolves.toEqual([{ id: 'n-1' }]);
    await expect(new GetNotificacoesUseCase(repository as any).execute('u-1')).resolves.toEqual([{ id: 'n-1' }]);
    await expect(new GetNotificacoesUseCase(repository as any).countNaoLidas('u-1')).resolves.toBe(1);
    await expect(new MarcarNotificacaoLidaUseCase(repository as any).execute('n-1', 'u-1')).resolves.toEqual({ id: 'n-1', lida: true });
    await expect(new MarcarNotificacaoLidaUseCase(repository as any).marcarTodas('u-1')).resolves.toBe(3);
  });
});

describe('assinatura de contrato', () => {
  it('assina contrato encontrado e atualiza repositorio', async () => {
    const contratoRepository = repo({ findById: jest.fn().mockResolvedValue({ cod_contrato: 'c-1' }), update: jest.fn() });
    const signatureService = {
      validateSignatureBase64: jest.fn().mockReturnValue(true),
      signPDF: jest.fn().mockResolvedValue('/assinado.pdf'),
    };

    await expect(new SignContratoUseCase(contratoRepository as any, signatureService as any).execute('c-1', 'base64', __filename)).resolves.toEqual({ signedContractPath: '/assinado.pdf' });
    expect(signatureService.signPDF).toHaveBeenCalledWith(__filename, 'base64', expect.stringContaining('contrato_c-1_assinado_'));
    expect(contratoRepository.update).toHaveBeenCalled();
  });

  it('falha quando contrato nao existe', async () => {
    await expect(new SignContratoUseCase(repo({ findById: jest.fn().mockResolvedValue(null) }) as any, {} as any).execute('c-1', 'base64')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('falha quando assinatura e invalida', async () => {
    const signatureService = { validateSignatureBase64: jest.fn().mockReturnValue(false) };
    await expect(new SignContratoUseCase(repo({ findById: jest.fn().mockResolvedValue({}) }) as any, signatureService as any).execute('c-1', 'base64')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('falha quando arquivo nao existe', async () => {
    const signatureService = { validateSignatureBase64: jest.fn().mockReturnValue(true) };
    await expect(new SignContratoUseCase(repo({ findById: jest.fn().mockResolvedValue({}) }) as any, signatureService as any).execute('c-1', 'base64')).rejects.toBeInstanceOf(BadRequestException);
  });
});

import { Provider } from '@nestjs/common';
import { OrcamentoRepository } from '../database/repositories/orcamento.repository';

export const ORCAMENTO_REPOSITORY = 'ORCAMENTO_REPOSITORY';

export const OrcamentoRepositoryProvider: Provider = {
  provide: ORCAMENTO_REPOSITORY,
  useClass: OrcamentoRepository,
}; 
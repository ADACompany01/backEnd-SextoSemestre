import { Provider } from '@nestjs/common';
import { SolicitacaoRepositoryImpl } from '../database/repositories/solicitacao.repository';

export const SOLICITACAO_REPOSITORY = 'SOLICITACAO_REPOSITORY';

export const SolicitacaoRepositoryProvider: Provider = {
  provide: SOLICITACAO_REPOSITORY,
  useClass: SolicitacaoRepositoryImpl,
};


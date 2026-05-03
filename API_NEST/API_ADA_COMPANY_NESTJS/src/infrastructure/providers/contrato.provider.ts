import { Provider } from '@nestjs/common';
import { ContratoRepository } from '../database/repositories/contrato.repository';

export const CONTRATO_REPOSITORY = 'CONTRATO_REPOSITORY';

export const ContratoRepositoryProvider: Provider = {
  provide: CONTRATO_REPOSITORY,
  useClass: ContratoRepository,
}; 
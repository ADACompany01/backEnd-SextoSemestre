import { Provider } from '@nestjs/common';
import { PacoteRepositoryImpl } from '../database/repositories/pacote.repository';

export const PACOTE_REPOSITORY = 'PACOTE_REPOSITORY';

export const PacoteRepositoryProvider: Provider = {
  provide: PACOTE_REPOSITORY,
  useClass: PacoteRepositoryImpl,
}; 
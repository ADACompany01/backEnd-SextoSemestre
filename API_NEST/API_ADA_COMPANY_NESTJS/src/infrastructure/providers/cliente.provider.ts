import { Provider } from '@nestjs/common';
import { ClienteRepositoryImpl } from '../database/repositories/cliente.repository';

export const CLIENTE_REPOSITORY = 'CLIENTE_REPOSITORY';

export const ClienteRepositoryProvider: Provider = {
  provide: CLIENTE_REPOSITORY,
  useClass: ClienteRepositoryImpl,
}; 
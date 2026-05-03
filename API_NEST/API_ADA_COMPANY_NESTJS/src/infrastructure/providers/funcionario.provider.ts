import { Provider } from '@nestjs/common';
import { FuncionarioRepositoryImpl } from '../database/repositories/funcionario.repository';

export const FUNCIONARIO_REPOSITORY = 'FUNCIONARIO_REPOSITORY';

export const FuncionarioRepositoryProvider: Provider = {
  provide: FUNCIONARIO_REPOSITORY,
  useClass: FuncionarioRepositoryImpl,
}; 
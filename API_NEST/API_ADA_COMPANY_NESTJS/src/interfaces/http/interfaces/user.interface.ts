export interface User {
  id_usuario: number;
  tipo_usuario: string;
}

export interface RequestWithUser extends Request {
  user: User;
}
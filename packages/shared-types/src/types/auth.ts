export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  csrfToken: string;
}

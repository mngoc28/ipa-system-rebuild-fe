export interface JwtPayload {
  exp?: number;
  sub?: string;
  role?: string;
  fullName?: string;
  [key: string]: any;
}

export interface RefreshTokenResponse {
  data: {
    token: string;
  };
}

export type AuthenticatedUser = {
  id: string;
  role: string;
  sessionId: string;
};

export type JwtAccessPayload = {
  sub: string;
  role: string;
  session_id: string;
};

export interface JwtPayload {
    sub: string;
    deviceToken: string;
    email: string | null;
}

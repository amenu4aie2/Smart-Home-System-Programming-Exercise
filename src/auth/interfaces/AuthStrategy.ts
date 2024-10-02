export interface AuthStrategy {
    authenticate(credentials: any): Promise<boolean>;
}
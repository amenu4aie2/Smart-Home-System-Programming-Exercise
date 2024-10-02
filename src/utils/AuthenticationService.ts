export class AuthenticationService {
    private users: Map<string, string> = new Map();

    constructor() {
        // Initialize with a default user
        this.users.set('admin', 'password');
    }

    public authenticate(username: string, password: string): boolean {
        return this.users.get(username) === password;
    }

    public addUser(username: string, password: string): void {
        this.users.set(username, password);
    }
}
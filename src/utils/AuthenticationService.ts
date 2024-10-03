/**
 * AuthenticationService class for managing user authentication.
 * Provides methods to authenticate users and add new users.
 */
export class AuthenticationService {
    private users: Map<string, string> = new Map(); // Map to store username-password pairs

    /**
     * Constructor for AuthenticationService.
     * Initializes the service with a default user.
     */
    constructor() {
        // Initialize with a default user
        this.users.set('admin', 'password');
    }

    /**
     * Authenticates a user based on provided username and password.
     * @param username - The username of the user.
     * @param password - The password of the user.
     * @returns True if authentication is successful, false otherwise.
     */
    public authenticate(username: string, password: string): boolean {
        return this.users.get(username) === password;
    }

    /**
     * Adds a new user to the authentication service.
     * @param username - The username of the new user.
     * @param password - The password of the new user.
     */
    public addUser(username: string, password: string): void {
        this.users.set(username, password);
    }
}
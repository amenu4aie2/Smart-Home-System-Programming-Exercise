/**
 * Interface representing an authentication strategy.
 * Classes implementing this interface should provide a method to authenticate users.
 */
export interface AuthStrategy {
    /**
     * Method to authenticate a user based on provided credentials.
     * @param credentials - The credentials used for authentication.
     * @returns A promise that resolves to a boolean indicating the success of the authentication.
     */
    authenticate(credentials: any): Promise<boolean>;
}
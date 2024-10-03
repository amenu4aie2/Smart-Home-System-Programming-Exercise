/**
 * Represents a role within the system.
 */
export interface Role {
    /**
     * Unique identifier for the role.
     */
    id: string;

    /**
     * Name of the role.
     */
    name: string;

    /**
     * Set of permissions associated with the role.
     */
    permissions: Set<string>;
}
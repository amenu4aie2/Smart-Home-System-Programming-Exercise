export interface Role {
    id: string;
    name: string;
    permissions: Set<string>;
}

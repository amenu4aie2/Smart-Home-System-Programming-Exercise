/**
 * Interface representing a command in the command pattern.
 * Commands encapsulate actions and can be executed or undone.
 */
export interface Command {
    /**
     * Executes the command.
     */
    execute(): void;

    /**
     * Undoes the command.
     */
    undo(): void;
}
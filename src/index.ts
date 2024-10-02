import { SmartHomeHub } from './core/SmartHomeHub';
import { Priority, Task } from './core/Task';
import { AuthService } from './auth/AuthService';
import * as readline from 'readline';

const hub = SmartHomeHub.getInstance();
const authService = AuthService.getInstance();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let currentUser: string | null = null;
let currentToken: string | null = null;

function displayLoginMenu() {
    console.log('\nSmart Home System - Login');
    console.log('1. Login');
    console.log('2. Register');
    console.log('3. Exit');
    rl.question('Enter your choice: ', handleLoginChoice);
}

function handleLoginChoice(choice: string) {
    switch (choice) {
        case '1':
            login();
            break;
        case '2':
            register();
            break;
        case '3':
            console.log('Exiting Smart Home System. Goodbye!');
            rl.close();
            return;
        default:
            console.log('Invalid choice. Please try again.');
            displayLoginMenu();
    }
}

function login() {
    rl.question('Enter username: ', (username) => {
        rl.question('Enter password: ', async (password) => {
            try {
                const result = await authService.login(username, password);
                if (result) {
                    currentUser = username;
                    currentToken = result.accessToken;
                    console.log('Login successful!');
                    
                    displayMenu();
                } else {
                    console.log('Login failed. Please try again.');
                    displayLoginMenu();
                }
            } catch (error) {
                const errorMessage = (error as Error).message;
                console.error('Login error:', errorMessage);

            }
        });
    });
}

function register() {
    rl.question('Enter username: ', (username) => {
        rl.question('Enter email: ', (email) => {
            rl.question('Enter password: ', (password) => {
                try {
                    authService.addUser(username, email, password);
                    console.log('Registration successful! Please login.');
                    displayLoginMenu();
                } catch (error) {
                    const errorMessage = (error as Error).message;
                    console.error('Registration error:', errorMessage);
                }
            });
        });
    });
}

function displayMenu() {
    console.log('\nSmart Home System');
    console.log('1. Add Task');
    console.log('2. Remove Task');
    console.log('3. View All Tasks');
    console.log('4. Edit Task');
    console.log('5. Mark Task as Completed');
    console.log('6. View Tasks by Priority');
    console.log('7. Logout');
    rl.question('Enter your choice: ', handleChoice);
}

function handleChoice(choice: string) {
    switch (choice) {
        case '1':
            addTask();
            break;
        case '2':
            removeTask();
            break;
        case '3':
            viewAllTasks();
            break;
        case '4':
            editTask();
            break;
        case '5':
            markTaskAsCompleted();
            break;
        case '6':
            viewTasksByPriority();
            break;
        case '7':
            logout();
            break;
        default:
            console.log('Invalid choice. Please try again.');
            displayMenu();
    }
}

function addTask() {
    if (!currentUser) {
        console.log('You must be logged in to add a task.');
        displayLoginMenu();
        return;
    }
    rl.question('Enter task description: ', (description) => {
        rl.question('Enter start time (YYYY-MM-DD HH:MM): ', (startTimeStr) => {
            rl.question('Enter end time (YYYY-MM-DD HH:MM): ', (endTimeStr) => {
                rl.question('Enter priority (0: Low, 1: Medium, 2: High): ', (priorityStr) => {
                    const startTime = new Date(startTimeStr);
                    const endTime = new Date(endTimeStr);
                    const priority = parseInt(priorityStr) as Priority;
                    try {
                        hub.addTask(currentUser!, description, startTime, endTime, priority);
                        console.log('Task added successfully.');
                    } catch (error) {
                        const errorMessage = (error as Error).message;
                        console.error('Error adding task:', errorMessage);
                    }
                    displayMenu();
                });
            });
        });
    });
}

function removeTask() {
    if (!currentUser) {
        console.log('You must be logged in to remove a task.');
        displayLoginMenu();
        return;
    }
    rl.question('Enter task ID to remove: ', (id) => {
        try {
            hub.removeTask(currentUser!, id);
            console.log('Task removed successfully.');
        } catch (error) {
            const errorMessage = (error as Error).message;
            console.error('Error removing task:', errorMessage);

            }
        displayMenu();
    });
}

function viewAllTasks() {
    if (!currentUser) {
        console.log('You must be logged in to view tasks.');
        displayLoginMenu();
        return;
    }
    try {
        const tasks = hub.getTasksSortedByStartTime(currentUser!);
        tasks.forEach(task => console.log(`${task.id}: ${task.description} (${task.startTime} - ${task.endTime}) [${Priority[task.priority]}]`));
    } catch (error) {
        if (error instanceof Error) {
            if (error instanceof Error) {
                if (error instanceof Error) {
                    console.error('Error viewing tasks:', error.message);
                } else {
                    console.error('Error viewing tasks:', error);
                }
            } else {
                console.error('Error viewing tasks:', error);
            }
        } else {
            console.error('Error viewing tasks:', error);
        }
    }
    displayMenu();
}

function editTask() {
    if (!currentUser) {
        console.log('You must be logged in to edit a task.');
        displayLoginMenu();
        return;
    }
    rl.question('Enter task ID to edit: ', (id) => {
        rl.question('Enter new description (or press enter to skip): ', (description) => {
            rl.question('Enter new start time (YYYY-MM-DD HH:MM) (or press enter to skip): ', (startTimeStr) => {
                rl.question('Enter new end time (YYYY-MM-DD HH:MM) (or press enter to skip): ', (endTimeStr) => {
                    rl.question('Enter new priority (0: Low, 1: Medium, 2: High) (or press enter to skip): ', (priorityStr) => {
                        const updatedTask: Partial<Task> = {};
                        if (description) updatedTask.description = description;
                        if (startTimeStr) updatedTask.startTime = new Date(startTimeStr);
                        if (endTimeStr) updatedTask.endTime = new Date(endTimeStr);
                        if (priorityStr) updatedTask.priority = parseInt(priorityStr) as Priority;
                        try {
                            hub.editTask(currentUser!, id, updatedTask);
                            console.log('Task updated successfully.');
                        } catch (error) {
                            const errorMessage = (error as Error).message;
                            console.error('Error updating task:', errorMessage);
                            }
                        displayMenu();
                    });
                });
            });
        });
    });
}

function markTaskAsCompleted() {
    if (!currentUser) {
        console.log('You must be logged in to mark a task as completed.');
        displayLoginMenu();
        return;
    }
    rl.question('Enter task ID to mark as completed: ', (id) => {
        try {
            hub.markTaskAsCompleted(currentUser!, id);
            console.log('Task marked as completed successfully.');
        } catch (error) {
            const errorMessage = (error as Error).message;
            console.error('Error marking task as completed:', errorMessage);
        }
        displayMenu();
    });
}

function viewTasksByPriority() {
    if (!currentUser) {
        console.log('You must be logged in to view tasks.');
        displayLoginMenu();
        return;
    }
    rl.question('Enter priority to view (0: Low, 1: Medium, 2: High): ', (priorityStr) => {
        const priority = parseInt(priorityStr) as Priority;
        try {
            const tasks = hub.getTasksByPriority(currentUser!, priority);
            tasks.forEach(task => console.log(`${task.id}: ${task.description} (${task.startTime} - ${task.endTime})`));
        } catch (error) {
            
            // catch (error) {
            //     const errorMessage = (error as Error).message;
            //     this.notificationService.sendNotification(Failed to update task: ${errorMessage});
            // } do similar
            const errorMessage = (error as Error).message;
            console.error('Error viewing tasks by priority:', errorMessage);
        }
        displayMenu();
    });
}

function logout() {
    currentUser = null;
    currentToken = null;
    console.log('Logged out successfully.');
    displayLoginMenu();
}

console.log('Smart Home System initialized!');
displayLoginMenu();
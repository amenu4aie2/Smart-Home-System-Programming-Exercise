import { SmartHomeHub } from './core/SmartHomeHub';
import { Priority, Task } from './core/Task';
import { AuthService } from './auth/AuthService';
import * as readline from 'readline';
import { Scheduler } from './utils/Scheduler';
import { AutomationEngine } from './utils/AutomationEngine';
import { Command } from './commands/Command';

// Create instances of core services
const hub = SmartHomeHub.getInstance();
const authService = AuthService.getInstance();
const scheduler = Scheduler.getInstance();
const automationEngine = AutomationEngine.getInstance();

// Create a readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let currentUser: string | null = null; // Currently logged-in user
let currentToken: string | null = null; // Authentication token for the current user

/**
 * Displays the login menu to the user.
 */
function displayLoginMenu() {
    console.log('\nSmart Home System - Login');
    console.log('1. Login');
    console.log('2. Register');
    console.log('3. Exit');
    rl.question('Enter your choice: ', handleLoginChoice);
}

/**
 * Handles the user's choice in the login menu.
 * @param choice - The user's choice.
 */
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

/**
 * Prompts the user to login by entering their username and password.
 */
function login() {
    rl.question('Enter username: ', (username) => {
        rl.question('Enter password: ', async (password) => {
            try {
                const result = await authService.login(username, password);
                if (result) {
                    currentUser = username;
                    currentToken = result.accessToken;
                    console.log('Login successful!');
                    displayMainMenu();
                } else {
                    console.log('Login failed. Please try again.');
                    displayLoginMenu();
                }
            } catch (error) {
                console.error('Login error:', (error as Error).message);
                displayLoginMenu();
            }
        });
    });
}

/**
 * Prompts the user to register by entering their username, email, and password.
 */
function register() {
    rl.question('Enter username: ', (username) => {
        rl.question('Enter email: ', (email) => {
            rl.question('Enter password: ', (password) => {
                try {
                    authService.addUser(username, email, password);
                    console.log('Registration successful! Please login.');
                    displayLoginMenu();
                } catch (error) {
                    console.error('Registration error:', (error as Error).message);
                    displayLoginMenu();
                }
            });
        });
    });
}

/**
 * Displays the main menu to the user.
 */
function displayMainMenu() {
    console.log('\nSmart Home System - Main Menu');
    console.log('1. Task Management');
    console.log('2. Device Management');
    console.log('3. Scheduling');
    console.log('4. Automation');
    console.log('5. Logout');
    rl.question('Enter your choice: ', handleMainMenuChoice);
}

/**
 * Handles the user's choice in the main menu.
 * @param choice - The user's choice.
 */
function handleMainMenuChoice(choice: string) {
    switch (choice) {
        case '1':
            displayTaskMenu();
            break;
        case '2':
            displayDeviceMenu();
            break;
        case '3':
            displaySchedulerMenu();
            break;
        case '4':
            displayAutomationMenu();
            break;
        case '5':
            logout();
            break;
        default:
            console.log('Invalid choice. Please try again.');
            displayMainMenu();
    }
}

/**
 * Displays the scheduler menu to the user.
 */
function displaySchedulerMenu() {
    console.log('\nScheduler Menu');
    console.log('1. Schedule Task');
    console.log('2. View Scheduled Tasks');
    console.log('3. Remove Scheduled Task');
    console.log('4. Back to Main Menu');
    rl.question('Enter your choice: ', handleSchedulerMenuChoice);
}

/**
 * Handles the user's choice in the scheduler menu.
 * @param choice - The user's choice.
 */
function handleSchedulerMenuChoice(choice: string) {
    switch (choice) {
        case '1':
            scheduleTask();
            break;
        case '2':
            viewScheduledTasks();
            break;
        case '3':
            removeScheduledTask();
            break;
        case '4':
            displayMainMenu();
            break;
        default:
            console.log('Invalid choice. Please try again.');
            displaySchedulerMenu();
    }
}

/**
 * Prompts the user to schedule a new task.
 * Requires the user to be logged in.
 */
function scheduleTask() {
    if (!currentUser) {
        console.log('You must be logged in to schedule a task.');
        displayLoginMenu();
        return;
    }
    rl.question('Enter task description: ', (description) => {
        rl.question('Enter execution time (YYYY-MM-DD HH:MM): ', (executionTimeStr) => {
            const executionTime = new Date(executionTimeStr);
            const command: Command = {
                execute: () => {
                    console.log(`Executing scheduled task: ${description}`);
                    hub.addTask(currentUser!, description, executionTime, new Date(executionTime.getTime() + 3600000), Priority.Medium);
                },
                undo: function (): void {
                    throw new Error('Function not implemented.');
                }
            };
            try {
                const taskId = scheduler.scheduleTask(currentUser!, command, executionTime);
                console.log(`Task scheduled successfully. Task ID: ${taskId}`);
            } catch (error) {
                console.error('Error scheduling task:', (error as Error).message);
            }
            displaySchedulerMenu();
        });
    });
}
/**
 * Displays the scheduled tasks for the current user.
 * Requires the user to be logged in.
 */
function viewScheduledTasks() {
    if (!currentUser) {
        console.log('You must be logged in to view scheduled tasks.');
        displayLoginMenu();
        return;
    }
    try {
        const tasks = scheduler.getScheduledTasks(currentUser!);
        tasks.forEach(task => console.log(`${task.id}: Execution time: ${task.executionTime}`));
    } catch (error) {
        console.error('Error viewing scheduled tasks:', (error as Error).message);
    }
    displaySchedulerMenu();
}

/**
 * Prompts the user to remove a scheduled task by entering its ID.
 * Requires the user to be logged in.
 */
function removeScheduledTask() {
    if (!currentUser) {
        console.log('You must be logged in to remove a scheduled task.');
        displayLoginMenu();
        return;
    }
    rl.question('Enter task ID to remove: ', (id) => {
        try {
            scheduler.removeScheduledTask(currentUser!, id);
            console.log('Scheduled task removed successfully.');
        } catch (error) {
            console.error('Error removing scheduled task:', (error as Error).message);
        }
        displaySchedulerMenu();
    });
}

/**
 * Displays the task management menu to the user.
 */
function displayTaskMenu() {
    console.log('\nTask Management');
    console.log('1. Add Task');
    console.log('2. Remove Task');
    console.log('3. View All Tasks');
    console.log('4. Edit Task');
    console.log('5. Mark Task as Completed');
    console.log('6. View Tasks by Priority');
    console.log('7. Back to Main Menu');
    rl.question('Enter your choice: ', handleTaskMenuChoice);
}

/**
 * Handles the user's choice in the task management menu.
 * @param choice - The user's choice.
 */
function handleTaskMenuChoice(choice: string) {
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
            displayMainMenu();
            break;
        default:
            console.log('Invalid choice. Please try again.');
            displayTaskMenu();
    }
}

/**
 * Prompts the user to add a new task by entering its details.
 * Requires the user to be logged in.
 */
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
                        console.error('Error adding task:', (error as Error).message);
                    }
                    displayTaskMenu();
                });
            });
        });
    });
}

/**
 * Prompts the user to remove a task by entering its ID.
 * Requires the user to be logged in.
 */
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
            console.error('Error removing task:', (error as Error).message);
        }
        displayTaskMenu();
    });
}

/**
 * Displays all tasks for the current user.
 * Requires the user to be logged in.
 */
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
        console.error('Error viewing tasks:', (error as Error).message);
    }
    displayTaskMenu();
}

/**
 * Prompts the user to edit a task by entering its ID and new details.
 * Requires the user to be logged in.
 */
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
                            console.error('Error updating task:', (error as Error).message);
                        }
                        displayTaskMenu();
                    });
                });
            });
        });
    });
}

/**
 * Prompts the user to mark a task as completed by entering its ID.
 * Requires the user to be logged in.
 */
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
            console.error('Error marking task as completed:', (error as Error).message);
        }
        displayTaskMenu();
    });
}

/**
 * Prompts the user to view tasks by priority.
 * Requires the user to be logged in.
 */
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
            console.error('Error viewing tasks by priority:', (error as Error).message);
        }
        displayTaskMenu();
    });
}

/**
 * Displays the automation menu to the user.
 */
function displayAutomationMenu() {
    console.log('\nAutomation Menu');
    console.log('1. Add Automation Rule');
    console.log('2. View Automation Rules');
    console.log('3. Remove Automation Rule');
    console.log('4. Back to Main Menu');
    rl.question('Enter your choice: ', handleAutomationMenuChoice);
}

/**
 * Handles the user's choice in the automation menu.
 * @param choice - The user's choice.
 */
function handleAutomationMenuChoice(choice: string) {
    switch (choice) {
        case '1':
            addAutomationRule();
            break;
        case '2':
            viewAutomationRules();
            break;
        case '3':
            removeAutomationRule();
            break;
        case '4':
            displayMainMenu();
            break;
        default:
            console.log('Invalid choice. Please try again.');
            displayAutomationMenu();
    }
}/**
 * Prompts the user to add a new automation rule by entering its details.
 * Requires the user to be logged in.
 */
function addAutomationRule() {
    if (!currentUser) {
        console.log('You must be logged in to add an automation rule.');
        displayLoginMenu();
        return;
    }
    rl.question('Enter rule name: ', (name) => {
        rl.question('Enter device type for condition (e.g., "light", "thermostat"): ', (deviceType) => {
            rl.question('Enter condition (e.g., "brightness > 50" for light, "temperature > 25" for thermostat): ', (conditionStr) => {
                rl.question('Enter action (e.g., "turnOn", "turnOff", "setTemperature 22"): ', (actionStr) => {
                    const condition = (device: any) => {
                        const [property, operator, value] = conditionStr.split(' ');
                        return eval(`${device[property]}() ${operator} ${value}`);
                    };
                    const action: Command = {
                        execute: () => {
                            console.log(`Executing action: ${actionStr}`);
                        },
                        undo: function (): void {
                            throw new Error('Function not implemented.');
                        }
                    };
                    try {
                        const ruleId = automationEngine.addRule(currentUser!, name, condition, action);
                        console.log(`Automation rule added successfully. Rule ID: ${ruleId}`);
                    } catch (error) {
                        console.error('Error adding automation rule:', (error as Error).message);
                    }
                    displayAutomationMenu();
                });
            });
        });
    });
}

/**
 * Displays all automation rules for the current user.
 * Requires the user to be logged in.
 */
function viewAutomationRules() {
    if (!currentUser) {
        console.log('You must be logged in to view automation rules.');
        displayLoginMenu();
        return;
    }
    try {
        const rules = automationEngine.getRules(currentUser!);
        rules.forEach(rule => console.log(`${rule.id}: ${rule.name}`));
    } catch (error) {
        console.error('Error viewing automation rules:', (error as Error).message);
    }
    displayAutomationMenu();
}

/**
 * Prompts the user to remove an automation rule by entering its ID.
 * Requires the user to be logged in.
 */
function removeAutomationRule() {
    if (!currentUser) {
        console.log('You must be logged in to remove an automation rule.');
        displayLoginMenu();
        return;
    }
    rl.question('Enter rule ID to remove: ', (id) => {
        try {
            automationEngine.removeRule(currentUser!, id);
            console.log('Automation rule removed successfully.');
        } catch (error) {
            console.error('Error removing automation rule:', (error as Error).message);
        }
        displayAutomationMenu();
    });
}

/**
 * Displays the device management menu to the user.
 */
function displayDeviceMenu() {
    console.log('\nDevice Management');
    console.log('1. Add Device');
    console.log('2. Remove Device');
    console.log('3. View All Devices');
    console.log('4. Control Device');
    console.log('5. Back to Main Menu');
    rl.question('Enter your choice: ', handleDeviceMenuChoice);
}

/**
 * Handles the user's choice in the device management menu.
 * @param choice - The user's choice.
 */
function handleDeviceMenuChoice(choice: string) {
    switch (choice) {
        case '1':
            addDevice();
            break;
        case '2':
            removeDevice();
            break;
        case '3':
            viewAllDevices();
            break;
        case '4':
            controlDevice();
            break;
        case '5':
            displayMainMenu();
            break;
        default:
            console.log('Invalid choice. Please try again.');
            displayDeviceMenu();
    }
}

/**
 * Prompts the user to add a new device by entering its details.
 * Requires the user to be logged in.
 */
function addDevice() {
    if (!currentUser) {
        console.log('You must be logged in to add a device.');
        displayLoginMenu();
        return;
    }
    rl.question('Enter device type (light, thermostat, coffeemaker): ', (type) => {
        rl.question('Enter device ID: ', (id) => {
            rl.question('Enter device name: ', (name) => {
                try {
                    hub.addDevice(currentUser!, type, id, name);
                    console.log('Device added successfully.');
                } catch (error) {
                    console.error('Error adding device:', (error as Error).message);
                }
                displayDeviceMenu();
            });
        });
    });
}

/**
 * Prompts the user to remove a device by entering its ID.
 * Requires the user to be logged in.
 */
function removeDevice() {
    if (!currentUser) {
        console.log('You must be logged in to remove a device.');
        displayLoginMenu();
        return;
    }
    rl.question('Enter device ID to remove: ', (id) => {
        try {
            const removed = hub.removeDevice(currentUser!, id);
            if (removed) {
                console.log('Device removed successfully.');
            } else {
                console.log('Device not found.');
            }
        } catch (error) {
            console.error('Error removing device:', (error as Error).message);
        }
        displayDeviceMenu();
    });
}

/**
 * Displays all devices for the current user.
 * Requires the user to be logged in.
 */
function viewAllDevices() {
    if (!currentUser) {
        console.log('You must be logged in to view devices.');
        displayLoginMenu();
        return;
    }
    try {
        const devices = hub.getAllDevices(currentUser!);
        devices.forEach(device => console.log(`${device.getId()}: ${device.getName()} (${device.getType()})`));
    } catch (error) {
        console.error('Error viewing devices:', (error as Error).message);
    }
    displayDeviceMenu();
}/**
 * Prompts the user to control a device by entering its ID and a command.
 * Requires the user to be logged in.
 */
function controlDevice() {
    if (!currentUser) {
        console.log('You must be logged in to control a device.');
        displayLoginMenu();
        return;
    }
    rl.question('Enter device ID to control: ', (id) => {
        rl.question('Enter command (e.g., "turnOn", "turnOff", "setBrightness", "setTemperature", "brew"): ', (command) => {
            try {
                const device = hub.getDevice(currentUser!, id);
                if (device) {
                    switch (command) {
                        case 'turnOn':
                            (device as any).turnOn();
                            console.log('Device turned on.');
                            break;
                        case 'turnOff':
                            (device as any).turnOff();
                            console.log('Device turned off.');
                            break;
                        case 'setBrightness':
                            if (device.getType() === 'light') {
                                rl.question('Enter brightness level (0-100): ', (level) => {
                                    (device as any).setBrightness(parseInt(level));
                                    console.log(`Brightness set to ${level}`);
                                    displayDeviceMenu();
                                });
                                return;
                            }
                            break;
                        case 'setTemperature':
                            if (device.getType() === 'thermostat') {
                                rl.question('Enter temperature: ', (temp) => {
                                    (device as any).setTemperature(parseFloat(temp));
                                    console.log(`Temperature set to ${temp}`);
                                    displayDeviceMenu();
                                });
                                return;
                            }
                            break;
                        case 'brew':
                            if (device.getType() === 'coffeemaker') {
                                (device as any).brew();
                                console.log('Brewing coffee.');
                            }
                            break;
                        default:
                            console.log('Unknown command.');
                    }
                } else {
                    console.log('Device not found.');
                }
            } catch (error) {
                console.error('Error controlling device:', (error as Error).message);
            }
            displayDeviceMenu();
        });
    });
}

/**
 * Logs out the current user and displays the login menu.
 */
function logout() {
    currentUser = null;
    currentToken = null;
    console.log('Logged out successfully.');
    displayLoginMenu();
}

// Initialize the Smart Home System and display the login menu
console.log('Smart Home System initialized!');
displayLoginMenu();
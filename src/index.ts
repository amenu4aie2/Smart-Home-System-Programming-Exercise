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
        handleExit('Enter username', (username) => {
            handleExit('Enter password', async (password) => {
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
        },'login');
    }

    /**
     * Prompts the user to register by entering their username, email, and password.
     */
    function register() {
        handleExit('Enter username', (username) => {
            handleExit('Enter email', (email) => {
                handleExit('Enter password', (password) => {
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
        },'login');
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
        console.log('5. Unregister Account');
        console.log('6. Logout');
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
                unregisterAccount();
                break;
            case '6':
                logout();
                break;
            default:
                console.log('Invalid choice. Please try again.');
                displayMainMenu();
        }
    }
    function unregisterAccount() {
        if (!currentUser) {
            console.log('You must be logged in to unregister your account.');
            displayLoginMenu();
            return;
        }
    
        rl.question('Are you sure you want to unregister your account? This action cannot be undone. (yes/no): ', async (answer) => {
            if (answer.toLowerCase() === 'yes') {
                try {
                    await authService.unregisterUser(currentUser!);
                    console.log('Your account has been successfully unregistered.');
                    currentUser = null;
                    currentToken = null;
                    displayLoginMenu();
                } catch (error) {
                    console.error('Error unregistering account:', (error as Error).message);
                    displayMainMenu();
                }
            } else {
                console.log('Account unregistration cancelled.');
                displayMainMenu();
            }
        });
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
            askForDate('start date (YYYY-MM-DD)', (startDate) => {
                if (startDate) {
                    askForDate('end date (YYYY-MM-DD)', (endDate) => {
                        
                        if (endDate) {
                            try {
                                const command: Command = {
                                    execute: () => {
                                        console.log(`Executing scheduled task: ${description}`);
                                        hub.addTask(currentUser!, description, startDate, endDate, Priority.Medium);
                                    },
                                    undo: function (): void {
                                        throw new Error('Undo not implemented.');
                                    }
                                };

                                const taskId = scheduler.scheduleTask(currentUser!, command, startDate);
                                console.log(`Task scheduled successfully. Task ID: ${taskId}`);
                            } catch (error) {
                                console.error('Error scheduling task:', (error as Error).message);
                            }
                        }
                        displaySchedulerMenu();
                    }, startDate);
                } else {
                    displaySchedulerMenu();
                }
            });
        });
    }

    function askForDate(prompt: string, callback: (date: Date | null) => void, previousDate?: Date | null) {
        handleExit(`Enter ${prompt}`, (dateStr) => {
            const date = parseDate(dateStr);
            if (!date) {
                console.error('Invalid date format. Please use YYYY-MM-DD HH:MM.');
                askForDate(prompt, callback, previousDate);
                return;
            }
    
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
    
            if (date < currentDate) {
                console.error('Date must be today or in the future.');
                askForDate(prompt, callback, previousDate);
                return;
            }
    
            if (previousDate && date <= previousDate) {
                console.error('End date must be after the start date.');
                askForDate(prompt, callback, previousDate);
                return;
            }
    
            callback(date);
        });
    }
    
    /**
     * Parses a date string in the format YYYY-MM-DD HH:MM.
     * @param dateStr - The date string to parse.
     * @returns The parsed Date object, or null if the format is invalid.
     */
    function parseDate(dateStr: string): Date | null {
        const parts = dateStr.split(' ');
        if (parts.length !== 2) return null;
    
        const dateParts = parts[0].split('-');
        const timeParts = parts[1].split(':');
        if (dateParts.length !== 3 || timeParts.length !== 2) return null;
    
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // JS months are 0-indexed
        const day = parseInt(dateParts[2], 10);
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
    
        if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) return null;
    
        const date = new Date(year, month, day, hours, minutes);
    
        // Check if the date is valid
        if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day ||
            date.getHours() !== hours || date.getMinutes() !== minutes) {
            return null;
        }
    
        return date;
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
    
        handleExit('Enter task description', (description) => {
            askForDate('start date (YYYY-MM-DD HH:MM)', (startDate) => {
                if (startDate) {
                    askForDate('end date (YYYY-MM-DD HH:MM)', (endDate) => {
                        if (endDate && endDate > startDate) {
                            handleExit('Enter priority (0: Low, 1: Medium, 2: High)', (priorityStr) => {
                                const priority = parseInt(priorityStr) as Priority;
                                try {
                                    hub.addTask(currentUser!, description, startDate, endDate, priority);
                                    console.log('Task added successfully.');
                                } catch (error) {
                                    console.error('Error adding task:', (error as Error).message);
                                }
                                displayTaskMenu();
                            });
                        } else {
                            console.error('End date must be after the start date.');
                            displayTaskMenu();
                        }
                    }, startDate);
                } else {
                    displayTaskMenu();
                }
            });
        });
    }
//  wrappper class that hadles exit for each dropdowns
function handleExit(prompt: string, callback: (input: string) => void, context: 'login' | 'main' = 'main') {
    const exitMessage = context === 'login' 
        ? '(or type "exit" to return to the login menu)'
        : '(or type "exit" to return to the main menu)';

    rl.question(`${prompt} ${exitMessage}: `, (input) => {
        if (input.toLowerCase() === 'exit') {
            if (context === 'login') {
                displayLoginMenu();
            } else {
                displayMainMenu();
            }
        } else {
            callback(input);
        }
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
        
        handleExit('Enter task ID to remove', (id) => {
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
            if(tasks.length === 0) {
                console.log('empty.');
            }
            else
            {
                tasks.forEach(task => console.log(`${task.id}: ${task.description} (${task.startTime} - ${task.endTime}) [${Priority[task.priority]}]`));
            }
            
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
    
        handleExit('Enter task ID to edit', (id) => {
            const updatedTask: Partial<Task> = {};
    
            handleExit('Enter new description (or press enter to skip)', (description) => {
                if (description) updatedTask.description = description;
    
                handleExit('Enter new start time (YYYY-MM-DD HH:MM) (or press enter to skip)', (startTimeStr) => {
                    if (startTimeStr) {
                        const startTime = parseDate(startTimeStr);
                        if (startTime) {
                            updatedTask.startTime = startTime;
                        } else {
                            console.error('Invalid date format. Please use YYYY-MM-DD HH:MM.');
                            displayTaskMenu();
                            return;
                        }
                    }
    
                    handleExit('Enter new end time (YYYY-MM-DD HH:MM) (or press enter to skip)', (endTimeStr) => {
                        if (endTimeStr) {
                            const endTime = parseDate(endTimeStr);
                            if (endTime) {
                                if (updatedTask.startTime && endTime <= updatedTask.startTime) {
                                    console.error('End time must be after the start time.');
                                    displayTaskMenu();
                                    return;
                                }
                                updatedTask.endTime = endTime;
                            } else {
                                console.error('Invalid date format. Please use YYYY-MM-DD HH:MM.');
                                displayTaskMenu();
                                return;
                            }
                        }
    
                        handleExit('Enter new priority (0: Low, 1: Medium, 2: High) (or press enter to skip)', (priorityStr) => {
                            if (priorityStr) {
                                const priority = parseInt(priorityStr);
                                if (isNaN(priority) || priority < 0 || priority > 2) {
                                    console.error('Invalid priority. Please enter 0, 1, or 2.');
                                    displayTaskMenu();
                                    return;
                                }
                                updatedTask.priority = priority as Priority;
                            }
    
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
        
        handleExit('Enter task ID to mark as completed', (id) => {
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
        
        handleExit('Enter priority to view (0: Low, 1: Medium, 2: High)', (priorityStr) => {
            const priority = parseInt(priorityStr);
            
            if (isNaN(priority) || priority < 0 || priority > 2) {
                console.error('Invalid priority. Please enter 0, 1, or 2.');
                displayTaskMenu();
                return;
            }
    
            try {
                const tasks = hub.getTasksByPriority(currentUser!, priority as Priority);
                if (tasks.length === 0) {
                    console.log('No tasks found for the specified priority.');
                } else {
                    console.log(`Tasks with priority ${Priority[priority]}:`);
                    tasks.forEach(task => console.log(`${task.id}: ${task.description} (${task.startTime} - ${task.endTime})`));
                }
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
        
        handleExit('Enter device type (light, thermostat, coffeemaker)', (type) => {
            if (!['light', 'thermostat', 'coffeemaker'].includes(type.toLowerCase())) {
                console.error('Invalid device type. Please enter light, thermostat, or coffeemaker.');
                displayDeviceMenu();
                return;
            }
    
            handleExit('Enter device ID', (id) => {
                handleExit('Enter device name', (name) => {
                    try {
                        hub.addDevice(currentUser!, type.toLowerCase(), id, name);
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
            if (devices.length === 0) {
                console.log('No devices found.');
            } else {
                console.log('Your devices:');
                devices.forEach(device => console.log(`${device.getId()}: ${device.getName()} (${device.getType()})`));
            }
        } catch (error) {
            console.error('Error viewing devices:', (error as Error).message);
        }
    
        handleExit('Press Enter to return to the Device Menu', () => {
            displayDeviceMenu();
        });
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
    
        handleExit('Enter device ID to control', (id) => {
            handleExit('Enter command (e.g., "turnOn", "turnOff", "setBrightness", "setTemperature", "brew")', (command) => {
                try {
                    const device = hub.getDevice(currentUser!, id);
                    if (device) {
                        switch (command.toLowerCase()) {
                            case 'turnon':
                                (device as any).turnOn();
                                console.log('Device turned on.');
                                break;
                            case 'turnoff':
                                (device as any).turnOff();
                                console.log('Device turned off.');
                                break;
                            case 'setbrightness':
                                if (device.getType() === 'light') {
                                    handleExit('Enter brightness level (0-100)', (level) => {
                                        const brightnessLevel = parseInt(level);
                                        if (isNaN(brightnessLevel) || brightnessLevel < 0 || brightnessLevel > 100) {
                                            console.error('Invalid brightness level. Please enter a number between 0 and 100.');
                                        } else {
                                            (device as any).setBrightness(brightnessLevel);
                                            console.log(`Brightness set to ${brightnessLevel}`);
                                        }
                                        displayDeviceMenu();
                                    });
                                    return;
                                }
                                break;
                            case 'settemperature':
                                if (device.getType() === 'thermostat') {
                                    handleExit('Enter temperature', (temp) => {
                                        const temperature = parseFloat(temp);
                                        if (isNaN(temperature)) {
                                            console.error('Invalid temperature. Please enter a valid number.');
                                        } else {
                                            (device as any).setTemperature(temperature);
                                            console.log(`Temperature set to ${temperature}`);
                                        }
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
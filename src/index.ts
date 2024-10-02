import { SmartHomeHub } from './core/SmartHomeHub';
import { Priority, Task } from './core/Task';
import * as readline from 'readline';

const hub = SmartHomeHub.getInstance();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function displayMenu() {
    console.log('\nSmart Home System');
    console.log('1. Add Task');
    console.log('2. Remove Task');
    console.log('3. View All Tasks');
    console.log('4. Edit Task');
    console.log('5. Mark Task as Completed');
    console.log('6. View Tasks by Priority');
    console.log('7. Exit');
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
            console.log('Exiting Smart Home System. Goodbye!');
            rl.close();
            return;
        default:
            console.log('Invalid choice. Please try again.');
            displayMenu();
    }
}

function addTask() {
    rl.question('Enter task description: ', (description) => {
        rl.question('Enter start time (YYYY-MM-DD HH:MM): ', (startTimeStr) => {
            rl.question('Enter end time (YYYY-MM-DD HH:MM): ', (endTimeStr) => {
                rl.question('Enter priority (0: Low, 1: Medium, 2: High): ', (priorityStr) => {
                    const startTime = new Date(startTimeStr);
                    const endTime = new Date(endTimeStr);
                    const priority = parseInt(priorityStr) as Priority;
                    hub.addTask(description, startTime, endTime, priority);
                    displayMenu();
                });
            });
        });
    });
}

function removeTask() {
    rl.question('Enter task ID to remove: ', (id) => {
        hub.removeTask(id);
        displayMenu();
    });
}

function viewAllTasks() {
    const tasks = hub.getTasksSortedByStartTime();
    tasks.forEach(task => console.log(`${task.id}: ${task.description} (${task.startTime} - ${task.endTime}) [${Priority[task.priority]}]`));
    displayMenu();
}

function editTask() {
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
                        hub.editTask(id, updatedTask);
                        displayMenu();
                    });
                });
            });
        });
    });
}

function markTaskAsCompleted() {
    rl.question('Enter task ID to mark as completed: ', (id) => {
        hub.markTaskAsCompleted(id);
        displayMenu();
    });
}

function viewTasksByPriority() {
    rl.question('Enter priority to view (0: Low, 1: Medium, 2: High): ', (priorityStr) => {
        const priority = parseInt(priorityStr) as Priority;
        const tasks = hub.getTasksByPriority(priority);
        tasks.forEach(task => console.log(`${task.id}: ${task.description} (${task.startTime} - ${task.endTime})`));
        displayMenu();
    });
}

console.log('Smart Home System initialized!');
displayMenu();
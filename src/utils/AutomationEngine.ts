import { SmartDevice } from '../core/SmartDevice';
import { Command } from '../commands/Command';

interface AutomationRule {
    condition: (device: SmartDevice) => boolean;
    action: Command;
}

export class AutomationEngine {
    private rules: AutomationRule[] = [];

    public addRule(rule: AutomationRule): void {
        this.rules.push(rule);
    }

    public checkAndExecuteRules(device: SmartDevice): void {
        for (const rule of this.rules) {
            if (rule.condition(device)) {
                rule.action.execute();
            }
        }
    }

    // Additional methods for managing rules can be added here
}
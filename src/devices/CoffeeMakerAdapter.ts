import { SmartDevice } from '../core/SmartDevice';
import { ThirdPartyCoffeeMaker } from './ThirdPartyCoffeeMaker';

export class CoffeeMakerAdapter extends SmartDevice {
    private coffeeMaker: ThirdPartyCoffeeMaker;

    constructor(id: string, name: string, coffeeMaker: ThirdPartyCoffeeMaker) {
        super(id, name);
        this.coffeeMaker = coffeeMaker;
    }

    public turnOn(): void {
        this.coffeeMaker.switchOn();
        this.status = true;
    }
    // get type
    public getType(): string {
        return 'coffee-maker';
    }
    public turnOff(): void {
        this.coffeeMaker.switchOff();
        this.status = false;
    }

    public brew(): void {
        this.coffeeMaker.brew();
    }
}
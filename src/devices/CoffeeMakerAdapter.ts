import { SmartDevice } from '../core/SmartDevice';
import { ThirdPartyCoffeeMaker } from './ThirdPartyCoffeeMaker';

/**
 * Adapter class to integrate a third-party coffee maker with the SmartDevice interface.
 */
export class CoffeeMakerAdapter extends SmartDevice {
    private coffeeMaker: ThirdPartyCoffeeMaker;

    /**
     * Constructor for CoffeeMakerAdapter.
     * @param id - Unique identifier for the smart device.
     * @param name - Name of the smart device.
     * @param coffeeMaker - Instance of the third-party coffee maker to be adapted.
     */
    constructor(id: string, name: string, coffeeMaker: ThirdPartyCoffeeMaker) {
        super(id, name);
        this.coffeeMaker = coffeeMaker;
    }

    /**
     * Turns on the coffee maker.
     */
    public turnOn(): void {
        this.coffeeMaker.switchOn();
        this.status = true;
    }

    /**
     * Returns the type of the device.
     * @returns A string indicating the type of the device.
     */
    public getType(): string {
        return 'coffee-maker';
    }

    /**
     * Turns off the coffee maker.
     */
    public turnOff(): void {
        this.coffeeMaker.switchOff();
        this.status = false;
    }

    /**
     * Initiates the brewing process on the coffee maker.
     */
    public brew(): void {
        this.coffeeMaker.brew();
    }
}
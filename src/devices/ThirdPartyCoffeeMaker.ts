/**
 * This class represents a third-party coffee maker with a different interface.
 * It provides methods to switch the coffee maker on and off, and to brew coffee.
 */
export class ThirdPartyCoffeeMaker {
    private isOn: boolean = false; // Indicates whether the coffee maker is on

    /**
     * Switches the coffee maker on.
     * Sets the isOn flag to true and logs a message.
     */
    public switchOn(): void {
        this.isOn = true;
        console.log("Third-party coffee maker is switched on");
    }

    /**
     * Switches the coffee maker off.
     * Sets the isOn flag to false and logs a message.
     */
    public switchOff(): void {
        this.isOn = false;
        console.log("Third-party coffee maker is switched off");
    }

    /**
     * Brews coffee if the coffee maker is on.
     * Logs a message indicating whether brewing is successful or not.
     */
    public brew(): void {
        if (this.isOn) {
            console.log("Brewing coffee");
        } else {
            console.log("Cannot brew coffee, machine is off");
        }
    }
}
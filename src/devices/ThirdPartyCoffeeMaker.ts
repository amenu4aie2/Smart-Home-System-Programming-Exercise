// This represents a third-party coffee maker with a different interface
export class ThirdPartyCoffeeMaker {
    private isOn: boolean = false;

    public switchOn(): void {
        this.isOn = true;
        console.log("Third-party coffee maker is switched on");
    }

    public switchOff(): void {
        this.isOn = false;
        console.log("Third-party coffee maker is switched off");
    }

    public brew(): void {
        if (this.isOn) {
            console.log("Brewing coffee");
        } else {
            console.log("Cannot brew coffee, machine is off");
        }
    }
}
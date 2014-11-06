module BootstrapClient {
    export class Index extends Vidyano.Pages.Index {
        constructor() {
            super();

            this.addPage(Test, "");
            this.start();
        }
    }

    export class Test extends Vidyano.Pages.ContentPage {
        constructor(index: Index, args: IArguments) {
            super(index, "Test");
        }
    }
}

$(() => window["_index"] = new BootstrapClient.Index());
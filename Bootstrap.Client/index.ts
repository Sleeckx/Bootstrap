module BootstrapClient {
    export class Index extends Vidyano.Pages.Index {
        constructor() {
            super();

            this.addPage(Test, "");
            this.addPage(Products, "Products");
            this.start();
        }
    }

    export class Test extends Vidyano.Pages.ContentPage {
        constructor(index: Index, args: IArguments) {
            super(index, "Test");
        }
    }

    export class Products extends Vidyano.Pages.CollectionPage {
        constructor(index: Index, args: IArguments) {
            super(index, "Products");
        }
    }
}

$(() => window["_index"] = new BootstrapClient.Index());
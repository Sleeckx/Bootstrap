module BootstrapClient {
    export class Index extends Vidyano.Pages.Index {
        constructor() {
            super();

            this.addPage(Test, "");
            this.start();
        }

        initialize(): Promise<any> {
            return super.initialize(true).
                then(() => !this.service.isSignedIn ? this.service.signInUsingCredentials("test", "test") : Promise.resolve(true)).
                then(() => $(document.body).removeClass("initializing"));
        }
    }

    export class Test extends Vidyano.Pages.ContentPage {
        constructor(index: Index, args: IArguments) {
            super(index, "Test.Test");
        }
    }
}

$(() => window["_index"] = new BootstrapClient.Index());
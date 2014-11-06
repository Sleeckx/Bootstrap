module Vidyano.Pages {
    export class Page {
        templates: { [key: string]: Template } = {};
        content: string;

        constructor(public index: Index, public name: string, ...private _templateNames: string[]) {
            this.index.errorTarget.hide();
            this.index.pageTarget.empty();
        }

        get service(): Vidyano.Service {
            return this.index.service;
        }

        get isLoading(): boolean {
            return this.index.isLoading;
        }

        set isLoading(val: boolean) {
            this.index.isLoading = val;
        }

        render(target: JQuery) {
            this.index.pageTarget.attr("data-page", this.name);
            this.isLoading = false;
        }

        load(): Promise<any> {
            var templateLoaders = this._templateNames.map(name => this.templates[name] = new Template("/Templates/" + name + ".html")).map(template => (<any>template)._ready);
            var contentLoader = this.service.getPersistentObject(null, this.index.website + ".Page", this.name).then(page => {
                this.content = page.getAttributeValue("Content");
            });
            return Promise.all(templateLoaders.concat([contentLoader]));
        }
    }

    export class ContentPage extends Page {
        constructor(index: Index, name: string) {
            super(index, name);
        }

        render(target: JQuery) {
            super.render(target);

            target.html(this.content);
        }
    }

    export class Template {
        static _cachedTemplates: { [key: string]: Function } = {};
        private _template: Function;
        private _ready: Promise<any>;

        constructor(private _file: string) {
            this._template = Template._cachedTemplates[_file];

            if (this._template)
                this._ready = Promise.resolve(true);
            else {
                var fileData: string;
                this._ready = new Promise((resolve, reject) => {
                    $.ajax({
                        url: this._file,
                        dataType: "text",
                        cache: false,
                        success: data => resolve(fileData = data),
                        error: () => resolve(fileData = "")
                    });
                }).then(() => Template._cachedTemplates[_file] = this._template = _.template(fileData));
            }
        }

        create(data?: any) {
            return this._template(data);
        }
    }

    export class Index {
        private _isLoading: boolean = false;
        private _currentPage: Vidyano.Pages.Page;
        service: Vidyano.Service;
        pageTarget: JQuery;
        errorTarget: JQuery;

        constructor(private _serviceUri: string = "https://bootstrap.2sky.be", private _serviceHooks: Vidyano.ServiceHooks = new IndexServiceHooks(), private _website: string = null) {
            this.errorTarget = $("#error");
            this.pageTarget = $("#target");

            hasher.prependHash = "!/";
        }

        get isLoading(): boolean {
            return this._isLoading;
        }

        set isLoading(val: boolean) {
            $("#loading").toggleClass("show", this._isLoading = val);
        }

        get website(): string {
            return this._website || this.service.userName;
        }

        get currentPage(): Vidyano.Pages.Page {
            return this._currentPage;
        }

        addPage(createPage: any, route: string = "") {
            crossroads.addRoute(route, () => {
                var args = arguments;
                this.execute(() => {
                    var page = this._currentPage = <Vidyano.Pages.Page>new createPage(this, args);
                    return page.load().then(() => {
                        if (page = this._currentPage)
                            this._currentPage.render(this.pageTarget);
                    });
                });
            });
        }

        initialize(): Promise<any> {
            return this.execute(() => this.service.initialize().then(() => $(document.body).removeClass("initializing")));
        }

        executeError(err: any, work: () => Promise<any>, userCanRetry: boolean = true) {
            $("#error").show();
            $("#error > .msg").text(err);
            if (userCanRetry) {
                $("#error > .action").show();
                $("#error > .action").off("click").one("click", () => {
                    $("#error").hide();
                    this.execute(work, userCanRetry);
                });
            }
            else
                $("#error > .action").hide();
        }

        execute(work: () => Promise<any>, userCanRetry: boolean = true): Promise<any> {
            this.isLoading = true;
            return work().catch(err => {
                this.isLoading = false;
                this.executeError(err, work, userCanRetry);
            });
        }

        start(): Promise<any> {
            var ready: Promise<any>;
            if (this._serviceUri) {
                this.service = new Vidyano.Service(this._serviceUri, this._serviceHooks);
                this.service.ignoreMobile = true;
                this.service.environment = "Native";
                ready = this.initialize();
            }
            else
                ready = Promise.resolve(true);

            return ready.then(() => {
                var parseHash = newHash => crossroads.parse(newHash);
                (<any>hasher).prependHash = "";
                (<any>hasher).initialized.add(parseHash);
                (<any>hasher).changed.add(parseHash);
                (<any>hasher).init();
            });
        }
    }

    class IndexServiceHooks extends Vidyano.ServiceHooks {
        onSessionExpired() {
            document.location.reload();
        }
    }
}
declare module Vidyano.Pages {
    class Page {
        public index: Index;
        public name: string;
        private _templateNames;
        public templates: {
            [key: string]: Template;
        };
        public content: string;
        public autoRenderPageTemplate: boolean;
        constructor(index: Index, name: string, _templateNames?: string[]);
        public service : Service;
        public isLoading : boolean;
        public render(target: JQuery): void;
        public load(): Promise<any>;
    }
    class ContentPage extends Page {
        constructor(index: Index, name: string, templateNames?: string[]);
        public render(target: JQuery): void;
        public load(): Promise<any>;
    }
    class CollectionPage extends Page {
        public collectionName: string;
        private _collection;
        constructor(collectionName: string, index: Index, name?: string, templateNames?: string[]);
        public load(): Promise<any>;
        public items : QueryResultItem[];
    }
    class Template {
        private _file;
        static _cachedTemplates: {
            [key: string]: Function;
        };
        private _template;
        private _ready;
        constructor(_file: string);
        public create(data?: any): any;
    }
    class Index {
        private _serviceUri;
        private _serviceHooks;
        private _website;
        private _isLoading;
        private _currentPage;
        public service: Service;
        public pageTarget: JQuery;
        public errorTarget: JQuery;
        constructor(_serviceUri?: string, _serviceHooks?: ServiceHooks, _website?: string);
        public isLoading : boolean;
        public website : string;
        public currentPage : Page;
        public addPage(createPage: any, route?: string): void;
        public initialize(): Promise<any>;
        public executeError(err: any, work: () => Promise<any>, userCanRetry?: boolean): void;
        public execute(work: () => Promise<any>, userCanRetry?: boolean): Promise<any>;
        public start(): Promise<any>;
    }
}

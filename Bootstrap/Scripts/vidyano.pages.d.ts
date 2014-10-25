﻿declare module Vidyano.Pages {
    class Page {
        public index: Index;
        public name: string;
        public templates: {
            [key: string]: Template;
        };
        public content: string;
        constructor(index: Index, name: string, ..._templateNames: string[]);
        public service : Service;
        public isLoading : boolean;
        public render(target: JQuery): void;
        public load(): Promise<any>;
    }
    class ContentPage extends Page {
        constructor(index: Index, name: string);
        public render(target: JQuery): void;
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
        private _isLoading;
        private _currentPage;
        public service: Service;
        public pageTarget: JQuery;
        public errorTarget: JQuery;
        constructor(_serviceUri?: string, _serviceHooks?: ServiceHooks);
        public isLoading : boolean;
        public currentPage : Page;
        public addPage(createPage: any, route?: string): void;
        public initialize(skipDefaultLogin?: boolean): Promise<any>;
        public executeError(err: any, work: () => Promise<any>, userCanRetry?: boolean): void;
        public execute(work: () => Promise<any>, userCanRetry?: boolean): Promise<any>;
        public start(): Promise<any>;
    }
}
declare var unescape: any;
declare var Windows: any;
declare module Vidyano {
    enum NotificationType {
        Error = 0,
        Notice = 1,
        OK = 2,
    }
    interface Language {
        culture: string;
        name: string;
        isDefault: boolean;
    }
    interface Provider {
        name: string;
        parameters: linqjs.Dictionary<string, string>;
    }
    function extend(target: any, ...sources: any[]): any;
    function cookie(key: any, value: any, options?: any): any;
    function _debounce(func: Function, wait: number, immediate?: boolean): Function;
    class Service {
        public serviceUri: string;
        public hooks: ServiceHooks;
        private static _base64KeyStr;
        private _lastAuthTokenUpdate;
        private _isUsingDefaultCredentials;
        private _clientData;
        private _language;
        private _languages;
        private _providers;
        public staySignedIn: boolean;
        public isSignedIn: boolean;
        public application: Application;
        public icons: linqjs.Dictionary<string, string>;
        public actionDefinitions: linqjs.Dictionary<string, ActionDefinition>;
        public environment: string;
        public environmentVersion: string;
        public ignoreMobile: boolean;
        constructor(serviceUri: string, hooks?: ServiceHooks);
        private _createUri(method);
        private _createData(method, data?);
        private _postJSON(url, data);
        private _getJSON(url);
        private static _decodeBase64(input);
        private static _getServiceTimeString;
        public _getStream(obj: PersistentObject, action?: string, parent?: PersistentObject, query?: Query, selectedItems?: QueryResultItem[], parameters?: any): void;
        private clientData;
        public language : Language;
        public languages : Language[];
        public providers : linqjs.Dictionary<string, Provider>;
        public isUsingDefaultCredentials : boolean;
        private set_userName(val);
        public userName : string;
        private authToken;
        public getTranslatedMessage(key: string): string;
        public initialize(skipDefaultCredentialLogin?: boolean): Promise<any>;
        public signInExternal(providerName: string): void;
        public signInUsingCredentials(userName: string, password: string): Promise<any>;
        public signOut(): void;
        private _getApplication(data);
        public getQuery(id: string): Promise<Query>;
        public getPersistentObject(parent: PersistentObject, id: string, objectId?: string): Promise<PersistentObject>;
        public executeQuery(parent: PersistentObject, query: Query, asLookup?: boolean): Promise<any>;
        public executeAction(action: string, parent: PersistentObject, query: Query, selectedItems: QueryResultItem[], parameters?: any, skipHooks?: boolean): Promise<PersistentObject>;
        static getDate: (yearString: string, monthString: string, dayString: string, hourString: string, minuteString: string, secondString: string, msString: string) => Date;
        static fromServiceString(value: string, typeName: string): any;
        static toServiceString(value: any, typeName: string): string;
        static numericTypes: string[];
        static isNumericType(type: string): boolean;
    }
    class ServiceHooks {
        public createData(data: any): void;
        public setNotification(notification: string, type: NotificationType): void;
        public onSessionExpired(): void;
        public onAction(args: ExecuteActionArgs): Promise<any>;
        public onOpen(obj: ServiceObject, replaceCurrent?: boolean, fromAction?: boolean): void;
        public onClose(obj: ServiceObject): void;
        public onConstructPersistentObject(service: Service, po: any): PersistentObject;
        public onConstructPersistentObjectAttributeTab(service: Service, groups: linqjs.Enumerable<PersistentObjectAttributeGroup>, key: string, parent: PersistentObject): PersistentObjectAttributeTab;
        public onConstructPersistentObjectQueryTab(service: Service, query: Query): PersistentObjectQueryTab;
        public onConstructPersistentObjectAttributeGroup(service: Service, key: string, attributes: linqjs.Enumerable<PersistentObjectAttribute>, parent: PersistentObject): PersistentObjectAttributeGroup;
        public onConstructPersistentObjectAttribute(service: Service, attr: any, parent: PersistentObject): PersistentObjectAttribute;
        public onConstructPersistentObjectAttributeWithReference(service: Service, attr: any, parent: PersistentObject): PersistentObjectAttributeWithReference;
        public onConstructQuery(service: Service, query: any, parent?: PersistentObject, asLookup?: boolean): Query;
        public onConstructQueryResultItem(service: Service, item: any, query: Query): QueryResultItem;
        public onConstructQueryResultItemValue(service: Service, value: any): QueryResultItemValue;
        public onConstructQueryColumn(service: Service, col: any, query: Query): QueryColumn;
        public onConstructAction(service: Service, action: Action): Action;
    }
    interface ServiceClientData {
        defaultUser: string;
        exception: string;
        languages: {
            [code: string]: {
                name: string;
                isDefault: boolean;
                messages: {
                    [key: string]: string;
                };
            };
        };
        providers: {
            [name: string]: {
                parameters: {
                    label: string;
                    requestUri: string;
                    signOutUri: string;
                    redirectUri: string;
                };
            };
        };
    }
    class ExecuteActionArgs {
        private service;
        public persistentObject: PersistentObject;
        public query: Query;
        public selectedItems: QueryResultItem[];
        public parameters: any;
        private _action;
        public action: string;
        public isHandled: boolean;
        public result: PersistentObject;
        constructor(service: Service, action: string, persistentObject: PersistentObject, query: Query, selectedItems: QueryResultItem[], parameters: any);
        public executeServiceRequest(): Promise<PersistentObject>;
    }
    class ServiceObject {
        public service: Service;
        constructor(service: Service);
        public copyProperties(propertyNames: string[], includeNullValues?: boolean, result?: any): any;
    }
    class ServiceObjectWithActions extends ServiceObject {
        private _actionNames;
        public actionsByName: {
            [name: string]: Action;
        };
        public actions: Action[];
        constructor(service: Service, _actionNames?: string[]);
        public _initializeActions(): void;
    }
    class PersistentObject extends ServiceObjectWithActions {
        private _isSystem;
        private backupSecurityToken;
        private securityToken;
        private _isEditing;
        private _isDirty;
        private _inputs;
        private _queuedWork;
        public id: string;
        public type: string;
        public breadcrumb: string;
        public fullTypeName: string;
        public label: string;
        public notification: string;
        public notificationType: NotificationType;
        public objectId: string;
        public isHidden: boolean;
        public isNew: boolean;
        public isReadOnly: boolean;
        public queryLayoutMode: string;
        public newOptions: string;
        public ignoreCheckRules: boolean;
        public stateBehavior: string;
        public parent: PersistentObject;
        public ownerDetailAttribute: PersistentObjectAttribute;
        public ownerAttributeWithReference: PersistentObjectAttributeWithReference;
        public ownerPersistentObject: PersistentObject;
        public ownerQuery: Query;
        public bulkObjectIds: string;
        public queriesToRefresh: string[];
        public attributes: PersistentObjectAttribute[];
        public attributesByName: {
            [key: string]: PersistentObjectAttribute;
        };
        public tabs: PersistentObjectTab[];
        public queries: Query[];
        public queriesByName: {
            [key: string]: Query;
        };
        public isDeleted: boolean;
        public isBusy: boolean;
        public whenReady: Promise<any>;
        constructor(service: Service, po: any);
        public isSystem : boolean;
        public isEditing : boolean;
        private setIsEditing(value);
        public isDirty : boolean;
        public _setIsDirty(value: boolean): void;
        public getAttribute(name: string): PersistentObjectAttribute;
        public getAttributeValue(name: string): any;
        public getQuery(name: string): Query;
        public beginEdit(): void;
        public cancelEdit(): void;
        public save(waitForOwnerQuery?: boolean): Promise<boolean>;
        public getRegisteredInputs(): linqjs.Enumerable<linqjs.KeyValuePair<string, HTMLInputElement>>;
        public hasRegisteredInput(attributeName: string): boolean;
        public registerInput(attributeName: string, input: HTMLInputElement): void;
        public clearRegisteredInputs(): void;
        public toServiceObject(skipParent?: boolean): any;
        public refreshFromResult(result: PersistentObject): void;
        public _setNotification(notification?: string, type?: NotificationType): void;
        public _triggerAttributeRefresh(attr: PersistentObjectAttribute): Promise<boolean>;
        public _queueWork(work: () => Promise<boolean>): Promise<boolean>;
        public _prepareAttributesForRefresh(sender: PersistentObjectAttribute): void;
    }
    interface PersistentObjectAttributeKeyValue {
        key: string;
        value: string;
    }
    class PersistentObjectAttribute extends ServiceObject {
        public parent: PersistentObject;
        private _isSystem;
        private value;
        private _addedEmptyOption;
        private _backupData;
        private _queueRefresh;
        private _refreshValue;
        public id: string;
        public name: string;
        public label: string;
        public group: string;
        public tab: string;
        public isReadOnly: boolean;
        public isRequired: boolean;
        public isValueChanged: boolean;
        public options: string[];
        public keyValues: PersistentObjectAttributeKeyValue[];
        public offset: number;
        public type: string;
        public toolTip: string;
        public rules: string;
        public validationError: string;
        public visibility: string;
        public typeHints: any;
        public editTemplateKey: string;
        public templateKey: string;
        public disableSort: boolean;
        public triggersRefresh: boolean;
        public column: number;
        public columnSpan: number;
        public objects: PersistentObject[];
        constructor(service: Service, attr: any, parent: PersistentObject);
        public isSystem : boolean;
        public isVisible : boolean;
        public displayValue : string;
        public getValue(): any;
        public setValue(val: any, allowRefresh?: boolean): Promise<any>;
        public backup(): void;
        public restore(): void;
        public getTypeHint(name: string, defaultValue?: string, typeHints?: any): string;
        public registerInput(input: HTMLInputElement): void;
        public _toServiceObject(): any;
        public _refreshFromResult(resultAttr: PersistentObjectAttribute): void;
        private _triggerAttributeRefresh();
        private _setOptions(options);
    }
    class PersistentObjectAttributeWithReference extends PersistentObjectAttribute {
        public parent: PersistentObject;
        private _refreshObjectId;
        public lookup: Query;
        public objectId: string;
        public displayAttribute: string;
        public canAddNewReference: boolean;
        public selectInPlace: boolean;
        constructor(service: Service, attr: any, parent: PersistentObject);
        public addNewReference(): void;
        public changeReference(selectedItems: QueryResultItem[]): Promise<boolean>;
        public _refreshFromResult(resultAttr: PersistentObjectAttribute): void;
    }
    class PersistentObjectTab {
        public service: Service;
        public label: string;
        public target: ServiceObjectWithActions;
        public tabGroupIndex: number;
        constructor(service: Service, label: string, target: ServiceObjectWithActions);
    }
    class PersistentObjectAttributeTab extends PersistentObjectTab {
        public groups: PersistentObjectAttributeGroup[];
        public key: string;
        constructor(service: Service, groups: PersistentObjectAttributeGroup[], key: string, po: PersistentObject);
    }
    class PersistentObjectQueryTab extends PersistentObjectTab {
        public query: Query;
        constructor(service: Service, query: Query);
    }
    class PersistentObjectAttributeGroup {
        public service: Service;
        public key: string;
        public attributes: PersistentObjectAttribute[];
        public parent: PersistentObject;
        public label: string;
        constructor(service: Service, key: string, attributes: PersistentObjectAttribute[], parent: PersistentObject);
    }
    class Query extends ServiceObjectWithActions {
        public parent: PersistentObject;
        private asLookup;
        private _isReference;
        private queriedPages;
        public persistentObject: PersistentObject;
        public columns: linqjs.Enumerable<QueryColumn>;
        public id: string;
        public name: string;
        public autoQuery: boolean;
        public canRead: boolean;
        public isHidden: boolean;
        public hasSearched: boolean;
        public label: string;
        public labelWithTotalItems: string;
        public singularLabel: string;
        public notification: string;
        public notificationType: NotificationType;
        public offset: number;
        public sortOptions: string;
        public textSearch: string;
        public pageSize: number;
        public skip: number;
        public top: number;
        public totalItems: number;
        public totalItem: QueryResultItem;
        public items: QueryResultItem[];
        public allSelected: boolean;
        public groupingInfo: {
            groupedBy: string;
            type: string;
            groups: {
                name: string;
                start: number;
                count: number;
                end: number;
            }[];
        };
        constructor(service: Service, query: any, parent?: PersistentObject, asLookup?: boolean);
        public selectedItems : QueryResultItem[];
        public _toServiceObject(): any;
        public _setResult(result: any): void;
        public _setNotification(notification?: string, type?: NotificationType): void;
        public _notifySelectedItemChanged(): void;
        public getColumn(name: string): QueryColumn;
        public getItemsInMemory(start: number, length: number): QueryResultItem[];
        public getItems(start: number, length: number): Promise<QueryResultItem[]>;
        public search(): Promise<QueryResultItem[]>;
        public clone(asLookup?: boolean): Query;
        private _updateColumns(columns);
        private _updateItems(items, reset?);
        private _isChanged(result);
        private _updateLabelWithTotalItems();
    }
    class QueryColumn extends ServiceObject {
        public query: Query;
        private displayAttribute;
        public disableSort: boolean;
        public includes: string[];
        public excludes: string[];
        public label: string;
        public name: string;
        public offset: number;
        public type: string;
        public isPinned: boolean;
        public isHidden: boolean;
        public width: string;
        public typeHints: any;
        constructor(service: Service, col: any, query: Query);
        public _toServiceObject(): any;
        public getTypeHint(name: string, defaultValue?: string, typeHints?: any): string;
    }
    class QueryResultItem extends ServiceObject {
        public query: Query;
        public id: string;
        public breadcrumb: string;
        public rawValues: linqjs.Enumerable<QueryResultItemValue>;
        public typeHints: any;
        private _fullValuesByName;
        private _values;
        private _isSelected;
        constructor(service: Service, item: any, query: Query);
        public values : any;
        public isSelected : boolean;
        public getValue(key: string): any;
        public getFullValue(key: string): QueryResultItemValue;
        public getTypeHint(name: string, defaultValue?: string, typeHints?: any): string;
        public getPersistentObject(): Promise<PersistentObject>;
        public _toServiceObject(): any;
    }
    class QueryResultItemValue extends ServiceObject {
        public key: string;
        public value: string;
        public typeHints: any;
        public persistentObjectId: string;
        public objectId: string;
        constructor(service: Service, value: any);
        public _toServiceObject(): any;
    }
    class Action extends ServiceObject {
        public service: Service;
        public definition: ActionDefinition;
        public owner: ServiceObject;
        private _target;
        private _query;
        private _parent;
        public canExecute: boolean;
        public isVisible: boolean;
        private _parameters;
        private _offset;
        public displayName: string;
        public options: string[];
        public dependentActions: any[];
        constructor(service: Service, definition: ActionDefinition, owner: ServiceObject);
        public parent : PersistentObject;
        public query : Query;
        public offset : number;
        public name : string;
        public execute(option?: number, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject>;
        public _onExecute(option?: number, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject>;
        public _getParameters(parameters: any, option: any): any;
        public _onParentIsEditingChanged(isEditing: boolean): void;
        public _onParentIsDirtyChanged(isDirty: boolean): void;
        private _setNotification;
        static get(service: Service, name: string, owner: ServiceObject): Action;
        static addActions(service: Service, owner: ServiceObject, actions: Action[], actionNames: string[]): void;
    }
    module Actions {
        class RefreshQuery extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObject);
            public _onExecute(option?: number, parameters?: any, selectedItems?: QueryResultItem[]): Promise<any>;
        }
        class Filter extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObject);
        }
        class Edit extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObject);
            public _onParentIsEditingChanged(isEditing: boolean): void;
            public _onExecute(option?: number, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject>;
        }
        class EndEdit extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObject);
            public _onParentIsEditingChanged(isEditing: boolean): void;
            public _onParentIsDirtyChanged(isDirty: boolean): void;
            public _onExecute(option?: number, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject>;
        }
        class Save extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObject);
            public _onExecute(option?: number, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject>;
        }
        class CancelSave extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObject);
            public _onExecute(option?: number, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject>;
        }
        class CancelEdit extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObject);
            public _onParentIsEditingChanged(isEditing: boolean): void;
            public _onExecute(option?: number, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject>;
        }
        class ExportToExcel extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObject);
            public _onExecute(option?: number, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject>;
        }
    }
    class ActionDefinition {
        private _name;
        private _displayName;
        private _isPinned;
        private _refreshQueryOnCompleted;
        private _offset;
        private _iconData;
        private _reverseIconData;
        private _options;
        private _selectionRule;
        constructor(service: Service, item: QueryResultItem);
        public name : string;
        public displayName : string;
        public isPinned : boolean;
        public refreshQueryOnCompleted : boolean;
        public offset : number;
        public iconData : string;
        public reverseIconData : string;
        public options : string[];
        public selectionRule : (count: number) => boolean;
    }
    class Application extends PersistentObject {
        private _userId;
        private _friendlyUserName;
        private _feedbackId;
        private _userSettingsId;
        private _globalSearchId;
        private _analyticsKey;
        private _userSettings;
        private _hasManagement;
        public programUnits: ProgramUnit[];
        constructor(service: Service, po: any);
        public friendlyUserName : string;
        public feedbackId : string;
        public userSettingsId : string;
        public globalSearchId : string;
        public analyticsKey : string;
        public userSettings : any;
        public hasManagement : boolean;
    }
    class ProgramUnitItem extends ServiceObject {
        public path: string;
        public id: string;
        public title: string;
        public name: string;
        constructor(service: Service, unitItem: any, path?: string);
    }
    class ProgramUnit extends ProgramUnitItem {
        private _id;
        public offset: number;
        public openFirst: boolean;
        public items: ProgramUnitItem[];
        constructor(service: Service, unit: any);
        private _createItem(itemData);
    }
    class ProgramUnitItemGroup extends ProgramUnitItem {
        private _items;
        constructor(service: Service, unitItem: any, _items: ProgramUnitItem[]);
        public items : ProgramUnitItem[];
    }
    class ProgramUnitItemQuery extends ProgramUnitItem {
        constructor(service: Service, unitItem: any, parent: ProgramUnit);
    }
    class ProgramUnitItemPersistentObject extends ProgramUnitItem {
        constructor(service: Service, unitItem: any, parent: ProgramUnit);
    }
    class NoInternetMessage {
        private language;
        public title: string;
        public message: string;
        public tryAgain: string;
        static messages: linqjs.Dictionary<string, NoInternetMessage>;
        constructor(language: string, title: string, message: string, tryAgain: string);
        private static _getMessages();
    }
}

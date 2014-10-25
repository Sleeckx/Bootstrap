declare var unescape;
declare var Windows;

module Vidyano {
    export enum NotificationType {
        Error,
        Notice,
        OK
    }

    export interface Language {
        culture: string;
        name: string;
        isDefault: boolean;
    }

    export interface Provider {
        name: string;
        parameters: linqjs.Dictionary<string, string>;
    }

    var hasStorage = (function () {
        var vi = 'Vidyano';
        try {
            window.localStorage.setItem(vi, vi);
            window.localStorage.removeItem(vi);

            window.sessionStorage.setItem(vi, vi);
            window.sessionStorage.removeItem(vi);

            return true;
        } catch (e) {
            return false;
        }
    })();
    var locationPrefix = document.location.pathname;

    var mobile: boolean = (function (a) { return /android.+mobile|avantgo|bada\/|blackberry|bb10|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)); })(navigator.userAgent || navigator.vendor);

    export function extend(target: any, ...sources: any[]) {
        sources.forEach(source => {
            for (var key in source)
                if (source.hasOwnProperty(key))
                    target[key] = source[key];
        });

        return target;
    }

    export function cookie(key, value, options?) {
        var now = new Date();

        // key and at least value given, set cookie...
        if (arguments.length > 1 && (Object.prototype.toString.call(value) === "[object String]" || value === null || value === undefined)) {
            options = Vidyano.extend({}, options);

            if (value == null)
                options.expires = -1;

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            value = String(value);

            if (hasStorage && !options.force) {
                // Clear cookie
                document.cookie = encodeURIComponent(key) + '=; expires=' + new Date(Date.parse("2000-01-01")).toUTCString();

                // Save to localStorage/sessionStorage
                key = locationPrefix + key;

                if (options.expires) {
                    if (options.expires > now)
                        window.localStorage.setItem(key, JSON.stringify({ val: options.raw ? value : encodeURIComponent(value), exp: options.expires.toUTCString() }));
                    else
                        window.localStorage.removeItem(key);

                    window.sessionStorage.removeItem(key);
                } else {
                    window.sessionStorage.setItem(key, JSON.stringify({ val: options.raw ? value : encodeURIComponent(value) }));
                    window.localStorage.removeItem(key);
                }

                return key;
            } else {
                return (document.cookie = [
                    encodeURIComponent(key), '=',
                    options.raw ? value : encodeURIComponent(value),
                    options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                    options.path ? '; path=' + options.path : '',
                    options.domain ? '; domain=' + options.domain : '',
                    options.secure ? '; secure' : ''
                ].join(''));
            }
        }

        // key and possibly options given, get cookie...
        options = value || {};
        var decode = options.raw ? function (s) { return s; } : decodeURIComponent;

        if (hasStorage && !options.force) {
            key = locationPrefix + key;

            var item = window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
            if (item != null) {
                item = JSON.parse(item);
                if (item.exp && new Date(item.exp) < now) {
                    window.localStorage.removeItem(key);
                    return null;
                }

                return decode(item.val);
            }
        } else {
            var parts = document.cookie.split('; ');
            for (var i = 0, part; part = parts[i]; i++) {
                var pair = part.split('=');
                if (decodeURIComponent(pair[0]) === key) return decode(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB
            }
        }
        return null;
    }

    export function _debounce(func: Function, wait: number, immediate?: boolean): Function {
        var result;
        var timeout = null;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) result = func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) result = func.apply(context, args);
            return result;
        };
    }

    export class Service {
        private static _base64KeyStr: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        private _lastAuthTokenUpdate: Date = new Date();
        private _isUsingDefaultCredentials: boolean;
        private _clientData: any;
        private _language: Language;
        private _languages: Language[];
        private _providers: linqjs.Dictionary<string, Provider>;
        staySignedIn: boolean;
        isSignedIn: boolean;
        application: Application;
        icons: linqjs.Dictionary<string, string>;
        actionDefinitions: linqjs.Dictionary<string, ActionDefinition>;
        environment: string = "Web";
        environmentVersion: string = "2";
        ignoreMobile: boolean;

        constructor(public serviceUri: string, public hooks: ServiceHooks = new ServiceHooks()) {
        }

        private _createUri(method: string) {
            var uri = this.serviceUri;
            if (!StringEx.isNullOrEmpty(uri) && !uri.endsWith('/'))
                uri += '/';
            return uri + method;
        }

        private _createData(method: string, data?: any) {
            data = data || {};

            if (!this.ignoreMobile && mobile)
                data.isMobile = true;

            data.environment = this.environment;
            data.environmentVersion = this.environmentVersion;

            if (method != "getApplication") {
                data.userName = this.userName;
                data.authToken = this.authToken;
            }

            data.profile = true;

            this.hooks.createData(data);

            return data;
        }

        private _postJSON(url: string, data: any): Promise<any> {
            delete data._method;

            var createdRequest = new Date();
            return new Promise((resolve, reject) => {
                var r = new XMLHttpRequest();
                r.open("POST", url, true);
                r.overrideMimeType("application/json; charset=utf-8");
                r.onload = () => {
                    if (r.status != 200) {
                        reject(r.statusText);
                        return;
                    }

                    var result = JSON.parse(r.responseText);
                    if (result.exception == null)
                        result.exception = result.ExceptionMessage;

                    if (result.exception == null) {
                        if (createdRequest > this._lastAuthTokenUpdate) {
                            this.authToken = result.authToken;
                            this._lastAuthTokenUpdate = createdRequest;
                        }
                        //app.updateSession(result.session);
                        resolve(result);
                    } else if (result.exception == "Session expired") {
                        this.authToken = null;
                        delete data.authToken;

                        if (this.isUsingDefaultCredentials) {
                            data.userName = this._clientData.defaultUser;
                            delete data.password;
                            this._postJSON(url, data).then(resolve, reject);
                        } else {
                            reject(result.exception);
                            this.hooks.onSessionExpired();
                        }
                    }
                    else
                        reject(result.exception);
                };
                r.onerror = () => { reject(r.statusText); };

                r.send(JSON.stringify(data));
            });
        }

        private _getJSON(url: string): Promise<any> {
            return new Promise((resolve, reject) => {
                var r = new XMLHttpRequest();
                r.open("GET", url, true);
                r.onload = () => {
                    if (r.status != 200) {
                        reject(r.statusText);
                        return;
                    }

                    resolve(JSON.parse(r.responseText));
                };
                r.onerror = () => { reject(r.statusText); };

                r.send();
            });
        }

        private static _decodeBase64(input): string {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                throw "There were invalid base64 characters in the input text.";
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = Service._base64KeyStr.indexOf(input.charAt(i++));
                enc2 = Service._base64KeyStr.indexOf(input.charAt(i++));
                enc3 = Service._base64KeyStr.indexOf(input.charAt(i++));
                enc4 = Service._base64KeyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            } while (i < input.length);

            return unescape(output);
        }

        private static _getServiceTimeString = function (timeString: string, defaultValue: string) {
            if (!StringEx.isNullOrWhiteSpace(timeString)) {
                timeString = timeString.trim();

                // 00:00.0000000
                var ms = "0000000";
                var parts = timeString.split('.');
                if (parts.length == 2) {
                    ms = parts[1];
                    timeString = parts[0];
                }
                else if (parts.length != 1)
                    return defaultValue;

                var length = timeString.length;
                if (length >= 4) {
                    var values = timeString.split(':'), valuesLen = values.length;
                    var days = 0, hours, minutes, seconds = 0;

                    if ((length == 4 || length == 5) && valuesLen == 2) {
                        // [0]0:00
                        hours = parseInt(values[0], 10);
                        minutes = parseInt(values[1], 10);
                    }
                    else if ((length == 7 || length == 8) && valuesLen == 3) {
                        // [0]0:00:00
                        hours = parseInt(values[0], 10);
                        minutes = parseInt(values[1], 10);
                        seconds = parseInt(values[2], 10);
                    }
                    else if (length >= 10 && valuesLen == 4) {
                        // 0:00:00:00
                        days = parseInt(values[0], 10);
                        hours = parseInt(values[1], 10);
                        minutes = parseInt(values[2], 10);
                        seconds = parseInt(values[3], 10);
                    }
                    else
                        return defaultValue;

                    if (days != NaN && hours != NaN && minutes != NaN && seconds != NaN && days >= 0 && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59)
                        return StringEx.format("{0}:{1:d2}:{2:d2}:{3:d2}.{4}", days, hours, minutes, seconds, ms.padRight(7, '0'));
                }
            }

            return defaultValue;
        }

        _getStream(obj: PersistentObject, action?: string, parent?: PersistentObject, query?: Query, selectedItems?: Array<QueryResultItem>, parameters?: any) {
            var data = this._createData("getStream");
            data.action = action;
            if (obj != null)
                data.id = obj.objectId;
            if (parent != null)
                data.parent = parent.toServiceObject();
            if (query != null)
                data.query = query._toServiceObject();
            if (selectedItems != null)
                data.selectedItems = selectedItems.map(function (si) { return si._toServiceObject(); });
            if (parameters != null)
                data.parameters = parameters;

            var name = "iframe-vidyano-download";
            var iframe = <HTMLIFrameElement>document.querySelector("iframe[name='" + name + "']");
            if (!iframe) {
                iframe = document.createElement("iframe");
                iframe.src = "javascript:false;";
                iframe.name = name;
                iframe.style.position = "absolute";
                iframe.style.top = "-1000px";
                iframe.style.left = "-1000px";

                document.body.appendChild(iframe);
            }

            var form = document.createElement("form");
            form.enctype = "multipart/form-data";
            form.encoding = "multipart/form-data";
            form.method = "post";
            form.action = this._createUri("GetStream");
            form.target = name;

            var input = document.createElement("input");
            input.type = "hidden";
            input.name = "data";
            input.value = JSON.stringify(data);

            form.appendChild(input);
            document.body.appendChild(form);

            form.submit();
            document.body.removeChild(form);
        }

        private get clientData(): ServiceClientData {
            return this._clientData;
        }

        get language(): Language {
            return this._language;
        }
        set language(l: Language) {
            this._language = l;
        }

        get languages(): Language[] {
            return this._languages;
        }

        get providers(): linqjs.Dictionary<string, Provider> {
            return this._providers;
        }

        get isUsingDefaultCredentials(): boolean {
            return this.clientData.defaultUser != null && (this.userName == null || this.userName == this.clientData.defaultUser);
        }

        private set_userName(val: string) {
            if (this.staySignedIn)
                Vidyano.cookie("userName", val, { expires: 365 });
            else
                Vidyano.cookie("userName", val, { force: true });
        }
        get userName(): string {
            return Vidyano.cookie("userName", { force: !this.staySignedIn });
        }

        private set authToken(val: string) {
            if (this.staySignedIn)
                Vidyano.cookie("authToken", val, { expires: 14 });
            else
                Vidyano.cookie("authToken", val, { force: true });

            this.isSignedIn = !StringEx.isNullOrEmpty(val);
        }
        private get authToken(): string {
            return Vidyano.cookie("authToken", { force: !this.staySignedIn });
        }

        getTranslatedMessage(key: string): string {
            return this.clientData.languages[this.language.culture].messages[key] || key;
        }

        initialize(skipDefaultCredentialLogin: boolean = false): Promise<any> {
            return new Promise((resolve, reject) => {
                if (this._clientData == null) {
                    this._getJSON(this._createUri("GetClientData")).then(clientData => {
                        this._clientData = clientData;

                        var languages: Language[] = [];
                        for (var name in this.clientData.languages) {
                            languages.push({ culture: name, name: this.clientData.languages[name].name, isDefault: this.clientData.languages[name].isDefault });
                        }
                        this._languages = languages;
                        this.language = Enumerable.from(this._languages).firstOrDefault(l => l.isDefault);

                        var providers: Provider[] = [];
                        for (var name in this.clientData.providers) {
                            var parameters = Enumerable.empty<string>().toDictionary(i => i, i => i);
                            for (var parameter in this.clientData.providers[name].parameters) {
                                parameters.add(parameter, this.clientData.providers[name].parameters[parameter]);
                            }

                            providers.push({ name: name, parameters: parameters });
                        }
                        this._providers = Enumerable.from<Provider>(providers).toDictionary(p => p.name, p => p);

                        if (!StringEx.isNullOrEmpty(document.location.hash) && document.location.hash.startsWith("#!/SignInWithToken/")) {
                            var token = document.location.hash.substr(19);
                            var tokenParts = token.split("/", 2);
                            this.set_userName(Service._decodeBase64(tokenParts[0]));
                            this.authToken = tokenParts[1].replace("_", "/");

                            document.location.hash = "";

                            this._getApplication(this._createData("")).then(() => {
                                resolve(this._clientData);
                            }, e => {
                                    reject(e);
                                });
                        }
                        else {
                            this.set_userName(this.userName || this._clientData.defaultUser);
                            this.isSignedIn = !StringEx.isNullOrEmpty(this.authToken);

                            if (this.isSignedIn || (this._clientData.defaultUser && !skipDefaultCredentialLogin))
                                this._getApplication(this._createData("")).then(() => {
                                    resolve(this._clientData);
                                }, e => {
                                        reject(e);
                                    });
                            else
                                resolve(this._clientData);
                        }

                        return null;
                    }, e => {
                            reject(e);
                        });
                }
                else
                    resolve(this._clientData);
            });
        }

        signInExternal(providerName: string) {
            var provider = this.providers.get(providerName);
            if (provider != null) {
                var requestUri = provider.parameters.get("requestUri");
                if (typeof (Windows) != "undefined") {
                    var broker = Windows.Security.Authentication.Web.WebAuthenticationBroker;
                    var redirectUri = provider.parameters.get("redirectUri");
                    var authenticate = broker.authenticateAsync(Windows.Security.Authentication.Web.WebAuthenticationOptions.none, new Windows.Foundation.Uri(requestUri), new Windows.Foundation.Uri(redirectUri));
                    authenticate.then(result => {
                        if (result.responseStatus == Windows.Security.Authentication.Web.WebAuthenticationStatus.success) {
                            var data = this._createData("getApplication");
                            data.accessToken = result.responseData.split('#')[0].replace(redirectUri + "?code=", "");
                            data.serviceProvider = "Yammer";

                            this._getApplication(data).then(() => {
                                if (document.location.hash != "")
                                    document.location.hash = "";
                                document.location.reload();
                            }, e => {
                                    // TODO: Toast notification!
                                });
                        }
                    });
                }
                else
                    document.location.assign(requestUri);
            }
        }

        signInUsingCredentials(userName: string, password: string): Promise<any> {
            this.set_userName(userName);

            var data = this._createData("getApplication");
            data.userName = userName;
            data.password = password;

            return this._getApplication(data);
        }

        signOut() {
            this.set_userName(null);
            this.authToken = null;
            this.application = null;
        }

        private _getApplication(data: any): Promise<Application> {
            return new Promise<Application>((resolve, reject) => {
                Vidyano.cookie("staySignedIn", this.staySignedIn ? "true" : null, { force: true });
                this._postJSON(this._createUri("GetApplication"), data).then(result => {
                    if (!StringEx.isNullOrEmpty(result.exception)) {
                        reject(result.exception);
                        return;
                    }

                    if (result.application == null) {
                        reject("Unknown error");
                        return;
                    }

                    this.application = new Application(this, result.application);

                    var resourcesQuery = this.application.getQuery("Resources");
                    if (resourcesQuery)
                        this.icons = Enumerable.from(resourcesQuery.items).where(i => i.getValue("Type") == "Icon").toDictionary(i => <string>i.getValue("Key"), i => <string>i.getValue("Data"));
                    else
                        this.icons = Enumerable.empty<string>().toDictionary(i => i, i => i);
                    this.actionDefinitions = Enumerable.from(this.application.getQuery("Actions").items).toDictionary(i => <string>i.getValue("Name"), i => new ActionDefinition(this, i));

                    var clientMessagesQuery = this.application.getQuery("ClientMessages");
                    if (clientMessagesQuery)
                        clientMessagesQuery.items.forEach(msg => this.clientData.languages[result.userLanguage].messages[msg.getValue("Key")] = msg.getValue("Value"));

                    CultureInfo.currentCulture = CultureInfo.cultures.get(result.userCultureInfo) || CultureInfo.cultures.get(result.userLanguage) || CultureInfo.invariantCulture;

                    resolve(this.application);
                }, e => {
                        reject(e);
                    });
            });
        }

        getQuery(id: string): Promise<Query> {
            var data = this._createData("getQuery");
            data.id = id;

            return new Promise<Query>((resolve, reject) => {
                this._postJSON(this._createUri("GetQuery"), data).then(result => {
                    if (result.exception == null)
                        resolve(this.hooks.onConstructQuery(this, result.query));
                    else
                        reject(result.exception);
                }, e => {
                        reject(e);
                    });
            });
        }

        getPersistentObject(parent: PersistentObject, id: string, objectId?: string): Promise<PersistentObject> {
            var data = this._createData("getPersistentObject");
            data.persistentObjectTypeId = id;
            data.objectId = objectId;
            if (parent != null)
                data.parent = parent.toServiceObject();

            return new Promise<PersistentObject>((resolve, reject) => {
                this._postJSON(this._createUri("GetPersistentObject"), data).then(result => {
                    if (result.exception || (result.result && result.result.notification && result.result.notificationType == "Error"))
                        reject(result.exception || result.result.notification);
                    else
                        resolve(this.hooks.onConstructPersistentObject(this, result.result));
                }, e => {
                        reject(e);
                    });
            });
        }

        executeQuery(parent: PersistentObject, query: Query, asLookup: boolean = false): Promise<any> {
            var data = this._createData("executeQuery");
            data.query = query._toServiceObject();

            if (parent != null)
                data.parent = parent.toServiceObject();
            if (asLookup)
                data.asLookup = asLookup;

            return new Promise((resolve, reject) => {
                this._postJSON(this._createUri("ExecuteQuery"), data).then(result => {
                    if (result.exception == null) {
                        query._setResult(result.result);
                        resolve(result.result);
                    }
                    else
                        reject(result.exception);
                }, e => {
                        reject(e);
                    });
            });
        }

        executeAction(action: string, parent: PersistentObject, query: Query, selectedItems: Array<QueryResultItem>, parameters?: any, skipHooks: boolean = false): Promise<PersistentObject> {
            var isObjectAction = action.startsWith("PersistentObject.") || query == null;
            return new Promise<PersistentObject>((resolve, reject) => {
                if (!skipHooks) {
                    if (!isObjectAction)
                        query._setNotification(null);
                    else
                        parent._setNotification(null);

                    var args = new ExecuteActionArgs(this, action, parent, query, selectedItems, parameters);
                    this.hooks.onAction(args).then(() => {
                        if (args.isHandled)
                            resolve(args.result);
                        else
                            this.executeAction(action, parent, query, selectedItems, parameters, true).then(po => {
                                resolve(po);
                            }, e => {
                                    reject(e);
                                });
                    }, e => {
                            if (isObjectAction)
                                parent._setNotification(e);
                            else
                                query._setNotification(e);

                            reject(e);
                        });

                    return;
                }

                var data = this._createData("executeAction");
                data.action = action;
                if (parent != null)
                    data.parent = parent.toServiceObject();
                if (query != null)
                    data.query = query._toServiceObject();
                if (selectedItems != null)
                    data.selectedItems = selectedItems.map(item => item._toServiceObject());
                if (parameters != null)
                    data.parameters = parameters;

                if (parent != null) {
                    var inputs = parent.getRegisteredInputs();
                    if (inputs.count() > 0) {
                        var iframeName = "iframe-" + new Date();
                        var iframe = document.createElement("iframe");
                        iframe.src = "javascript:false;";
                        iframe.name = iframeName;
                        iframe.style.position = "absolute";
                        iframe.style.top = "-1000px";
                        iframe.style.left = "-1000px";

                        var clonedForm = document.createElement("form");
                        clonedForm.enctype = "multipart/form-data";
                        clonedForm.encoding = "multipart/form-data";
                        clonedForm.method = "post";
                        clonedForm.action = this._createUri("ExecuteAction");
                        clonedForm.target = iframeName;

                        var input = document.createElement("input");
                        input.type = "hidden";
                        input.name = "data";
                        input.value = JSON.stringify(data);

                        clonedForm.appendChild(input);
                        clonedForm.style.display = "none";

                        inputs.where(function (item) { return item.value.value != ""; }).forEach(function (item) {
                            var input = item.value;
                            input.name = item.key;
                            var replacement = document.createElement("input");
                            replacement.type = "file";
                            input.insertAdjacentElement("afterend", replacement);
                            (<any>input).replacement = replacement;
                            clonedForm.appendChild(input);
                        });

                        var service = this;
                        // NOTE: The first load event gets fired after the iframe has been injected into the DOM, and is used to prepare the actual submission.
                        iframe.onload = function (e: Event) {
                            // NOTE: The second load event gets fired when the response to the form submission is received. The implementation detects whether the actual payload is embedded in a <textarea> element, and prepares the required conversions to be made in that case.
                            iframe.onload = function (e: Event) {
                                var doc = this.contentWindow ? this.contentWindow.document : (this.contentDocument ? this.contentDocument : this.document),
                                    root = doc.documentElement ? doc.documentElement : doc.body,
                                    textarea = root.getElementsByTagName("textarea")[0],
                                    type = textarea ? textarea.getAttribute("data-type") : null,
                                    content = {
                                        html: root.innerHTML,
                                        text: type ?
                                        textarea.value :
                                        root ? (root.textContent || root.innerText) : null
                                    };

                                var result = JSON.parse(content.text);

                                if (result.exception == null) {
                                    iframe.src = "javascript:false;";
                                    document.body.removeChild(iframe);

                                    resolve(result.result ? service.hooks.onConstructPersistentObject(service, result.result) : null);
                                }
                                else
                                    reject(result.exception);

                                document.body.removeChild(clonedForm);
                            };

                            Array.prototype.forEach.call(clonedForm.querySelectorAll("input"), (input: HTMLInputElement) => { input.disabled = false; });
                            clonedForm.submit();
                            parent.clearRegisteredInputs();
                            inputs.forEach(item => {
                                var replacement: HTMLInputElement = (<any>item.value).replacement;
                                if (replacement != null) {
                                    var newInput = document.createElement("input");
                                    newInput.outerHTML = item.value.outerHTML;
                                    replacement.parentNode.replaceChild(newInput, replacement);
                                    parent.registerInput(item.key, newInput);
                                }
                                else
                                    parent.registerInput(item.key, item.value);
                            });
                        };

                        document.body.appendChild(clonedForm);
                        document.body.appendChild(iframe);

                        return;
                    }
                }

                this._postJSON(this._createUri("ExecuteAction"), data).then(result => {
                    resolve(result.result ? this.hooks.onConstructPersistentObject(this, result.result) : null);
                }, e => {
                        if (isObjectAction)
                            parent._setNotification(e);
                        else
                            query._setNotification(e);

                        reject(e);
                    });
            });
        }

        static getDate = function (yearString: string, monthString: string, dayString: string, hourString: string, minuteString: string, secondString: string, msString: string) {
            var year = parseInt(yearString, 10);
            var month = parseInt(monthString || "1", 10) - 1;
            var day = parseInt(dayString || "1", 10);
            var hour = parseInt(hourString || "0", 10);
            var minutes = parseInt(minuteString || "0", 10);
            var seconds = parseInt(secondString || "0", 10);
            var ms = parseInt(msString || "0", 10);

            return new Date(year, month, day, hour, minutes, seconds, ms);
        }

        static fromServiceString(value: string, typeName: string): any {
            switch (typeName) {
                case "Decimal":
                case "Single":
                case "Double":
                    if (StringEx.isNullOrEmpty(value))
                        return 0.0;

                    return parseFloat(value);

                case "NullableDecimal":
                case "NullableSingle":
                case "NullableDouble":
                    if (StringEx.isNullOrEmpty(value))
                        return null;

                    return parseFloat(value);

                case "Int16":
                case "Int32":
                case "Int64":
                case "Byte":
                case "SByte":
                    if (StringEx.isNullOrEmpty(value))
                        return 0;

                    return parseInt(value, 10);

                case "NullableInt16":
                case "NullableInt32":
                case "NullableInt64":
                case "NullableByte":
                case "NullableSByte":
                    if (StringEx.isNullOrEmpty(value))
                        return null;

                    return parseInt(value, 10);

                case "Date":
                case "NullableDate":
                case "DateTime":
                case "NullableDateTime":
                case "DateTimeOffset":
                case "NullableDateTimeOffset":
                    // Example format: 17-07-2003 00:00:00[.000] [+00:00]
                    if (!StringEx.isNullOrEmpty(value) && value.length >= 19) {
                        var parts = value.split(" ");
                        var date = parts[0].split("-");
                        var time = parts[1].split(":");
                        var dateTime = Service.getDate(date[2], date[1], date[0], time[0], time[1], time[2].substring(0, 2), time[2].length > 2 ? time[2].substr(3, 3) : null);
                        if (parts.length == 3) {
                            dateTime.netType("DateTimeOffset");
                            dateTime.netOffset(parts[2]);
                        }

                        return dateTime;
                    }

                    var now = new Date();
                    if (typeName == "Date") {
                        now.setHours(0, 0, 0, 0);
                        return now;
                    }
                    else if (typeName == "DateTime")
                        return now;
                    else if (typeName == "DateTimeOffset") {
                        now.netType("DateTimeOffset");
                        var zone = now.getTimezoneOffset() * -1;
                        var zoneHour = zone / 60;
                        var zoneMinutes = zone % 60;
                        now.netOffset(StringEx.format("{0}{1:D2}:{2:D2}", zone < 0 ? "-" : "+", zoneHour, zoneMinutes)); // +00:00
                        return now;
                    }

                    return null;

                case "Time":
                case "NullableTime":
                    return Service.toServiceString(value, typeName);

                case "Boolean":
                case "NullableBoolean":
                case "YesNo":
                    return value != null ? BooleanEx.parse(value) : null;

                default:
                    return value;
            }
        }

        static toServiceString(value: any, typeName: string): string {
            switch (typeName) {
                case "NullableDecimal":
                case "Decimal":
                case "NullableSingle":
                case "Single":
                case "NullableDouble":
                case "Double":
                case "NullableInt64":
                case "Int64":
                case "NullableUInt64":
                case "UInt64":
                case "NullableInt32":
                case "Int32":
                case "NullableUInt32":
                case "UInt32":
                case "NullableInt16":
                case "Int16":
                case "NullableUInt16":
                case "UInt16":
                case "NullableByte":
                case "Byte":
                case "NullableSByte":
                case "SByte":
                    if (StringEx.isNullOrEmpty(value) && !typeName.startsWith("Nullable"))
                        return "0";

                    break;

                case "Date":
                case "NullableDate":
                case "DateTime":
                case "NullableDateTime":
                    if (!StringEx.isNullOrEmpty(value)) {
                        var date = value;
                        if (typeof (date) == "string")
                            date = new Date(value);

                        return date.format("dd-MM-yyyy HH:mm:ss.fff").trimEnd('0').trimEnd('.');
                    }

                    break;

                case "DateTimeOffset":
                case "NullableDateTimeOffset":
                    if (!StringEx.isNullOrEmpty(value)) {
                        var dateOffset = value;
                        if (typeof (value) == "string") {
                            if (value.length >= 23 && value.length <= 30) {
                                var dateParts = value.split(" ");

                                dateOffset = new Date(dateParts[0] + " " + dateParts[1]);
                                dateOffset.netOffset(dateParts[2]);
                                dateOffset.netType("DateTimeOffset");
                            }
                            else
                                return null;
                        }

                        return dateOffset.format("dd-MM-yyyy HH:mm:ss") + " " + (dateOffset.netOffset() || "+00:00");
                    }

                    break;

                case "Boolean":
                case "NullableBoolean":
                case "YesNo":
                    if (value == null)
                        return null;

                    if (typeof (value) == "string")
                        value = BooleanEx.parse(value);

                    return value ? "true" : "false";

                case "Time":
                    return Service._getServiceTimeString(value, "0:00:00:00.0000000");

                case "NullableTime":
                    return Service._getServiceTimeString(value, null);
            }

            return typeof (value) == "string" || value == null ? value : String(value);
        }

        static numericTypes = [
            "NullableDecimal",
            "Decimal",
            "NullableSingle",
            "Single",
            "NullableDouble",
            "Double",
            "NullableInt64",
            "Int64",
            "NullableUInt64",
            "UInt64",
            "NullableInt32",
            "Int32",
            "NullableUInt32",
            "UInt32",
            "NullableInt16",
            "Int16",
            "NullableUInt16",
            "UInt16",
            "NullableByte",
            "Byte",
            "NullableSByte",
            "SByte"
        ];

        static isNumericType(type: string): boolean {
            return Service.numericTypes.indexOf(type) >= 0;
        }
    }

    export class ServiceHooks {
        createData(data: any) {
        }

        setNotification(notification: string, type: NotificationType) {
        }

        onSessionExpired() {
        }

        onAction(args: ExecuteActionArgs): Promise<any> {
            return Promise.resolve(null);
        }

        onOpen(obj: ServiceObject, replaceCurrent: boolean = false, fromAction: boolean = false) {
        }

        onClose(obj: ServiceObject) {
        }

        onConstructPersistentObject(service: Service, po: any): PersistentObject {
            return new PersistentObject(service, po);
        }

        onConstructPersistentObjectAttributeTab(service: Service, groups: linqjs.Enumerable<PersistentObjectAttributeGroup>, key: string, parent: PersistentObject): PersistentObjectAttributeTab {
            return new PersistentObjectAttributeTab(service, groups.toArray(), key, parent);
        }

        onConstructPersistentObjectQueryTab(service: Service, query: Query): PersistentObjectQueryTab {
            return new PersistentObjectQueryTab(service, query);
        }

        onConstructPersistentObjectAttributeGroup(service: Service, key: string, attributes: linqjs.Enumerable<PersistentObjectAttribute>, parent: PersistentObject) {
            return new PersistentObjectAttributeGroup(service, key, attributes.toArray(), parent);
        }

        onConstructPersistentObjectAttribute(service: Service, attr: any, parent: PersistentObject) {
            return new PersistentObjectAttribute(service, attr, parent);
        }

        onConstructPersistentObjectAttributeWithReference(service: Service, attr: any, parent: PersistentObject) {
            return new PersistentObjectAttributeWithReference(service, attr, parent);
        }

        onConstructQuery(service: Service, query: any, parent?: PersistentObject, asLookup: boolean = false) {
            return new Query(service, query, parent, asLookup);
        }

        onConstructQueryResultItem(service: Service, item: any, query: Query) {
            return new QueryResultItem(service, item, query);
        }

        onConstructQueryResultItemValue(service: Service, value: any) {
            return new QueryResultItemValue(service, value);
        }

        onConstructQueryColumn(service: Service, col: any, query: Query) {
            return new QueryColumn(service, col, query);
        }

        onConstructAction(service: Service, action: Action): Action {
            return action;
        }
    }

    export interface ServiceClientData {
        defaultUser: string;
        exception: string;
        languages: { [code: string]: { name: string; isDefault: boolean; messages: { [key: string]: string; } } };
        providers: { [name: string]: { parameters: { label: string; requestUri: string; signOutUri: string; redirectUri: string; } } };
    }

    export class ExecuteActionArgs {
        private _action: string;

        action: string;
        isHandled: boolean = false;
        result: PersistentObject;

        constructor(private service: Service, action: string, public persistentObject: PersistentObject, public query: Query, public selectedItems: Array<QueryResultItem>, public parameters: any) {
            this._action = action;
            this.action = action.split(".")[1];
        }

        executeServiceRequest(): Promise<PersistentObject> {
            return new Promise<PersistentObject>((resolve, reject) => {
                this.service.executeAction(this.action, this.persistentObject, this.query, this.selectedItems, this.parameters, true).then(result => {
                    this.result = result;
                    resolve(result);
                }, e => {
                        reject(e);
                    });

            });
        }
    }

    export class ServiceObject {
        constructor(public service: Service) {
        }

        copyProperties(propertyNames: Array<string>, includeNullValues?: boolean, result?: any): any {
            result = result || {};
            propertyNames.forEach(p => {
                var value = this[p];
                if (includeNullValues || (value != null && value !== false && (value !== 0 || p == "pageSize") && (!Array.isArray(value) || value.length > 0)))
                    result[p] = value;
            });
            return result;
        }
    }

    export class ServiceObjectWithActions extends ServiceObject {
        actionsByName: {
            [name: string]: Action
        } = {};
        actions: Action[] = [];

        constructor(service: Service, private _actionNames: string[]= []) {
            super(service);
        }

        _initializeActions() {
            Action.addActions(this.service, this, this.actions, this._actionNames);
            this.actions.forEach(a => {
                this.actionsByName[a.name] = a;
            });
        }
    }

    export class PersistentObject extends ServiceObjectWithActions {
        private _isSystem: boolean;
        private backupSecurityToken: string;
        private securityToken: string;
        private _isEditing: boolean = false;
        private _isDirty: boolean = false;
        private _inputs: linqjs.Dictionary<string, HTMLInputElement> = Enumerable.empty<string>().toDictionary(i => i, i => null);
        private _queuedWork: Array<() => Promise<boolean>> = [];

        id: string;
        type: string;
        breadcrumb: string;
        fullTypeName: string;
        label: string;
        notification: string;
        notificationType: NotificationType;
        objectId: string;
        isHidden: boolean;
        isNew: boolean;
        isReadOnly: boolean;
        queryLayoutMode: string;
        newOptions: string;
        ignoreCheckRules: boolean;
        stateBehavior: string;
        parent: PersistentObject;
        ownerDetailAttribute: PersistentObjectAttribute;
        ownerAttributeWithReference: PersistentObjectAttributeWithReference;
        ownerPersistentObject: PersistentObject;
        ownerQuery: Query;
        bulkObjectIds: string;
        queriesToRefresh: Array<string> = [];
        attributes: PersistentObjectAttribute[];
        attributesByName: { [key: string]: PersistentObjectAttribute } = {};
        tabs: PersistentObjectTab[];
        queries: Query[];
        queriesByName: { [key: string]: Query } = {};
        isDeleted: boolean;
        isBusy: boolean;
        whenReady: Promise<any> = Promise.resolve(true);

        constructor(service: Service, po: any) {
            super(service, (po._actionNames || po.actions || []).map(a => a == "Edit" && po.isNew ? "Save" : a));

            this.id = po.id;
            this._isSystem = !!po.isSystem;
            this.type = po.type;
            this.label = po.label;
            this.fullTypeName = po.fullTypeName;
            this.queryLayoutMode = po.queryLayoutMode;
            this.objectId = po.objectId;
            this.breadcrumb = po.breadcrumb;
            this.notification = po.notification;
            this.notificationType = typeof (po.notificationType) == "number" ? po.notificationType : NotificationType[<string>po.notificationType];
            this.isNew = !!po.isNew;
            this.newOptions = po.newOptions;
            this.isReadOnly = !!po.isReadOnly;
            this.isHidden = !!po.isHidden;
            this.ignoreCheckRules = !!po.ignoreCheckRules;
            this.stateBehavior = po.stateBehavior || "None";
            this.setIsEditing(false);
            this.securityToken = po.securityToken;
            this.bulkObjectIds = po.bulkObjectIds;
            this.queriesToRefresh = po.queriesToRefresh || [];
            this.parent = po.parent != null ? service.hooks.onConstructPersistentObject(service, po.parent) : null;

            this.attributes = po.attributes ? Enumerable.from<PersistentObjectAttribute>(po.attributes).select(attr => {
                return (<PersistentObjectAttributeWithReference>attr).displayAttribute || (<PersistentObjectAttributeWithReference>attr).objectId ? this.service.hooks.onConstructPersistentObjectAttributeWithReference(this.service, attr, this) : this.service.hooks.onConstructPersistentObjectAttribute(this.service, attr, this);
            }).toArray() : [];
            this.attributes.forEach(attr => this.attributesByName[attr.name] = attr);

            this.queries = po.queries ? Enumerable.from<Query>(po.queries).select(query => service.hooks.onConstructQuery(service, query, this)).orderBy(q => q.offset).toArray() : [];
            this.queries.forEach(query => this.queriesByName[query.name] = query);

            var visibility = this.isNew ? "New" : "Read";
            var attributeTabs = po.tabs ? Enumerable.from<PersistentObjectTab>(Enumerable.from(this.attributes).where(attr => attr.visibility == "Always" || attr.visibility.contains(visibility)).orderBy(attr => attr.offset).groupBy(attr => attr.tab, attr => attr).select(tab => {
                var groups = tab.orderBy(attr => attr.offset).groupBy(attr => attr.group, attr => attr).select(group => this.service.hooks.onConstructPersistentObjectAttributeGroup(service, group.key(), group, this)).memoize();
                return this.service.hooks.onConstructPersistentObjectAttributeTab(service, groups, tab.key(), this);
            })).toArray() : [];
            this.tabs = attributeTabs.concat(Enumerable.from(this.queries).select(q => <PersistentObjectTab>this.service.hooks.onConstructPersistentObjectQueryTab(this.service, q)).toArray());

            if (this.isNew || this.stateBehavior == "OpenInEdit" || this.stateBehavior.indexOf("OpenInEdit") >= 0 || this.stateBehavior == "StayInEdit" || this.stateBehavior.indexOf("StayInEdit") >= 0)
                this.beginEdit();

            this._initializeActions();
        }

        get isSystem(): boolean {
            return this._isSystem;
        }

        get isEditing(): boolean {
            return this._isEditing;
        }
        private setIsEditing(value: boolean) {
            this._isEditing = value;
            this.actions.forEach(action => action._onParentIsEditingChanged(value));
        }

        get isDirty(): boolean {
            return this._isDirty;
        }
        _setIsDirty(value: boolean) {
            this._isDirty = value;
            this.actions.forEach(action => action._onParentIsDirtyChanged(value));
        }

        getAttribute(name: string): PersistentObjectAttribute {
            return this.attributesByName[name];
        }

        getAttributeValue(name: string): any {
            var attr = this.getAttribute(name);
            return attr != null ? attr.getValue() : null;
        }

        getQuery(name: string): Query {
            return this.queriesByName[name];
        }

        beginEdit() {
            if (!this.isEditing) {
                this.backupSecurityToken = this.securityToken;
                this.attributes.forEach(attr => attr.backup());

                this.setIsEditing(true);
            }
        }

        cancelEdit() {
            if (this.isEditing) {
                this.setIsEditing(false);
                this._setIsDirty(false);

                this.securityToken = this.backupSecurityToken;
                this.attributes.forEach(attr => attr.restore());

                if (this.stateBehavior == "StayInEdit" || this.stateBehavior.indexOf("StayInEdit") >= 0)
                    this.beginEdit();
            }
        }

        save(waitForOwnerQuery?: boolean): Promise<boolean> {
            return this._queueWork(() => new Promise<boolean>((resolve, reject) => {
                if (this.isEditing) {
                    this.service.executeAction("PersistentObject.Save", this, null, null, null).then(po => {
                        if (po) {
                            var wasNew = this.isNew;
                            this.refreshFromResult(po);

                            if (StringEx.isNullOrWhiteSpace(this.notification) || this.notificationType != NotificationType.Error) {
                                this._setIsDirty(false);

                                if (!wasNew) {
                                    this.setIsEditing(false);
                                    if (this.stateBehavior == "StayInEdit" || this.stateBehavior.indexOf("StayInEdit") >= 0)
                                        this.beginEdit();
                                }

                                if (this.ownerAttributeWithReference) {
                                    if (this.ownerAttributeWithReference.objectId != this.objectId) {
                                        var parent = this.ownerAttributeWithReference.parent;
                                        if (parent.ownerDetailAttribute != null)
                                            parent = parent.ownerDetailAttribute.parent;
                                        parent.beginEdit();

                                        this.ownerAttributeWithReference.changeReference([this.service.hooks.onConstructQueryResultItem(this.service, { id: po.objectId }, null)]);
                                    }
                                    else if ((<any>this.ownerAttributeWithReference).value != this.breadcrumb)
                                        (<any>this.ownerAttributeWithReference).value = this.breadcrumb;
                                }
                                else if (this.ownerQuery)
                                    this.ownerQuery.search().then(() => {
                                        resolve(true);
                                    }, () => {
                                            resolve(true);
                                        });

                                if (waitForOwnerQuery !== true || !this.ownerQuery)
                                    resolve(true);
                            }
                            else if (!StringEx.isNullOrWhiteSpace(this.notification))
                                reject(this.notification);
                        }
                    }, e => {
                            reject(e);
                        });
                }
                else
                    resolve(true);
            }));
        }

        getRegisteredInputs(): linqjs.Enumerable<linqjs.KeyValuePair<string, HTMLInputElement>> {
            return this._inputs.toEnumerable().memoize();
        }

        hasRegisteredInput(attributeName: string): boolean {
            return !!this._inputs.contains(attributeName);
        }

        registerInput(attributeName: string, input: HTMLInputElement) {
            this._inputs.add(attributeName, input);
        }

        clearRegisteredInputs() {
            this._inputs.clear();
        }

        toServiceObject(skipParent: boolean = false): any {
            var result = this.copyProperties(["id", "type", "objectId", "isNew", "isHidden", "bulkObjectIds", "securityToken", "isSystem"]);

            if (this.parent && !skipParent)
                result.parent = this.parent.toServiceObject();
            if (this.attributes)
                result.attributes = Enumerable.from(this.attributes).select(attr => attr._toServiceObject()).toArray();

            return result;
        }

        refreshFromResult(result: PersistentObject) {
            this._setNotification(result.notification, result.notificationType);

            var resultAttributesEnum = Enumerable.from(result.attributes);
            if (this.attributes.length != result.attributes.length ||
                JSON.stringify(Enumerable.from(this.attributes).orderBy(a => a.id).select(a => a.id).toArray()) != JSON.stringify(resultAttributesEnum.orderBy(a => a.id).select(a => a.id).toArray())) {
                this._setNotification("Could not refresh from server result. One or more attributes don't match.", NotificationType.Error);
                return;
            }

            this.attributes.forEach(attr => {
                var serviceAttr = resultAttributesEnum.firstOrDefault(a => a.id == attr.id);
                if (serviceAttr)
                    attr._refreshFromResult(serviceAttr);
            });

            if (this.isNew) {
                this.objectId = result.objectId;
                this.isNew = result.isNew;
            }

            this.securityToken = result.securityToken;
            if (result.breadcrumb)
                this.breadcrumb = result.breadcrumb;

            result.queriesToRefresh.forEach(id => {
                var query = Enumerable.from(this.queries).firstOrDefault(q => q.id == id || q.name == id);
                if (query && query.hasSearched) {
                    query.search();
                }
            });
        }

        _setNotification(notification?: string, type: NotificationType = NotificationType.Error) {
            this.notification = notification;
            this.notificationType = type;
        }

        _triggerAttributeRefresh(attr: PersistentObjectAttribute): Promise<boolean> {
            return this._queueWork(() => {
                return new Promise<any>((resolve, reject) => {
                    var parameters = [{ RefreshedPersistentObjectAttributeId: attr.id }];

                    this._prepareAttributesForRefresh(attr);
                    this.service.executeAction("PersistentObject.Refresh", this, null, null, parameters).then((result) => {
                        if (this.isEditing)
                            this.refreshFromResult(result);

                        resolve(true);
                    }, e=> {
                            reject(e);
                        });
                });
            });
        }

        _queueWork(work: () => Promise<boolean>): Promise<boolean> {
            this.isBusy = true;

            this._queuedWork.push(work);
            this.whenReady = this.whenReady.then(() => {
                if (this._queuedWork.length > 0) {
                    return this._queuedWork.splice(0, 1)[0]().then(() => {
                        this.isBusy = this._queuedWork.length == 0;
                        return Promise.resolve(true);
                    }, e => {
                            this._queuedWork = [];
                            this.isBusy = false;

                            this._setNotification(e, NotificationType.Error);

                            this.whenReady = Promise.resolve(true);
                            return Promise.reject(e);
                        });
                }
                else {
                    this.isBusy = this._queuedWork.length == 0;
                    return Promise.resolve(true);
                }
            });

            return this.whenReady;
        }

        _prepareAttributesForRefresh(sender: PersistentObjectAttribute) {
            Enumerable.from(this.attributes).where(a => a.id != sender.id).forEach(attr => {
                (<any>attr)._refreshValue = (<any>attr).value;
                if (attr instanceof PersistentObjectAttributeWithReference) {
                    var attrWithRef = <any>attr;
                    attrWithRef._refreshObjectId = attrWithRef.objectId;
                }
            });
        }
    }

    export interface PersistentObjectAttributeKeyValue {
        key: string;
        value: string;
    }

    export class PersistentObjectAttribute extends ServiceObject {
        private _isSystem: boolean;
        private value: string;
        private _addedEmptyOption: boolean = false;
        private _backupData: any;
        private _queueRefresh: boolean = false;
        private _refreshValue: string;

        id: string;
        name: string;
        label: string;
        group: string;
        tab: string;
        isReadOnly: boolean;
        isRequired: boolean;
        isValueChanged: boolean;
        options: string[];
        keyValues: PersistentObjectAttributeKeyValue[];
        offset: number;
        type: string;
        toolTip: string;
        rules: string;
        validationError: string;
        visibility: string;
        typeHints: any;
        editTemplateKey: string;
        templateKey: string;
        disableSort: boolean;
        triggersRefresh: boolean;
        column: number;
        columnSpan: number;
        objects: Array<PersistentObject>;

        constructor(service: Service, attr: any, public parent: PersistentObject) {
            super(service);

            this.id = attr.id;
            this._isSystem = !!attr.isSystem;
            this.name = attr.name;
            this.type = attr.type;
            this.label = attr.label;
            this.value = attr.value;
            this.group = attr.group;
            this.tab = attr.tab;
            this.isReadOnly = !!attr.isReadOnly;
            this.isRequired = !!attr.isRequired;
            this.isValueChanged = !!attr.isValueChanged;
            this.offset = attr.offset || 0;
            this.toolTip = attr.toolTip;
            this.rules = attr.rules;
            this.validationError = attr.validationError;
            this.visibility = attr.visibility;
            this.typeHints = attr.typeHints || {};
            this.editTemplateKey = attr.editTemplateKey;
            this.templateKey = attr.templateKey;
            this.disableSort = !!attr.disableSort;
            this.triggersRefresh = !!attr.triggersRefresh;
            this.column = attr.column;
            this.columnSpan = attr.columnSpan || 0;
            this._setOptions(attr.options);
        }

        get isSystem(): boolean {
            return this._isSystem;
        }

        get isVisible(): boolean {
            return this.visibility.indexOf("Always") >= 0 || this.visibility.indexOf(this.parent.isNew ? "New" : "Read") >= 0;
        }

        get displayValue(): string {
            var format = this.getTypeHint("DisplayFormat", "{0}");

            var value = Service.fromServiceString(this.value, this.type);
            if (value != null && (this.type == "Boolean" || this.type == "NullableBoolean"))
                value = this.service.getTranslatedMessage(value ? this.getTypeHint("TrueKey", "True") : this.getTypeHint("FalseKey", "False"));
            else if (this.type == "YesNo")
                value = this.service.getTranslatedMessage(value ? this.getTypeHint("TrueKey", "Yes") : this.getTypeHint("FalseKey", "No"));
            else if (this.type == "KeyValueList") {
                if (this.keyValues && this.keyValues.length > 0) {
                    var isEmpty = StringEx.isNullOrEmpty(value);
                    var option = Enumerable.from(this.keyValues).firstOrDefault(o => o.key == value || (isEmpty && StringEx.isNullOrEmpty(o.key)));
                    if (this.isRequired && option == null)
                        option = Enumerable.from(this.keyValues).firstOrDefault(o => StringEx.isNullOrEmpty(o.key));

                    if (option != null)
                        value = option.value;
                    else if (this.isRequired)
                        value = "";
                }
            }
            else if (value != null && (this.type == "Time" || this.type == "NullableTime")) {
                value = value.trimEnd('0').trimEnd('.');
                if (value.startsWith('0:'))
                    value = value.substr(2);
                if (value.endsWith(':00'))
                    value = value.substr(0, value.length - 3);
            }

            if (format == "{0}") {
                if (this.type == "Date" || this.type == "NullableDate")
                    format = "{0:" + CultureInfo.currentCulture.dateFormat.shortDatePattern + "}";
                else if (this.type == "DateTime" || this.type == "NullableDateTime")
                    format = "{0:" + CultureInfo.currentCulture.dateFormat.shortDatePattern + " " + CultureInfo.currentCulture.dateFormat.shortTimePattern + "}";
            }

            var span = document.createElement("span");
            span.innerText = value != null ? StringEx.format(format, value) : "";
            var text = span.innerHTML;
            if ((this.type == "String" || this.type == "MultiLineString" || this.type == "TranslatedString") && value != null) {
                if (this.getTypeHint("Language") != null)
                    return "<pre>" + text + "</pre>";

                text = text.replace(/\r?\n|\r/g, "<br/>").replace(/\s(?=\s)/g, "&nbsp;");
            }

            return text;
        }

        getValue(): any {
            return Service.fromServiceString(this.value, this.type);
        }

        setValue(val: any, allowRefresh: boolean = true): Promise<any> {
            return new Promise<any>((resolve, reject) => {
                if (!this.parent.isEditing || this.isReadOnly) {
                    resolve(this.value);
                    return;
                }

                var newValue = Service.toServiceString(val, this.type);
                var queuedTriggersRefresh = null;

                // If value is equal
                if ((this.value == null && StringEx.isNullOrEmpty(newValue)) || this.value == newValue) {
                    if (allowRefresh && this._queueRefresh)
                        queuedTriggersRefresh = this._triggerAttributeRefresh();
                }
                else {
                    this.value = newValue;
                    this.isValueChanged = true;

                    if (this.triggersRefresh) {
                        if (allowRefresh)
                            queuedTriggersRefresh = this._triggerAttributeRefresh();
                        else
                            this._queueRefresh = true;
                    }

                    this.parent._setIsDirty(true);
                }

                if (queuedTriggersRefresh)
                    queuedTriggersRefresh.then(resolve, reject);
                else
                    resolve(this.value);
            });
        }

        backup() {
            this._backupData = this.copyProperties(["value", "isReadOnly", "isValueChanged", "options", "objectId", "validationError", "visibility"], true);
        }

        restore() {
            for (var name in this._backupData)
                this[name] = this._backupData[name];

            this._backupData = {};
        }

        getTypeHint(name: string, defaultValue?: string, typeHints?: any): string {
            if (typeHints != null) {
                if (this.typeHints != null)
                    typeHints = Vidyano.extend({}, typeHints, this.typeHints);
            }
            else
                typeHints = this.typeHints;

            if (typeHints != null) {
                var typeHint = typeHints[name];
                if (typeHint == null) {
                    // NOTE: Look again case-insensitive
                    var lowerName = name.toLowerCase();
                    for (var prop in typeHints) {
                        if (lowerName == prop.toLowerCase()) {
                            typeHint = typeHints[prop];
                            break;
                        }
                    }
                }

                if (typeHint != null)
                    return typeHint;
            }

            return defaultValue;
        }

        registerInput(input: HTMLInputElement) {
            this.parent.registerInput(this.name, input);
        }

        _toServiceObject() {
            var result = this.copyProperties(["id", "name", "value", "label", "options", "type", "isReadOnly", "triggersRefresh", "isRequired", "differsInBulkEditMode", "isValueChanged", "displayAttribute", "objectId", "visibility"]);
            if (this._addedEmptyOption)
                result.options = result.options.slice(1, result.options.length);

            if (this.objects != null) {
                result.asDetail = true;
                result.objects = this.objects.map(obj => {
                    var detailObj = obj.toServiceObject(true);
                    if (obj.isDeleted)
                        detailObj.isDeleted = true;

                    return detailObj;
                });
            }

            return result;
        }

        _refreshFromResult(resultAttr: PersistentObjectAttribute) {
            this._setOptions(resultAttr.options);
            this.isReadOnly = resultAttr.isReadOnly;
            this.isRequired = resultAttr.isRequired;
            this.visibility = resultAttr.visibility;
            if ((!this.isReadOnly && this._refreshValue !== undefined ? this._refreshValue : this.value) != resultAttr.value)
                this.value = resultAttr.value;
            this._refreshValue = undefined;
            this.triggersRefresh = resultAttr.triggersRefresh;
            this.isValueChanged = resultAttr.isValueChanged;
            this.validationError = resultAttr.validationError;
        }

        private _triggerAttributeRefresh(): Promise<any> {
            this._queueRefresh = false;
            return this.parent._triggerAttributeRefresh(this);
        }

        private _setOptions(options: string[]) {
            if (this.type != "Enum" && this.type != "FlagsEnum" && this.type != "KeyValueList" && this.type != "Reference" && !this.isRequired && !Enumerable.from(this.options).firstOrDefault(o => o == null)) {
                this.options = [null].concat(options);
                this._addedEmptyOption = true;
            }
            else {
                this.options = options;
                if (this.type == "KeyValueList" || this.type == "Enum" || this.type == "FlasgEnum" || this.type == "Reference") {
                    var kvp = this.isRequired ? [] : [{ key: null, value: "" }];
                    this.keyValues = kvp.concat(Enumerable.from(this.options).select(o => o.split("=", 2)).select(oParts => { return { key: oParts[0], value: oParts[1] }; }).toArray());
                }
                this._addedEmptyOption = false;
            }
        }
    }

    export class PersistentObjectAttributeWithReference extends PersistentObjectAttribute {
        // TODO: asDetail/objects
        private _refreshObjectId: string;

        lookup: Query;
        objectId: string;
        displayAttribute: string;
        canAddNewReference: boolean;
        selectInPlace: boolean;

        constructor(service: Service, attr: any, public parent: PersistentObject) {
            super(service, attr, parent);

            if (attr.lookup)
                this.lookup = this.service.hooks.onConstructQuery(service, attr.lookup, parent);

            this.objectId = attr.objectId;
            this.displayAttribute = attr.displayAttribute;
            this.canAddNewReference = !!attr.canAddNewReference;
            this.selectInPlace = !!attr.selectInPlace;
        }

        addNewReference() {
            if (this.isReadOnly)
                return;

            this.service.executeAction("Query.New", this.parent, this.lookup, null, { PersistentObjectAttributeId: this.id }).then(
                po => {
                    po.ownerAttributeWithReference = this;
                    this.service.hooks.onOpen(po, false, true);
                },
                error => {
                    this.parent._setNotification(error, NotificationType.Error);
                });
        }

        changeReference(selectedItems: Array<QueryResultItem>): Promise<boolean> {
            return this.parent._queueWork(() => new Promise<boolean>((resolve, reject) => {
                if (this.isReadOnly)
                    reject("Attribute is read-only.");
                else {
                    this.parent._prepareAttributesForRefresh(this);
                    this.service.executeAction("PersistentObject.SelectReference", this.parent, this.lookup, selectedItems, [{ PersistentObjectAttributeId: this.id }]).then(result => {
                        if (result)
                            this.parent.refreshFromResult(result);

                        resolve(true);
                    }, e => reject(e));
                }
            }));
        }

        _refreshFromResult(resultAttr: PersistentObjectAttribute) {
            super._refreshFromResult(resultAttr);

            var resultAttrWithRef = <PersistentObjectAttributeWithReference>resultAttr;
            if ((!this.isReadOnly && this._refreshObjectId !== undefined ? this._refreshObjectId : this.objectId) != resultAttrWithRef.objectId)
                this.objectId = resultAttrWithRef.objectId;
            this._refreshObjectId = undefined;
            this.displayAttribute = resultAttrWithRef.displayAttribute;
            this.canAddNewReference = resultAttrWithRef.canAddNewReference;
            //this.selectInPlace = resultAttrWithRef.selectInPlace;
        }
    }

    export class PersistentObjectTab {
        tabGroupIndex: number;

        constructor(public service: Service, public label: string, public target: ServiceObjectWithActions) {
        }
    }

    export class PersistentObjectAttributeTab extends PersistentObjectTab {
        constructor(service: Service, public groups: PersistentObjectAttributeGroup[], public key: string, po: PersistentObject) {
            super(service, StringEx.isNullOrEmpty(key) ? po.label : key, po);
            this.tabGroupIndex = 0;
        }
    }

    export class PersistentObjectQueryTab extends PersistentObjectTab {
        constructor(service: Service, public query: Query) {
            super(service, query.label, query);
            this.tabGroupIndex = 1;
        }
    }

    export class PersistentObjectAttributeGroup {
        label: string;

        constructor(public service: Service, public key: string, public attributes: PersistentObjectAttribute[], public parent: PersistentObject) {
            this.label = StringEx.isNullOrEmpty(key) ? "Attributes" : key;
        }
    }

    export class Query extends ServiceObjectWithActions {
        private asLookup: boolean;
        private _isReference: boolean = false;
        private queriedPages: Array<number> = [];

        persistentObject: PersistentObject;
        columns: linqjs.Enumerable<QueryColumn>;
        id: string;
        name: string;
        autoQuery: boolean;
        canRead: boolean;
        isHidden: boolean;
        hasSearched: boolean;
        label: string;
        labelWithTotalItems: string;
        singularLabel: string;
        notification: string;
        notificationType: NotificationType;
        offset: number;
        sortOptions: string;
        textSearch: string;
        pageSize: number;
        skip: number;
        top: number;
        totalItems: number;
        totalItem: QueryResultItem;
        items: QueryResultItem[];
        allSelected: boolean;
        groupingInfo: {
            groupedBy: string;
            type: string;
            groups: {
                name: string;
                start: number;
                count: number;
                end: number;
            }[];
        };

        constructor(service: Service, query: any, public parent?: PersistentObject, asLookup: boolean = false) {
            super(service, query._actionNames || query.actions);

            this.asLookup = asLookup;
            this.id = query.id;
            this.name = query.name;
            this.autoQuery = query.autoQuery;
            if (!this.autoQuery)
                this.items = [];

            this.canRead = query.canRead;
            this.isHidden = query.isHidden;
            this.label = this.labelWithTotalItems = query.label;
            this.notification = query.notification;
            this.notificationType = typeof (query.notificationType) == "number" ? query.notificationType : NotificationType[<string>query.notificationType];
            this.offset = query.offset;
            this.sortOptions = query.sortOptions;
            this.textSearch = query.textSearch;
            this.pageSize = query.pageSize;
            this.skip = query.skip;
            this.top = query.top;
            this.totalItems = query.totalItems;
            this.groupingInfo = query.groupingInfo;

            this.persistentObject = service.hooks.onConstructPersistentObject(service, query.persistentObject);
            this.singularLabel = this.persistentObject.label;

            if (query.columns)
                this.columns = Enumerable.from(Enumerable.from(query.columns).select(col => service.hooks.onConstructQueryColumn(service, col, this)).toArray());
            else
                this.columns = Enumerable.empty<QueryColumn>();

            this._initializeActions();

            if (query.result)
                this._setResult(query.result);
        }

        get selectedItems(): QueryResultItem[] {
            return this.items ? this.items.filter(i => i.isSelected) : [];
        }

        _toServiceObject() {
            var result = this.copyProperties(["id", "name", "label", "pageSize", "skip", "top", "sortOptions", "textSearch"]);

            if (this.persistentObject)
                result.persistentObject = this.persistentObject.toServiceObject();

            result.columns = this.columns.select(col => col._toServiceObject()).toArray();

            return result;
        }

        _setResult(result: any) {
            this.pageSize = result.pageSize || 0;

            this.groupingInfo = result.groupingInfo;
            if (this.groupingInfo) {
                var start = 0;
                this.groupingInfo.groups.forEach(g => {
                    g.start = start;
                    g.end = (start = start + g.count) - 1;
                });
            }

            if (this.pageSize > 0) {
                this.totalItems = result.totalItems || 0;
                this.queriedPages.push(Math.floor((this.skip || 0) / this.pageSize));
            }
            else
                this.totalItems = result.items.length;

            this._updateLabelWithTotalItems();
            this._updateColumns(result.columns);
            this._updateItems(Enumerable.from(result.items).select(item => this.service.hooks.onConstructQueryResultItem(this.service, item, this)).toArray());

            this.totalItem = result.totalItem != null ? this.service.hooks.onConstructQueryResultItem(this.service, result.totalItem, this) : null;
            this.hasSearched = true;
        }

        _setNotification(notification?: string, type: NotificationType = NotificationType.Error) {
            this.notification = notification;
            this.notificationType = type;
        }

        _notifySelectedItemChanged() {
            var itemCount = this.items != null ? this.selectedItems.length : 0;

            this.actions.forEach(a => {
                a.canExecute = a.definition.selectionRule(itemCount);
            });
        }

        getColumn(name: string): QueryColumn {
            return this.columns.firstOrDefault(c => c.name == name);
        }

        getItemsInMemory(start: number, length: number): QueryResultItem[] {
            if (!this.hasSearched)
                return null;

            if (this.totalItems >= 0) {
                if (start > this.totalItems)
                    start = this.totalItems;

                if (start + length > this.totalItems)
                    length = this.totalItems - start;
            }

            if (this.pageSize <= 0 || length == 0)
                return Enumerable.from(this.items).skip(start).take(length).toArray();

            var startPage = Math.floor(start / this.pageSize);
            var endPage = Math.floor((start + length - 1) / this.pageSize);

            while (startPage < endPage && this.queriedPages.indexOf(startPage) >= 0)
                startPage++;
            while (endPage > startPage && this.queriedPages.indexOf(endPage) >= 0)
                endPage--;

            if (startPage == endPage && this.queriedPages.indexOf(startPage) >= 0)
                return Enumerable.from(this.items).skip(start).take(length).toArray();

            return null;
        }

        getItems(start: number, length: number): Promise<QueryResultItem[]> {
            return new Promise<QueryResultItem[]>((resolve, reject) => {
                if (!this.hasSearched) {
                    this.search().then(() => {
                        this.getItems(start, length || this.pageSize).then(items => {
                            resolve(items);
                        }, e => {
                                reject(e);
                            });
                    }, e => {
                            reject(e);
                        });
                }
                else {
                    if (this.totalItems >= 0) {
                        if (start > this.totalItems)
                            start = this.totalItems;

                        if (start + length > this.totalItems)
                            length = this.totalItems - start;
                    }

                    if (this.pageSize <= 0 || length == 0) {
                        resolve(this.items.slice(start, start + length));
                        return;
                    }

                    var startPage = Math.floor(start / this.pageSize);
                    var endPage = Math.floor((start + length - 1) / this.pageSize);

                    while (startPage < endPage && this.queriedPages.indexOf(startPage) >= 0)
                        startPage++;
                    while (endPage > startPage && this.queriedPages.indexOf(endPage) >= 0)
                        endPage--;

                    if (startPage == endPage && this.queriedPages.indexOf(startPage) >= 0) {
                        resolve(this.items.slice(start, start + length));
                        return;
                    }

                    var clonedQuery = this.clone(this._isReference);
                    clonedQuery.skip = startPage * this.pageSize;
                    clonedQuery.top = (endPage - startPage + 1) * this.pageSize;

                    clonedQuery.search().then(result => {
                        for (var p = startPage; p <= endPage; p++)
                            this.queriedPages.push(p);

                        var isChanged = this._isChanged(result);
                        if (isChanged) {
                            // NOTE: Query has changed (items added/deleted) so remove old data
                            this.queriedPages = [];
                            for (var i = startPage; i <= endPage; i++)
                                this.queriedPages.push(i);

                            this._updateItems([]);
                            this.totalItems = clonedQuery.totalItems;
                            this._updateLabelWithTotalItems();
                        }

                        var newItems = this.items;
                        for (var n = 0; n < clonedQuery.top && (clonedQuery.skip + n < clonedQuery.totalItems); n++) {
                            if (newItems[clonedQuery.skip + n] == null)
                                newItems[clonedQuery.skip + n] = this.service.hooks.onConstructQueryResultItem(this.service, clonedQuery.items[n], this);
                        }
                        this.items = newItems;

                        if (isChanged)
                            this.getItems(start, length).then(items => {
                                resolve(items);
                            }, e => {
                                    reject(e);
                                });
                        else
                            resolve(this.items.slice(start, start + length));
                    }, e => {
                            reject(e);
                        });
                }
            });
        }

        search(): Promise<QueryResultItem[]> {
            this.queriedPages = [];
            this._updateItems([], true);

            return this.service.executeQuery(this.parent, this, this._isReference).then(() => this.items);
        }

        clone(asLookup: boolean = false): Query {
            return this.service.hooks.onConstructQuery(this.service, this, this.parent, asLookup);
        }

        private _updateColumns(columns: any) {
            if (columns != null && columns.length > 0) {
                var enumColumns = Enumerable.from(columns);
                this.columns = this.columns.where(c1 => enumColumns.firstOrDefault(c2 => c1.name == c2.name) != null);
                this.columns = this.columns.concat(Enumerable.from(columns).where(c1 => this.columns.firstOrDefault(c2 => c1.name == c2.name) == null).select(c => this.service.hooks.onConstructQueryColumn(this.service, c, this)).toArray());
                this.columns = this.columns.orderBy(c => c.offset);
            }
            else
                this.columns = Enumerable.empty<QueryColumn>();
        }

        private _updateItems(items: QueryResultItem[], reset: boolean = false) {
            //debugger;
            this.items = items;

            if (reset)
                this.hasSearched = false;
        }

        private _isChanged(result: any): boolean {
            return this.pageSize > 0 && this.totalItems != result.totalItems;
        }

        private _updateLabelWithTotalItems() {
            this.labelWithTotalItems = (this.totalItems != null ? this.totalItems + " " : "") + (this.totalItems != 1 ? this.label : (this.singularLabel || this.persistentObject.label || this.persistentObject.type));
        }
    }

    export class QueryColumn extends ServiceObject {
        private displayAttribute: string;

        disableSort: boolean;
        includes: Array<string>;
        excludes: Array<string>;
        label: string;
        name: string;
        offset: number;
        type: string;
        isPinned: boolean;
        isHidden: boolean;
        width: string;
        typeHints: any;

        constructor(service: Service, col: any, public query: Query) {
            super(service);

            this.displayAttribute = col.displayAttribute;
            this.disableSort = col.disableSort;
            this.includes = col.includes;
            this.excludes = col.excludes;
            this.label = col.label;
            this.name = col.name;
            this.offset = col.offset;
            this.type = col.type;
            this.isPinned = !!col.isPinned;
            this.isHidden = !!col.isHidden;
            this.typeHints = col.typeHints;
        }

        _toServiceObject() {
            return this.copyProperties(["id", "name", "label", "includes", "excludes", "type", "displayAttribute"]);
        }

        getTypeHint(name: string, defaultValue?: string, typeHints?: any): string {
            return PersistentObjectAttribute.prototype.getTypeHint.apply(this, arguments);
        }
    }

    export class QueryResultItem extends ServiceObject {
        id: string;
        breadcrumb: string;
        rawValues: linqjs.Enumerable<QueryResultItemValue>;
        typeHints: any;
        private _fullValuesByName: any;
        private _values: any;
        private _isSelected: boolean;

        constructor(service: Service, item: any, public query: Query) {
            super(service);

            this.id = item.id;
            this.breadcrumb = item.breadcrumb;

            if (item.values)
                this.rawValues = Enumerable.from(item.values).select(v => service.hooks.onConstructQueryResultItemValue(this.service, v)).memoize();
            else
                this.rawValues = Enumerable.empty<QueryResultItemValue>();

            this.typeHints = item.typeHints;
        }

        get values(): any {
            if (!this._values) {
                this._values = {};
                this.rawValues.forEach(v => {
                    this._values[v.key] = Service.fromServiceString(v.value, this.query.getColumn(v.key).type);
                });
            }

            return this._values;
        }

        get isSelected(): boolean {
            return this._isSelected;
        }

        set isSelected(val: boolean) {
            var oldIsSelected = this._isSelected;
            this._isSelected = val;
            if ((<any>Object).getNotifier)
                (<any>Object).getNotifier(this).notify({
                    type: 'update',
                    name: 'isSelected',
                    object: this,
                    oldValue: oldIsSelected
                });

            this.query._notifySelectedItemChanged();
        }

        getValue(key: string): any {
            return this.values[key];
        }

        getFullValue(key: string): QueryResultItemValue {
            if (!this._fullValuesByName) {
                this._fullValuesByName = {};
                this.rawValues.forEach(v => {
                    this._fullValuesByName[v.key] = v;
                });
            }

            return this._fullValuesByName[key];
        }

        getTypeHint(name: string, defaultValue?: string, typeHints?: any): string {
            return PersistentObjectAttribute.prototype.getTypeHint.apply(this, arguments);
        }

        getPersistentObject(): Promise<PersistentObject> {
            return this.service.getPersistentObject(this.query.parent, this.query.persistentObject.id, this.id);
        }

        _toServiceObject() {
            var result = this.copyProperties(["id"]);
            result.values = this.rawValues.select(v => v._toServiceObject()).toArray();

            return result;
        }
    }

    export class QueryResultItemValue extends ServiceObject {
        key: string;
        value: string;
        typeHints: any;
        persistentObjectId: string;
        objectId: string;

        constructor(service: Service, value: any) {
            super(service);

            this.key = value.key;
            this.value = value.value;
            this.persistentObjectId = value.persistentObjectId;
            this.objectId = value.objectId;
            this.typeHints = value.typeHints;
        }

        _toServiceObject() {
            return this.copyProperties(["key", "value", "persistentObjectId", "objectId"]);
        }
    }

    export class Action extends ServiceObject {
        private _target: string;
        private _query: Query;
        private _parent: PersistentObject;
        canExecute: boolean;
        isVisible: boolean = true;
        private _parameters: any = {};
        private _offset: number;
        displayName: string;
        options: Array<string> = [];
        dependentActions = [];

        constructor(public service: Service, public definition: ActionDefinition, public owner: ServiceObject) {
            super(service);

            this.displayName = definition.displayName;

            if (owner instanceof Query) {
                this._target = "Query";
                this._query = <Query>owner;
                this._parent = this.query.parent;
                if (definition.name == "New" && this.query.persistentObject != null && !StringEx.isNullOrEmpty(this.query.persistentObject.newOptions))
                    this.options = this.query.persistentObject.newOptions.split(";");

                this.canExecute = definition.selectionRule(0);
            }
            else if (owner instanceof PersistentObject) {
                this._target = "PersistentObject";
                this._parent = <PersistentObject>owner;
                this.canExecute = true;
            }
            else
                throw "Invalid owner-type.";
        }

        get parent(): PersistentObject {
            return this._parent;
        }

        get query(): Query {
            return this._query;
        }

        get offset(): number {
            return this._offset;
        }

        set offset(value: number) {
            this._offset = value;
        }

        get name(): string {
            return this.definition.name;
        }

        execute(option: number = -1, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject> {
            return new Promise<PersistentObject>((resolve, reject) => {
                if (this.canExecute || (selectedItems != null && this.definition.selectionRule(selectedItems.length)))
                    this._onExecute(option, parameters, selectedItems).then(po => {
                        resolve(po);
                    }, e => {
                            reject(e);
                        });
            });
        }

        _onExecute(option: number = -1, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject> {
            return new Promise<PersistentObject>((resolve, reject) => {
                parameters = this._getParameters(parameters, option);

                if (selectedItems == null)
                    selectedItems = this.query != null && this.query.selectedItems;

                this.service.executeAction(this._target + "." + this.definition.name, this.parent, this.query, selectedItems, parameters).then(po => {
                    var result = null;

                    if (po != null) {
                        if (po.fullTypeName == "Vidyano.Notification") {
                            if (po.objectId != null && JSON.parse(po.objectId).dialog) {
                                this._setNotification();
                                this.service.hooks.setNotification(po.notification, po.notificationType);
                            }
                            else
                                this._setNotification(po.notification, po.notificationType);
                        } else if (po.fullTypeName == "Vidyano.RegisteredStream") {
                            this.service._getStream(po);
                        } else if (this.parent != null && (po.fullTypeName == this.parent.fullTypeName || po.isNew == this.parent.isNew) && po.id == this.parent.id && po.objectId == this.parent.objectId) {
                            this.parent.refreshFromResult(po);
                            this.parent._setNotification(po.notification, po.notificationType);
                        } else {
                            po.ownerQuery = this.query;
                            po.ownerPersistentObject = this.parent;
                            this.service.hooks.onOpen(result = po, false, true);
                        }
                    }

                    if (this.query != null && this.definition.refreshQueryOnCompleted)
                        this.query.search();

                    resolve(result);
                }, error => {
                        reject(error);
                    });
            });
        }

        _getParameters(parameters, option) {
            if (parameters == null)
                parameters = {};
            if (this._parameters != null)
                parameters = Vidyano.extend({}, this._parameters, parameters);
            if (this.options != null && this.options.length > 0 && option >= 0) {
                parameters["MenuOption"] = option;
                parameters["MenuLabel"] = this.options[option];
            }
            else if (option != null)
                parameters["MenuOption"] = option;
            return parameters;
        }

        _onParentIsEditingChanged(isEditing: boolean) {
        }

        _onParentIsDirtyChanged(isDirty: boolean) {
        }

        private _setNotification = function (notification: string = null, notificationType: NotificationType = NotificationType.Error) {
            if (this.query != null)
                this.query._setNotification(notification, notificationType);
            else
                this.parent._setNotification(notification, notificationType);
        }

        static get(service: Service, name: string, owner: ServiceObject): Action {
            var definition = service.actionDefinitions.get(name);
            if (definition != null) {
                var hook = Actions[name];
                return service.hooks.onConstructAction(service, hook != null ? new hook(service, definition, owner) : new Action(service, definition, owner));
            }
            else
                return null;
        }

        static addActions(service: Service, owner: ServiceObject, actions: Action[], actionNames: string[]) {
            if (actionNames == null || actionNames.length == 0)
                return;

            actionNames.forEach(actionName => {
                var action = Action.get(service, actionName, owner);
                action.offset = actions.length;
                actions.push(action);

                Action.addActions(service, owner, actions, action.dependentActions);
            });
        }
    }

    export module Actions {
        export class RefreshQuery extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObject) {
                super(service, definition, owner);
                this.isVisible = false;
            }

            _onExecute(option: number = -1, parameters?: any, selectedItems?: QueryResultItem[]): Promise<any> {
                return this.query.search();
            }
        }

        export class Filter extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObject) {
                super(service, definition, owner);
                this.isVisible = false;
            }
        }

        export class Edit extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObject) {
                super(service, definition, owner);
                this.isVisible = !this.parent.isEditing;

                this.dependentActions = ["EndEdit", "CancelEdit"];
            }

            _onParentIsEditingChanged(isEditing: boolean) {
                this.isVisible = !isEditing;
            }

            _onExecute(option: number = -1, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject> {
                this.parent.beginEdit();
                return Promise.resolve(null);
            }
        }

        export class EndEdit extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObject) {
                super(service, definition, owner);
                this.isVisible = this.parent.isEditing;
                this.canExecute = this.parent.isDirty;
            }

            _onParentIsEditingChanged(isEditing: boolean) {
                this.isVisible = isEditing;
            }

            _onParentIsDirtyChanged(isDirty: boolean) {
                this.canExecute = isDirty;
            }

            _onExecute(option: number = -1, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject> {
                return new Promise<PersistentObject>((resolve, reject) => {
                    this.parent.save().then(() => {
                        if (StringEx.isNullOrWhiteSpace(this.parent.notification) || this.parent.notificationType != NotificationType.Error) {
                            var edit = this.parent.actionsByName["Edit"];
                            var endEdit = this.parent.actionsByName["EndEdit"];

                            if (this.parent.stateBehavior.indexOf("StayInEdit") != -1 && endEdit != null) {
                                endEdit.canExecute = false;
                            } else if (edit) {
                                edit.isVisible = true;
                                if (endEdit != null)
                                    endEdit.isVisible = false;
                            }
                        }

                        resolve(this.parent);
                    }, e => {
                            reject(e);
                        });
                });
            }
        }

        export class Save extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObject) {
                super(service, definition, owner);
                this.dependentActions = ["CancelSave"];
            }

            _onExecute(option: number = -1, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject> {
                var wasNew = this.parent.isNew;
                return new Promise<PersistentObject>((resolve, reject) => {
                    this.parent.save().then(() => {
                        if (StringEx.isNullOrWhiteSpace(this.parent.notification) || this.parent.notificationType != NotificationType.Error) {
                            if (wasNew && this.parent.ownerAttributeWithReference == null && this.parent.stateBehavior.indexOf("OpenAfterNew") != -1)
                                this.service.getPersistentObject(this.parent.parent, this.parent.id, this.parent.objectId).then(po2 => {
                                    this.service.hooks.onOpen(po2, true);
                                    resolve(this.parent);
                                }, reject);
                            else {
                                this.service.hooks.onClose(this.parent);
                                resolve(this.parent);
                            }
                        }
                        else
                            resolve(this.parent);
                    }, reject);
                });
            }
        }

        export class CancelSave extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObject) {
                super(service, definition, owner);
            }

            _onExecute(option: number = -1, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject> {
                this.service.hooks.onClose(this.parent);
                return Promise.resolve(null);
            }
        }

        export class CancelEdit extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObject) {
                super(service, definition, owner);
                this.isVisible = this.parent.isEditing;
                this.canExecute = true;
            }

            _onParentIsEditingChanged(isEditing: boolean) {
                this.isVisible = isEditing;
            }

            _onExecute(option: number = -1, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject> {
                this.parent.cancelEdit();
                return Promise.resolve(null);
            }
        }

        export class ExportToExcel extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObject) {
                super(service, definition, owner);
            }

            _onExecute(option: number = -1, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject> {
                this.service._getStream(null, "Query.ExportToExcel", this.parent, this.query, null, this._getParameters(parameters, option));
                return Promise.resolve(null);
            }
        }
    }

    export class ActionDefinition {
        private _name: string;
        private _displayName: string;
        private _isPinned: boolean;
        private _refreshQueryOnCompleted: boolean;
        private _offset: number;
        private _iconData: string;
        private _reverseIconData: string;
        private _options: Array<string> = [];
        private _selectionRule: (count: number) => boolean;

        constructor(service: Service, item: QueryResultItem) {
            this._name = item.getValue("Name");
            this._displayName = item.getValue("DisplayName");
            this._isPinned = item.getValue("IsPinned");
            this._selectionRule = ExpressionParser.get(item.getValue("SelectionRule"));

            var icon = item.getFullValue("Icon");

            var options = item.getValue("Options");
            this._options = !StringEx.isNullOrWhiteSpace(options) ? options.split(";") : [];

            if (icon != null) {
                var appIcon = service.icons.get(icon.objectId);
                if (StringEx.isNullOrWhiteSpace(appIcon))
                    return;

                var iconWidth = 20, iconHeight = 20;
                var img = new Image();
                img.width = iconWidth;
                img.height = iconHeight;
                img.onload = () => {
                    var canvas = document.createElement("canvas");
                    canvas.width = iconWidth;
                    canvas.height = iconHeight;
                    var canvasContext = canvas.getContext("2d");
                    canvasContext.drawImage(img, 0, 0, iconWidth, iconHeight);

                    var imgd = canvasContext.getImageData(0, 0, iconWidth, iconHeight);
                    var pix = imgd.data;

                    for (var i = 0, n = pix.length; i < n; i += 4) {
                        pix[i] = 255 - pix[i];
                        pix[i + 1] = 255 - pix[i + 1];
                        pix[i + 2] = 255 - pix[i + 2];
                    }

                    canvasContext.putImageData(imgd, 0, 0);

                    this._reverseIconData = canvas.toDataURL("image/png");
                };
                img.src = appIcon.asDataUri();
            }
            else
                this._reverseIconData = null;
        }

        get name(): string {
            return this._name;
        }

        get displayName(): string {
            return this._displayName;
        }

        get isPinned(): boolean {
            return this._isPinned;
        }

        get refreshQueryOnCompleted(): boolean {
            return this._refreshQueryOnCompleted;
        }

        get offset(): number {
            return this._offset;
        }

        get iconData(): string {
            return this._iconData;
        }

        get reverseIconData(): string {
            return this._reverseIconData;
        }

        get options(): Array<string> {
            return this._options;
        }

        get selectionRule(): (count: number) => boolean {
            return this._selectionRule;
        }
    }

    export class Application extends PersistentObject {
        private _userId: string;
        private _friendlyUserName: string;
        private _feedbackId: string;
        private _userSettingsId: string;
        private _globalSearchId: string;
        private _analyticsKey: string;
        private _userSettings: any;
        private _hasManagement: boolean;
        programUnits: ProgramUnit[];

        constructor(service: Service, po: any) {
            super(service, po);

            this._userId = this.getAttributeValue("UserId");
            this._friendlyUserName = this.getAttributeValue("FriendlyUserName") || service.userName;
            this._feedbackId = this.getAttributeValue("FeedbackId");
            this._userSettingsId = this.getAttributeValue("UserSettingsId");
            this._globalSearchId = this.getAttributeValue("GlobalSearchId");
            this._analyticsKey = this.getAttributeValue("AnalyticsKey");

            var userSettings = this.getAttributeValue("UserSettings");
            this._userSettings = JSON.parse(StringEx.isNullOrEmpty(userSettings) ? (localStorage["UserSettings"] || "{}") : userSettings);

            var pus = <{ hasManagement: boolean; units: any[] }>JSON.parse(this.getAttributeValue("ProgramUnits"));
            this.programUnits = Enumerable.from(pus.units).select(unit => new ProgramUnit(this.service, unit)).toArray();
        }

        get friendlyUserName(): string {
            return this._friendlyUserName;
        }

        get feedbackId(): string {
            return this._feedbackId;
        }

        get userSettingsId(): string {
            return this._userSettingsId;
        }

        get globalSearchId(): string {
            return this._globalSearchId;
        }

        get analyticsKey(): string {
            return this._analyticsKey;
        }

        get userSettings(): any {
            return this._userSettings;
        }

        get hasManagement(): boolean {
            return this._hasManagement;
        }
    }

    export class ProgramUnitItem extends ServiceObject {
        id: string;
        title: string;
        name: string;

        constructor(service: Service, unitItem: any, public path?: string) {
            super(service);

            this.id = unitItem.id;
            this.title = unitItem.title;
            this.name = unitItem.name;
        }
    }

    export class ProgramUnit extends ProgramUnitItem {
        private _id: string;
        offset: number;
        openFirst: boolean;
        items: ProgramUnitItem[];

        constructor(service: Service, unit: any) {
            super(service, unit, unit.name);

            this._id = unit.id;
            this.offset = unit.offset;
            this.openFirst = unit.openFirst;

            if (unit.items) {
                this.items = [];
                var usedGroups = {};

                var unitItems = Enumerable.from<any>(unit.items);
                unitItems.forEach(itemData => {
                    if (itemData.group) {
                        var group = usedGroups[itemData.group.id];
                        if (!group) {
                            var groupItems = unitItems.where(groupItemData => groupItemData.group && groupItemData.group.id == itemData.group.id).select(groupItemData => this._createItem(groupItemData)).toArray();
                            group = new ProgramUnitItemGroup(this.service, itemData.group, groupItems);
                            this.items.push(group);
                            usedGroups[itemData.group.id] = group;
                        }
                    }
                    else
                        this.items.push(this._createItem(itemData));
                });
            }

            if (this.openFirst && this.items.length > 0)
                this.path = this.items[0].path;
        }

        private _createItem(itemData: any): ProgramUnitItem {
            return itemData.query ? new ProgramUnitItemQuery(this.service, itemData, this) : new ProgramUnitItemPersistentObject(this.service, itemData, this);
        }
    }

    export class ProgramUnitItemGroup extends ProgramUnitItem {
        constructor(service: Service, unitItem: any, private _items: ProgramUnitItem[]) {
            super(service, unitItem);
        }

        get items(): ProgramUnitItem[] {
            return this._items;
        }
    }

    export class ProgramUnitItemQuery extends ProgramUnitItem {
        constructor(service: Service, unitItem: any, parent: ProgramUnit) {
            super(service, unitItem, parent.name + "/Query." + unitItem.query);
        }
    }

    export class ProgramUnitItemPersistentObject extends ProgramUnitItem {
        constructor(service: Service, unitItem: any, parent: ProgramUnit) {
            super(service, unitItem, parent.name + "/PersistentObject." + unitItem.persistentObject + (unitItem.objectId ? "/" + unitItem.objectId : ""));
        }
    }

    export class NoInternetMessage {
        static messages: linqjs.Dictionary<string, NoInternetMessage> = NoInternetMessage._getMessages();

        constructor(private language: string, public title: string, public message: string, public tryAgain: string) {
        }

        private static _getMessages(): linqjs.Dictionary<string, NoInternetMessage> {
            return Enumerable.from<NoInternetMessage>([
                new NoInternetMessage("en", "Unable to connect to the server.", "Please check your internet connection settings and try again.", "Try again"),
                new NoInternetMessage("ar", "غير قادر على الاتصال بالخادم", "يرجى التحقق من إعدادات الاتصال بإنترنت ثم حاول مرة أخرى", "حاول مرة أخرى"),
                new NoInternetMessage("bg", "Не може да се свърже със сървъра", "Проверете настройките на интернет връзката и опитайте отново", "Опитайте отново"),
                new NoInternetMessage("ca", "No es pot connectar amb el servidor", "Si us plau aturi les seves escenes de connexió d'internet i provi una altra vegada", "Provi una altra vegada"),
                new NoInternetMessage("cs", "Nelze se připojit k serveru", "Zkontrolujte nastavení připojení k Internetu a akci opakujte", "Zkuste to znovu"),
                new NoInternetMessage("da", "Kunne ikke oprettes forbindelse til serveren", "Kontroller indstillingerne for internetforbindelsen, og prøv igen", "Prøv igen"),
                new NoInternetMessage("nl", "Kan geen verbinding maken met de server", "Controleer de instellingen van uw internet-verbinding en probeer opnieuw", "Opnieuw proberen"),
                new NoInternetMessage("et", "Ei saa ühendust serveriga", "Palun kontrollige oma Interneti-ühenduse sätteid ja proovige uuesti", "Proovi uuesti"),
                new NoInternetMessage("fa", "قادر به اتصال به سرویس دهنده", "لطفاً تنظیمات اتصال اینترنت را بررسی کرده و دوباره سعی کنید", "دوباره امتحان کن"),
                new NoInternetMessage("fi", "Yhteyttä palvelimeen", "Tarkista internet-yhteysasetukset ja yritä uudelleen", "Yritä uudestaan"),
                new NoInternetMessage("fr", "Impossible de se connecter au serveur", "S'il vous plaît vérifier vos paramètres de connexion internet et réessayez", "Réessayez"),
                new NoInternetMessage("de", "Keine Verbindung zum Server herstellen", "Überprüfen Sie die Einstellungen für die Internetverbindung und versuchen Sie es erneut", "Wiederholen"),
                new NoInternetMessage("el", "Δεν είναι δυνατή η σύνδεση με το διακομιστή", "Ελέγξτε τις ρυθμίσεις σύνδεσης στο internet και προσπαθήστε ξανά", "Δοκίμασε ξανά"),
                new NoInternetMessage("ht", "Pat kapab pou li konekte li pou sèvè a", "Souple tcheke ou paramètres kouche sou entènèt Et eseye ankò", "eseye ankò"),
                new NoInternetMessage("he", "אין אפשרות להתחבר לשרת", "נא בדוק את הגדרות החיבור לאינטרנט ונסה שוב", "נסה שוב"),
                new NoInternetMessage("hi", "सर्वर से कनेक्ट करने में असमर्थ", "कृपया अपना इंटरनेट कनेक्शन सेटिंग्स की जाँच करें और पुन: प्रयास करें", "फिर कोशिश करो"),
                new NoInternetMessage("hu", "Nem lehet kapcsolódni a szerverhez", "Kérjük, ellenőrizze az internetes kapcsolat beállításait, és próbálja újra", "próbáld újra"),
                new NoInternetMessage("id", "Tidak dapat terhubung ke server", "Silakan periksa setelan sambungan internet Anda dan coba lagi", "Coba lagi"),
                new NoInternetMessage("it", "Impossibile connettersi al server", "Si prega di controllare le impostazioni della connessione internet e riprovare", "Riprova"),
                new NoInternetMessage("ja", "サーバーに接続できません。", "インターネット接続設定を確認して、やり直してください。", "もう一度やり直してください"),
                new NoInternetMessage("ko", "서버에 연결할 수 없습니다.", "인터넷 연결 설정을 확인 하 고 다시 시도 하십시오", "다시 시도"),
                new NoInternetMessage("lv", "Nevar izveidot savienojumu ar serveri", "Lūdzu, pārbaudiet interneta savienojuma iestatījumus un mēģiniet vēlreiz", "mēģini vēlreiz"),
                new NoInternetMessage("lt", "Nepavyko prisijungti prie serverio", "Patikrinkite interneto ryšio parametrus ir bandykite dar kartą", "pabandyk dar kartą"),
                new NoInternetMessage("no", "Kan ikke koble til serveren", "Kontroller innstillingene for Internett-tilkoblingen og prøv igjen", "prøv igjen"),
                new NoInternetMessage("pl", "Nie można połączyć się z serwerem", "Proszę sprawdzić ustawienia połączenia internetowego i spróbuj ponownie", "Próbuj ponownie"),
                new NoInternetMessage("pt", "Incapaz de conectar ao servidor", "Por favor, verifique as suas configurações de ligação à internet e tente novamente", "Tentar novamente"),
                new NoInternetMessage("ro", "Imposibil de conectat la server", "Vă rugăm să verificaţi setările de conexiune la internet şi încercaţi din nou", "încearcă din nou"),
                new NoInternetMessage("ru", "Не удается подключиться к серверу", "Пожалуйста, проверьте параметры подключения к Интернету и повторите попытку", "Повторить"),
                new NoInternetMessage("sk", "Nedá sa pripojiť k serveru", "Skontrolujte nastavenie internetového pripojenia a skúste to znova", "skús znova"),
                new NoInternetMessage("sl", "Ne morem se povezati s strežnikom", "Preverite nastavitve internetne povezave in poskusite znova", "poskusi znova"),
                new NoInternetMessage("es", "No se puede conectar al servidor", "Por favor, compruebe la configuración de conexión a internet e inténtelo de nuevo", "Vuelve a intentarlo"),
                new NoInternetMessage("sv", "Det gick inte att ansluta till servern", "Kontrollera inställningarna för Internetanslutningen och försök igen", "Försök igen"),
                new NoInternetMessage("th", "สามารถเชื่อมต่อกับเซิร์ฟเวอร์", "กรุณาตรวจสอบการตั้งค่าการเชื่อมต่ออินเทอร์เน็ตของคุณ และลองอีกครั้ง", "ลองอีกครั้ง"),
                new NoInternetMessage("tr", "Sunucuya bağlantı kurulamıyor", "Lütfen Internet bağlantı ayarlarınızı denetleyin ve yeniden deneyin", "Yeniden Deneyin"),
                new NoInternetMessage("uk", "Не вдалося підключитися до сервера", "Перевірте параметри підключення до Інтернету та повторіть спробу", "Спробуй ще раз"),
                new NoInternetMessage("vi", "Không thể kết nối đến máy chủ", "Hãy kiểm tra cài đặt kết nối internet của bạn và thử lại", "Thử lại")
            ]).toDictionary(m => m.language, m => m);
        }
    }
}

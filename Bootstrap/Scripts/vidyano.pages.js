var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vidyano;
(function (Vidyano) {
    (function (Pages) {
        var Page = (function () {
            function Page(index, name) {
                var _templateNames = [];
                for (var _i = 0; _i < (arguments.length - 2); _i++) {
                    _templateNames[_i] = arguments[_i + 2];
                }
                this.index = index;
                this.name = name;
                this._templateNames = _templateNames;
                this.templates = {};
                this.index.errorTarget.hide();
                this.index.pageTarget.empty();
            }
            Object.defineProperty(Page.prototype, "service", {
                get: function () {
                    return this.index.service;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Page.prototype, "isLoading", {
                get: function () {
                    return this.index.isLoading;
                },
                set: function (val) {
                    this.index.isLoading = val;
                },
                enumerable: true,
                configurable: true
            });


            Page.prototype.render = function (target) {
                this.index.pageTarget.attr("data-page", this.name);
                this.isLoading = false;
            };

            Page.prototype.load = function () {
                var _this = this;
                var templateLoaders = this._templateNames.map(function (name) {
                    return _this.templates[name] = new Template("/Templates/" + name + ".html");
                }).map(function (template) {
                    return template._ready;
                });
                var contentLoader = this.service.getPersistentObject(null, "Bootstrap.Page", this.name).then(function (page) {
                    _this.content = page.getAttributeValue("Content");
                });
                return Promise.all(templateLoaders.concat([contentLoader]));
            };
            return Page;
        })();
        Pages.Page = Page;

        var ContentPage = (function (_super) {
            __extends(ContentPage, _super);
            function ContentPage(index, name) {
                _super.call(this, index, name);
            }
            ContentPage.prototype.render = function (target) {
                _super.prototype.render.call(this, target);

                target.html(this.content);
            };
            return ContentPage;
        })(Page);
        Pages.ContentPage = ContentPage;

        var Template = (function () {
            function Template(_file) {
                var _this = this;
                this._file = _file;
                this._template = Template._cachedTemplates[_file];

                if (this._template)
                    this._ready = Promise.resolve(true);
                else {
                    var fileData;
                    this._ready = new Promise(function (resolve, reject) {
                        $.ajax({
                            url: _this._file,
                            dataType: "text",
                            cache: false,
                            success: function (data) {
                                return resolve(fileData = data);
                            },
                            error: function () {
                                return resolve(fileData = "");
                            }
                        });
                    }).then(function () {
                        return Template._cachedTemplates[_file] = _this._template = _.template(fileData);
                    });
                }
            }
            Template.prototype.create = function (data) {
                return this._template(data);
            };
            Template._cachedTemplates = {};
            return Template;
        })();
        Pages.Template = Template;

        var Index = (function () {
            function Index(_serviceUri, _serviceHooks) {
                if (typeof _serviceUri === "undefined") { _serviceUri = "https://bootstrap.2sky.be"; }
                if (typeof _serviceHooks === "undefined") { _serviceHooks = new IndexServiceHooks(); }
                this._serviceUri = _serviceUri;
                this._serviceHooks = _serviceHooks;
                this._isLoading = false;
                this.errorTarget = $("#error");
                this.pageTarget = $("#target");
            }
            Object.defineProperty(Index.prototype, "isLoading", {
                get: function () {
                    return this._isLoading;
                },
                set: function (val) {
                    $("#loading").toggleClass("show", this._isLoading = val);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Index.prototype, "currentPage", {
                get: function () {
                    return this._currentPage;
                },
                enumerable: true,
                configurable: true
            });

            Index.prototype.addPage = function (createPage, route) {
                var _this = this;
                if (typeof route === "undefined") { route = ""; }
                crossroads.addRoute(route, function () {
                    var args = arguments;
                    _this.execute(function () {
                        var page = _this._currentPage = new createPage(_this, args);
                        return page.load().then(function () {
                            if (page = _this._currentPage)
                                _this._currentPage.render(_this.pageTarget);
                        });
                    });
                });
            };

            Index.prototype.initialize = function (skipDefaultLogin) {
                var _this = this;
                if (typeof skipDefaultLogin === "undefined") { skipDefaultLogin = false; }
                return this.execute(function () {
                    return _this.service.initialize(skipDefaultLogin);
                });
            };

            Index.prototype.executeError = function (err, work, userCanRetry) {
                var _this = this;
                if (typeof userCanRetry === "undefined") { userCanRetry = true; }
                $("#error").show();
                $("#error > .msg").text(err);
                if (userCanRetry) {
                    $("#error > .action").show();
                    $("#error > .action").off("click").one("click", function () {
                        $("#error").hide();
                        _this.execute(work, userCanRetry);
                    });
                } else
                    $("#error > .action").hide();
            };

            Index.prototype.execute = function (work, userCanRetry) {
                var _this = this;
                if (typeof userCanRetry === "undefined") { userCanRetry = true; }
                this.isLoading = true;
                return work().catch(function (err) {
                    _this.isLoading = false;
                    _this.executeError(err, work, userCanRetry);
                });
            };

            Index.prototype.start = function () {
                var ready;
                if (this._serviceUri) {
                    this.service = new Vidyano.Service(this._serviceUri, this._serviceHooks);
                    this.service.ignoreMobile = true;
                    this.service.environment = "Native";
                    ready = this.initialize();
                } else
                    ready = Promise.resolve(true);

                return ready.then(function () {
                    var parseHash = function (newHash) {
                        return crossroads.parse(newHash);
                    };
                    hasher.prependHash = "";
                    hasher.initialized.add(parseHash);
                    hasher.changed.add(parseHash);
                    hasher.init();
                });
            };
            return Index;
        })();
        Pages.Index = Index;

        var IndexServiceHooks = (function (_super) {
            __extends(IndexServiceHooks, _super);
            function IndexServiceHooks() {
                _super.apply(this, arguments);
            }
            IndexServiceHooks.prototype.onSessionExpired = function () {
                document.location.reload();
            };
            return IndexServiceHooks;
        })(Vidyano.ServiceHooks);
    })(Vidyano.Pages || (Vidyano.Pages = {}));
    var Pages = Vidyano.Pages;
})(Vidyano || (Vidyano = {}));
//# sourceMappingURL=vidyano.pages.js.map

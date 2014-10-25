var Vidyano;
(function (Vidyano) {
    (function (Pages) {
        var Page = (function () {
            function Page(index) {
                var _templateNames = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    _templateNames[_i] = arguments[_i + 1];
                }
                this.index = index;
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
                this.index.pageTarget.attr("data-page", this.constructor.toString().match(/function (.*)\(/)[1]);
                this.isLoading = false;
            };

            Page.prototype.load = function () {
                var _this = this;
                var templates = this._templateNames.map(function (name) {
                    return _this.templates[name] = new Template("/Templates/" + name + ".html");
                });
                return Promise.all(templates.map(function (template) {
                    return template._ready;
                }));
            };
            return Page;
        })();
        Pages.Page = Page;

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
                if (typeof _serviceUri === "undefined") { _serviceUri = ""; }
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
    })(Vidyano.Pages || (Vidyano.Pages = {}));
    var Pages = Vidyano.Pages;
})(Vidyano || (Vidyano = {}));
//# sourceMappingURL=vidyano.pages.js.map

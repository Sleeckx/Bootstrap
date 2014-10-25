var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BootstrapClient;
(function (BootstrapClient) {
    var Index = (function (_super) {
        __extends(Index, _super);
        function Index() {
            _super.call(this);

            this.addPage(Test, "");

            this.start();
        }
        Index.prototype.initialize = function () {
            var _this = this;
            return _super.prototype.initialize.call(this, true).then(function () {
                return !_this.service.isSignedIn ? _this.service.signInUsingCredentials("test", "test") : Promise.resolve(true);
            }).then(function () {
                return $(document.body).removeClass("initializing");
            });
        };
        return Index;
    })(Vidyano.Pages.Index);
    BootstrapClient.Index = Index;

    var Test = (function (_super) {
        __extends(Test, _super);
        function Test(index, args) {
            _super.call(this, index, "Test.Test");
        }
        return Test;
    })(Vidyano.Pages.ContentPage);
    BootstrapClient.Test = Test;
})(BootstrapClient || (BootstrapClient = {}));

$(function () {
    return window["_index"] = new BootstrapClient.Index();
});
//# sourceMappingURL=index.js.map

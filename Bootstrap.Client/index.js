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
        return Index;
    })(Vidyano.Pages.Index);
    BootstrapClient.Index = Index;

    var Test = (function (_super) {
        __extends(Test, _super);
        function Test(index, args) {
            _super.call(this, index, "Test");
        }
        return Test;
    })(Vidyano.Pages.ContentPage);
    BootstrapClient.Test = Test;
})(BootstrapClient || (BootstrapClient = {}));

$(function () {
    return window["_index"] = new BootstrapClient.Index();
});
//# sourceMappingURL=index.js.map

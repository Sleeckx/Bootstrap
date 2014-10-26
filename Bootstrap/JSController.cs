using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Hosting;
using System.Web.Http;

namespace Bootstrap
{
    public class JSController : System.Web.Http.ApiController
    {
        private static string scriptsFolder = HostingEnvironment.MapPath("~/Scripts/");

        [AcceptVerbs("GET")]
        public HttpResponseMessage Get()
        {
            var sb = new StringBuilder();

            sb.AppendLine(File.ReadAllText(Path.Combine(scriptsFolder, "jquery-2.1.1.min.js")));
            sb.AppendLine(File.ReadAllText(Path.Combine(scriptsFolder, "linq.min.js")));
            sb.AppendLine(File.ReadAllText(Path.Combine(scriptsFolder, "promise-0.1.1.min.js")));
            sb.AppendLine(File.ReadAllText(Path.Combine(scriptsFolder, "signals.min.js")));
            sb.AppendLine(File.ReadAllText(Path.Combine(scriptsFolder, "hasher.min.js")));
            sb.AppendLine(File.ReadAllText(Path.Combine(scriptsFolder, "crossroads.min.js")));
            sb.AppendLine(File.ReadAllText(Path.Combine(scriptsFolder, "underscore-min.js")));
            sb.AppendLine(File.ReadAllText(Path.Combine(scriptsFolder, "lightbox.min.js")).Replace("//# sourceMappingURL=lightbox.min.map", ""));
            sb.AppendLine(File.ReadAllText(Path.Combine(scriptsFolder, "vidyano.common.min.js")));
            sb.AppendLine(File.ReadAllText(Path.Combine(scriptsFolder, "vidyano.cultures.min.js")).Replace("//# sourceMappingURL=vidyano.cultures.js.map", ""));
            sb.AppendLine(File.ReadAllText(Path.Combine(scriptsFolder, "vidyano.min.js")).Replace("//# sourceMappingURL=vidyano.js.map", ""));
            sb.AppendLine(File.ReadAllText(Path.Combine(scriptsFolder, "vidyano.pages.min.js")).Replace("//# sourceMappingURL=vidyano.pages.js.map", ""));
            sb.AppendLine(File.ReadAllText(Path.Combine(scriptsFolder, "bootstrap.min.js")));

            return new HttpResponseMessage { Content = new StringContent(sb.ToString(), Encoding.UTF8, "text/javascript") };
        }
    }
}
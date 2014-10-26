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
    public class CssController : System.Web.Http.ApiController
    {
        private static string stylesheetsFolder = HostingEnvironment.MapPath("~/Stylesheets/");

        [AcceptVerbs("GET")]
        public HttpResponseMessage Get()
        {
            var sb = new StringBuilder();

            sb.AppendLine(File.ReadAllText(Path.Combine(stylesheetsFolder, "bootstrap.min.css")));
            sb.AppendLine(File.ReadAllText(Path.Combine(stylesheetsFolder, "lightbox.min.css")));

            return new HttpResponseMessage { Content = new StringContent(sb.ToString(), Encoding.UTF8, "text/css") };
        }
    }
}
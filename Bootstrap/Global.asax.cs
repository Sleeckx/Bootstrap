using System;
using System.Web;
using Vidyano.Service;

namespace Bootstrap
{
    public class Global : HttpApplication
    {
        protected void Application_Start(object sender, EventArgs e)
        {
            WebControllerFactory.MapHttpRoute("images", "images/{website}/{name}", new { controller = "Images", action = "Get" });
            WebControllerFactory.MapHttpRoute("api", "api", new { controller = "Api", action = "Get" });
            WebControllerFactory.MapVidyanoRoute();
        }
    }
}
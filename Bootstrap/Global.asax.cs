using System;
using System.Web;
using Vidyano.Service;

namespace Bootstrap
{
    public class Global : HttpApplication
    {
        protected void Application_Start(object sender, EventArgs e)
        {
            WebControllerFactory.MapHttpRoute("images", "images/{key}/{name}", new { controller = "Images", action = "Get" });
            WebControllerFactory.MapHttpRoute("js", "js", new { controller = "JS", action = "Get" });
            WebControllerFactory.MapHttpRoute("css", "css", new { controller = "Css", action = "Get" });
            WebControllerFactory.MapVidyanoRoute();
        }
    }
}
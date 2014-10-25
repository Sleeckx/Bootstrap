using System;
using System.Web;
using Vidyano.Service;

namespace Bootstrap
{
    public class Global : HttpApplication
    {
        protected void Application_Start(object sender, EventArgs e)
        {
            WebControllerFactory.MapHttpRoute("api", "api/{action}/{id}", new { controller = "Api", action = "Get", id = WebControllerFactory.OptionalParameter });
            WebControllerFactory.MapHttpRoute("images", "images/{id}", new { controller = "Images", action = "Get", id = WebControllerFactory.OptionalParameter });
            WebControllerFactory.MapVidyanoRoute();
        }
    }
}
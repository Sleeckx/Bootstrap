using Bootstrap.Service;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Threading.Tasks;
using System.Web;
using System.Web.Hosting;

namespace Bootstrap
{
    public class ImagesController : JSController
    {
        public async Task<HttpResponseMessage> Get(string key, string name)
        {
            using (var context = new BootstrapEntityModelContainer())
            {
                var website = context.Websites.FirstOrDefault(w => w.Name == key);
                if (website != null)
                {
                    var blob = ImageActions.ImagesContainer.GetBlockBlobReference(ImageActions.GetContainerPrefix(website) + name);
                    if (await blob.ExistsAsync())
                    {
                        HttpResponseMessage message = new HttpResponseMessage(HttpStatusCode.OK);
                        var blobStream = await blob.OpenReadAsync();

                        message.Content = new StreamContent(blobStream);
                        message.Content.Headers.ContentLength = blob.Properties.Length;
                        message.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(blob.Properties.ContentType);

                        return message;
                    }
                }
            }

            return Request.CreateErrorResponse(HttpStatusCode.NotFound, "File not found");
        }
    }
}
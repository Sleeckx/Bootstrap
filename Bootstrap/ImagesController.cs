using Bootstrap.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Threading.Tasks;
using System.Web;

namespace Bootstrap
{
    public class ImagesController : ApiController
    {
        public async Task<HttpResponseMessage> Get(string website, string name)
        {
            using (var context = new BootstrapEntityModelContainer())
            {
                var ws = context.Websites.FirstOrDefault(w => w.Name == website);
                if (ws != null)
                {
                    var blob = ImageActions.WebsitesContainer.GetBlockBlobReference(ImageActions.GetWebsitePrefix(ws.Id) + name);
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
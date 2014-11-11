using Bootstrap.Service;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
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
using Vidyano.Service.Repository;

namespace Bootstrap
{
    public class ImagesController : JSController
    {
        private static CloudBlobContainer _WebsitesContainer;

        public async Task<HttpResponseMessage> Get(string key, string name)
        {
            using (var context = new BootstrapEntityModelContainer())
            {
                var website = context.Websites.FirstOrDefault(w => w.Name == key);
                if (website != null)
                {
                    var blob = ImagesContainer.GetBlockBlobReference(website.Name + "/" + name);
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

        internal static CloudBlobContainer ImagesContainer
        {
            get
            {
                if (_WebsitesContainer != null)
                    return _WebsitesContainer;

                string storageConnectionString;
                using (Manager.Current == null ? Manager.CreateForUser("admin") : null)
                    storageConnectionString = Manager.Current.GetSetting("StorageConnectionString");

                var storageAccount = CloudStorageAccount.Parse(storageConnectionString);
                var blobClient = storageAccount.CreateCloudBlobClient();

                return _WebsitesContainer = blobClient.GetContainerReference("images");
            }
        }
    }
}
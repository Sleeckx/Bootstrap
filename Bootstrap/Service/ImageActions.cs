using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Auth;
using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Vidyano.Core.Extensions;
using Vidyano.Service;
using Vidyano.Service.Charts;
using Vidyano.Service.Repository;

namespace Bootstrap.Service
{
    public class ImageActions : PersistentObjectActions<BootstrapEntityModelContainer, object>
    {
        private static CloudBlobContainer _WebsitesContainer;

        protected override void SaveNew(PersistentObject obj)
        {
            if (CheckRules(obj))
            {
                string prefix, thumbPrefix;
                if (obj.Parent.Type == "Website")
                {
                    var websiteId = Guid.Parse(obj.Parent.ObjectId);
                    Context.VerifyWebsiteAccess(websiteId);

                    prefix = GetWebsitePrefix(websiteId);
                    thumbPrefix = GetWebsitePrefix(websiteId, true);
                }
                else if (obj.Parent.Type == "Product")
                {
                    var product = Context.GetEntity<Product>(obj.Parent);
                    Context.VerifyProductAccess(product.Id);

                    prefix = GetProductPrefix(product.Website.Id, product.Id);
                    thumbPrefix = GetProductPrefix(product.Website.Id, product.Id, true);
                }
                else
                    throw new InvalidOperationException("Invalid parent type.");

                UploadImage(prefix + (string)obj.GetAttributeValue("Name"), (byte[])obj.GetAttributeValue("UploadImage"));
                UploadImage(thumbPrefix + (string)obj.GetAttributeValue("Name"), ImageProcessor.ResizeImage((byte[])obj.GetAttributeValue("UploadImage"), 200));
            }
            else
                base.SaveNew(obj);
        }

        public override void OnDelete(PersistentObject parent, IEnumerable<object> entities, Query query, QueryResultItem[] selectedItems)
        {
            string prefix, thumbPrefix;
            if (parent.Type == "Website")
            {
                var websiteId = Guid.Parse(parent.ObjectId);
                Context.VerifyWebsiteAccess(websiteId);

                prefix = GetWebsitePrefix(websiteId);
                thumbPrefix = GetWebsitePrefix(websiteId, true);
            }
            else if (parent.Type == "Product")
            {
                var product = Context.GetEntity<Product>(parent);
                Context.VerifyProductAccess(product.Id);

                prefix = GetProductPrefix(product.Website.Id, product.Id);
                thumbPrefix = GetProductPrefix(product.Website.Id, product.Id, true);
            }
            else
                throw new InvalidOperationException("Invalid parent type.");

            selectedItems.Run(item =>
            {
                DeleteImage(prefix + item.Id);
                DeleteImage(thumbPrefix + item.Id);
            });
        }

        private void UploadImage(string name, byte[] image)
        {
            var blob = WebsitesContainer.GetBlockBlobReference(name);
            blob.UploadFromByteArray(image, 0, image.Length);

            var extension = Path.GetExtension(blob.Uri.AbsoluteUri);
            switch (extension)
            {
                case ".png":
                    blob.Properties.ContentType = "image/png";
                    break;
                case ".jpg":
                case ".jpeg":
                    blob.Properties.ContentType = "image/jpeg";
                    break;
                case ".gif":
                    blob.Properties.ContentType = "image/gif";
                    break;
                case ".bmp":
                    blob.Properties.ContentType = "image/bmp";
                    break;
                default:
                    break;
            }
            blob.SetProperties();
        }

        private void DeleteImage(string name)
        {
            WebsitesContainer.GetBlockBlobReference(name).DeleteIfExists();
        }

        internal static CloudBlobContainer WebsitesContainer
        {
            get
            {
                if (_WebsitesContainer != null)
                    return _WebsitesContainer;

                var storageConnectionString = Manager.Current != null ? Manager.Current.GetSetting("StorageConnectionString") : null;
                if (storageConnectionString == null)
                {
                    using (var context = new BootstrapEntityModelContainer())
                        storageConnectionString = context.Settings.First(s => s.Key == "StorageConnectionString").Value;
                }

                var storageAccount = CloudStorageAccount.Parse(storageConnectionString);
                var blobClient = storageAccount.CreateCloudBlobClient();

                return _WebsitesContainer = blobClient.GetContainerReference("websites");
            }
        }

        internal static string GetWebsitePrefix(string id, bool thumb = false)
        {
            return id + (thumb ? "/thumbs" : "") + "/";
        }

        internal static string GetWebsitePrefix(Guid id, bool thumb = false)
        {
            return GetWebsitePrefix(id.ToString(), thumb);
        }

        internal static string GetProductPrefix(string websiteId, string productId, bool thumb = false)
        {
            return websiteId + "/" + productId + (thumb ? "/thumbs" : "") + "/";
        }

        internal static string GetProductPrefix(Guid websiteId, Guid productId, bool thumb = false)
        {
            return GetProductPrefix(websiteId.ToString(), productId.ToString(), thumb);
        }
    }
}
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
using Vidyano.Service.Dynamic;
using Vidyano.Service.Repository;

namespace Bootstrap.Service
{
    public class ImageActions : PersistentObjectActions<BootstrapEntityModelContainer, object>
    {
        private static CloudBlobContainer _WebsitesContainer;

        public override void OnConstruct(Query query, PersistentObject parent)
        {
            base.OnConstruct(query, parent);

            if (Manager.Current.User.IsMemberOf("WebsiteContentEditors") && parent.Type == "Website")
                query.Actions = query.Actions.Where(a => a != "Delete").ToArray();
        }

        protected override void SaveNew(PersistentObject obj)
        {
            if (CheckRules(obj))
            {
                var website = WebsiteActions.GetWebsite(obj.Parent);
                if (website == null)
                    throw new InvalidOperationException("Parent website not found.");

                var isDynamic = !obj.Parent.FullTypeName.StartsWith("Bootstrap.");
                var collectionName = isDynamic ? obj.Parent.Type : null;
                var collectionEntityId = isDynamic ? obj.Parent.ObjectId : null;

                UploadImage(GetContainerPrefix(website, collectionName, collectionEntityId) + (string)obj.GetAttributeValue("Name"), (byte[])obj.GetAttributeValue("UploadImage"));
                UploadImage(GetContainerPrefix(website, collectionName, collectionEntityId, true) + (string)obj.GetAttributeValue("Name"), ImageProcessor.ResizeImage((byte[])obj.GetAttributeValue("UploadImage"), 200));
            }
            else
                base.SaveNew(obj);
        }

        public override void OnDelete(PersistentObject parent, IEnumerable<object> entities, Query query, QueryResultItem[] selectedItems)
        {
            var website = WebsiteActions.GetWebsite(parent);
            if (website == null)
                throw new InvalidOperationException("Parent website not found.");

            var isDynamic = !parent.FullTypeName.StartsWith("Bootstrap.");
            var collectionName = isDynamic ? parent.Type : null;
            var collectionEntityId = isDynamic ? parent.ObjectId : null;

            selectedItems.Run(item =>
            {
                ImagesContainer.GetBlockBlobReference(GetContainerPrefix(website, collectionName, collectionEntityId) + item.GetValue("Name")).DeleteIfExists();
                ImagesContainer.GetBlockBlobReference(GetContainerPrefix(website, collectionName, collectionEntityId, true) + item.GetValue("Name")).DeleteIfExists();
            });
        }

        private void UploadImage(string name, byte[] image)
        {
            var blob = ImagesContainer.GetBlockBlobReference(name);
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

        internal static string GetContainerPrefix(Website website, string collection = null, string collectionEntityId = null, bool thumbs = false)
        {
            return website.Id.ToString().ToLower() + "/" +
                   (collection != null ? collection.ToLower() + "/" : null) +
                   (collectionEntityId != null ? collectionEntityId.ToLower() + "/" : null) +
                   (thumbs ? "thumbs/" : null);
        }
    }
}
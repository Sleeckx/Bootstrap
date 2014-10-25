using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Vidyano.Core.Extensions;
using Vidyano.Service;
using Vidyano.Service.Repository;

namespace Bootstrap.Service
{
    partial class BootstrapEntityModelContainer
    {
        public IUser[] VidyanoUsers(CustomQueryArgs e)
        {
            return Manager.Current.GetUsers();
        }

        public IEnumerable<object> WebsiteImages(CustomQueryArgs e)
        {
            VerifyWebsiteAccess(e.Parent.Id);

            var prefix = ImageActions.GetWebsitePrefix(e.Parent.Id);
            return ImageActions.WebsitesContainer.ListBlobs(prefix, true, Microsoft.WindowsAzure.Storage.Blob.BlobListingDetails.Metadata).OfType<CloudBlockBlob>()
                .Select(blob =>
                {
                    var name = blob.Name.Replace(prefix, "");

                    var fullBlob = ImageActions.WebsitesContainer.GetBlockBlobReference(ImageActions.GetWebsitePrefix(e.Parent.Id) + name);
                    var thumbBlob = ImageActions.WebsitesContainer.GetBlockBlobReference(ImageActions.GetWebsitePrefix(e.Parent.Id, true) + name);

                    return new { Id = fullBlob.Uri.ToString(), Name = name, QueryImage = thumbBlob.Uri.ToString() };
                });
        }

        public IEnumerable<object> ProductImages(CustomQueryArgs e)
        {
            var product = this.GetEntity<Product>(e.Parent);
            VerifyProductAccess(product.Id);

            var prefix = ImageActions.GetProductPrefix(product.Website.Id, product.Id);
            return ImageActions.WebsitesContainer.ListBlobs(prefix, true, Microsoft.WindowsAzure.Storage.Blob.BlobListingDetails.Metadata).OfType<CloudBlockBlob>()
                .Select(blob =>
                {
                    var name = blob.Name.Replace(prefix, "");

                    var fullBlob = ImageActions.WebsitesContainer.GetBlockBlobReference(ImageActions.GetProductPrefix(product.Website.Id, product.Id) + name);
                    var thumbBlob = ImageActions.WebsitesContainer.GetBlockBlobReference(ImageActions.GetProductPrefix(product.Website.Id, product.Id, true) + name);

                    return new { Id = fullBlob.Uri.ToString(), Name = name, QueryImage = thumbBlob.Uri.ToString() };
                });
        }

        public void VerifyWebsiteAccess(Guid id)
        {
            if (Manager.Current.User.IsMemberOf("Administrators"))
                return;

            var website = this.Websites.FirstOrDefault(ws => ws.Id == id);
            if (website != null)
            {
                if (website.Users.Any(u => u.Id == Manager.Current.User.Id))
                    return;
            }

            throw new InvalidOperationException("Website access is not allowed.");
        }

        public void VerifyProductAccess(Guid id)
        {
            if (Manager.Current.User.IsMemberOf("Administrators"))
                return;

            var product = this.Products.FirstOrDefault(p => p.Id == id);
            if (product != null)
            {
                if (product.Website.Users.Any(u => u.Id == Manager.Current.User.Id))
                    return;
            }

            throw new InvalidOperationException("Product access is not allowed.");
        }
    }
}
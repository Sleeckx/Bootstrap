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

        private IEnumerable<object> ListImages(string prefix)
        {
            return ImageActions.WebsitesContainer.ListBlobs(prefix, false, Microsoft.WindowsAzure.Storage.Blob.BlobListingDetails.Metadata).OfType<CloudBlockBlob>()
                .Select(blob =>
                {
                    var name = blob.Name.Replace(prefix, "");

                    var fullBlob = ImageActions.WebsitesContainer.GetBlockBlobReference(prefix + name);
                    var thumbBlob = ImageActions.WebsitesContainer.GetBlockBlobReference(prefix + "thumbs/" + name);

                    return new { Id = fullBlob.Uri.ToString(), Name = name, QueryImage = thumbBlob.Uri.ToString() };
                });
        }

        public IEnumerable<object> WebsiteImages(CustomQueryArgs e)
        {
            var websiteId = Guid.Parse(e.Parent.ObjectId);
            VerifyWebsiteAccess(websiteId);

            return ListImages(ImageActions.GetWebsitePrefix(websiteId));
        }

        public IEnumerable<object> ProductImages(CustomQueryArgs e)
        {
            var product = this.GetEntity<Product>(e.Parent);
            VerifyProductAccess(product.Id);

            return ListImages(ImageActions.GetProductPrefix(product.Website.Id, product.Id));
        }

        public IEnumerable<object> PageImages(CustomQueryArgs e)
        {
            var page = this.GetEntity<Page>(e.Parent);
            VerifyPageAccess(page.Id);

            return ListImages(ImageActions.GetPagePrefix(page.Website.Id, page.Id));
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

        public void VerifyPageAccess(Guid id)
        {
            if (Manager.Current.User.IsMemberOf("Administrators"))
                return;

            var page = this.Pages.FirstOrDefault(p => p.Id == id);
            if (page != null)
            {
                if (page.Website.Users.Any(u => u.Id == Manager.Current.User.Id))
                    return;
            }

            throw new InvalidOperationException("Page access is not allowed.");
        }
    }
}
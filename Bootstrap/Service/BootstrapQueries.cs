using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Vidyano.Core.Extensions;
using Vidyano.Service;
using Vidyano.Service.Dynamic;
using Vidyano.Service.Repository;

namespace Bootstrap.Service
{
    partial class BootstrapEntityModelContainer
    {
        public IEnumerable<object> AzureStorageImages(CustomQueryArgs e)
        {
            Website website = null;

            var isDynamic = !e.Parent.FullTypeName.StartsWith("Bootstrap.");
            if (isDynamic)
            {
                var dynamicSchemaId = e.Parent.FullTypeName.Split('.')[0];
                website = Websites.First(w => w.DynamicSchema_Id == dynamicSchemaId);
            }
            else
                website = this.GetEntity<Website>(e.Parent);

            var prefix = ImageActions.GetContainerPrefix(website, isDynamic ? e.Parent.Type : null, isDynamic ? e.Parent.ObjectId : null);
            var thumbsPrefix = ImageActions.GetContainerPrefix(website, isDynamic ? e.Parent.Type : null, isDynamic ? e.Parent.ObjectId : null, true);

            return ImageActions.ImagesContainer.ListBlobs(prefix, false, Microsoft.WindowsAzure.Storage.Blob.BlobListingDetails.Metadata).OfType<CloudBlockBlob>()
                .Select(blob =>
                {
                    var name = blob.Name.Replace(prefix, "");

                    var fullBlob = ImageActions.ImagesContainer.GetBlockBlobReference(blob.Name);
                    var thumbBlob = ImageActions.ImagesContainer.GetBlockBlobReference(thumbsPrefix + name);

                    return new { Id = fullBlob.Uri.ToString(), Name = name, QueryImage = thumbBlob.Uri.ToString() };
                });
        }
    }
}
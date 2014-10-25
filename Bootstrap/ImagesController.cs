using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Web;

namespace Bootstrap
{
    public class ImagesController : ApiController
    {
        private static readonly Dictionary<Guid, byte[]> thumbImages = new Dictionary<Guid, byte[]>();

        public HttpResponseMessage Get(string id)
        {
            var thumb = false;
            if (id.Contains(";"))
            {
                var splitId = id.Split(new [] { ';' }, 2);
                if (splitId.Length == 2 && splitId[1].ToLower() == "thumb")
                {
                    thumb = true;
                    id = splitId[0];
                }
            }

            //var imageId = Guid.Parse(id);
            //using (var context = new Service.BootstrapEntityModelContainer())
            //{
            //    var image = context.Images.Where(img => img.Id == imageId).FirstOrDefault();
            //    if (image != null)
            //    {
            //        if (thumb)
            //        {
            //            byte[] thumbData;
            //            if (!thumbImages.TryGetValue(imageId, out thumbData))
            //            {
            //                thumbData = Service.ImageProcessor.ResizeImage(image.ImageFull, 200);
            //                thumbImages[imageId] = thumbData;
            //            }
            //            image.ImageFull = thumbData;
            //        }

            //        string hash;
            //        using (var hasher = SHA1.Create())
            //            hash = "\"" + Convert.ToBase64String(hasher.ComputeHash(image.ImageFull)) + "\"";

            //        if (Request.Headers.IfNoneMatch.Any(ifm => ifm.Tag == hash))
            //            return new HttpResponseMessage(HttpStatusCode.NotModified);

            //        var message = new HttpResponseMessage();
            //        message.Headers.ETag = new EntityTagHeaderValue(hash);
            //        message.Content = new ByteArrayContent(image.ImageFull);
            //        if (image.ImageFull[0] == 0x89 && image.ImageFull[1] == 0x50 && image.ImageFull[2] == 0x4E && image.ImageFull[3] == 0x47)
            //            message.Content.Headers.ContentType = new MediaTypeHeaderValue("image/png");
            //        else
            //            message.Content.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
            //        return message;
            //    }
            //    else
            //        RemoveThumb(imageId);
            //}

            return new HttpResponseMessage(HttpStatusCode.NoContent);
        }

        internal static void RemoveThumb(Guid id)
        {
            thumbImages.Remove(id);
        }
    }
}
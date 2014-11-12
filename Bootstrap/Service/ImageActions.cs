using System;
using System.Collections.Generic;
using System.Data.Entity.Core;
using System.Data.Entity.Core.Objects;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Vidyano.Core.Extensions;
using Vidyano.Service.Dynamic;
using Vidyano.Service.Repository;

namespace Bootstrap.Service
{
    public interface IImage : ICollectionEntity
    {
        string Name { get; set; }

        string Description { get; set; }

        string Image { get; set; }

        string ImageThumb { get; set; }
    }

    public interface IImages : ICollectionEntity
    {
        string Images { get; set; }
    }

    static class ImageHelpers
    {
        public static ObjectContext GetImagesParent(this PersistentObject obj, out IImages entity)
        {
            var objectQuery = (ObjectQuery)DynamicContext.Query(obj);
            var context = objectQuery.Context;
            entity = context.GetObjectByKey(new EntityKey("CodeFirstContainer." + objectQuery.GetResultType().EdmType.Name, "Id", Guid.Parse(obj.ObjectId))) as IImages;

            return context;
        }

        public static IImage AsIImage<TEntity>(this JToken jImage)
            where TEntity : new()
        {
            var image = (IImage)new TEntity();

            image.Id = (Guid)jImage["Id"];
            image.Name = (string)jImage["Name"];
            image.Description = (string)jImage["Description"];
            image.Image = (string)jImage["Image"];
            image.ImageThumb = (string)jImage["ImageThumb"];

            return image;
        }

        public static JToken AsJImage(this PersistentObject obj, JToken jImage = null)
        {
            if (jImage == null)
                jImage = new JObject();

            jImage["Id"] = !string.IsNullOrEmpty(obj.ObjectId) ? obj.ObjectId : Guid.NewGuid().ToString();
            jImage["Name"] = (string)obj["Name"];
            jImage["Description"] = (string)obj["Description"];
            jImage["Image"] = (string)obj["Image"];
            jImage["ImageThumb"] = (string)obj["ImageThumb"];

            return jImage;
        }

        public static string GetImagePath(this PersistentObject parent, string objectId = null, bool thumbs = false)
        {
            if (parent == null)
                throw new InvalidOperationException("Images must have a parent.");

            var key = parent.FullTypeName == "Bootstrap.Website" ? (string)parent["DynamicSchema_Id"] : parent.FullTypeName + "." + (objectId ?? parent.ObjectId);
            return key.Replace(".", "/") + "/" + (thumbs ? "thumbs/" : null);
        }
    }

    public class ImageActions<TEntity> : DefaultPersistentObjectActions<TEntity>
        where TEntity : class, ICollectionEntity, new()
    {
        public override void OnConstruct(PersistentObject obj)
        {
            base.OnConstruct(obj);

            var imageThumbAttr = obj["ImageThumb"];
            imageThumbAttr.DataType = "ImageByUrl";
            imageThumbAttr.DataTypeHints = "Height=64; Width=64";

            obj["Image"].Visibility = AttributeVisibility.New;
        }

        public override void OnLoad(PersistentObject obj, PersistentObject parent)
        {
            base.OnLoad(obj, parent);

            var imageThumbAttr = obj["ImageThumb"];
            imageThumbAttr.Options = new[] { (string)obj["Image"] };
            imageThumbAttr.IsReadOnly = true;
            obj["Name"].IsReadOnly = true;
            obj["Name"].Visibility = AttributeVisibility.Never;
        }

        protected override TEntity LoadEntity(PersistentObject obj, bool forRefresh = false)
        {
            if (obj.Parent.FullTypeName == "Bootstrap.Website")
                return base.LoadEntity(obj, forRefresh);

            IImages imagesParent;
            using (obj.Parent.GetImagesParent(out imagesParent))
            {
                if (imagesParent != null)
                {
                    var images = JArray.Parse(imagesParent.Images ?? "[]");
                    return (TEntity)images.FirstOrDefault(img => ((string)img["Id"]) == obj.ObjectId).AsIImage<TEntity>();
                }
            }

            return null;
        }

        public override void OnNew(PersistentObject obj, PersistentObject parent, Query query, Dictionary<string, string> parameters)
        {
            if (parent == null)
                throw new InvalidOperationException();

            base.OnNew(obj, parent, query, parameters);

            obj["Image"].DataType = DataTypes.Image;
            obj["Image"].AddRule("Required");

            obj["Name"].Visibility = AttributeVisibility.Never;
            obj["Name"].AddRule("NotEmpty");

            obj["ImageThumb"].Visibility = AttributeVisibility.Never;
        }

        protected override void SaveNew(PersistentObject obj)
        {
            obj["Image"].AddRule("Required");
            obj["Name"].AddRule("NotEmpty");

            if (CheckRules(obj))
            {
                var imageAttr = obj["Image"];
                var imageData = (byte[])imageAttr;

                try
                {
                    using (var img = Image.FromStream(new MemoryStream(imageData)))
                    {
                        if (img.RawFormat.Guid != ImageFormat.Bmp.Guid &&
                            img.RawFormat.Guid != ImageFormat.Gif.Guid &&
                            img.RawFormat.Guid != ImageFormat.Jpeg.Guid &&
                            img.RawFormat.Guid != ImageFormat.Png.Guid)
                            throw new Exception();
                    }
                }
                catch
                {
                    throw new InvalidOperationException(Manager.Current.GetTranslatedMessage("InvalidImage"));
                }

                var imageUri = UploadImage(obj.Parent.GetImagePath() + (string)obj["Name"], imageData);
                var imageThumbUri = UploadImage(obj.Parent.GetImagePath(thumbs: true) + (string)obj["Name"], ImageProcessor.ResizeImage(imageData, 200));

                imageAttr.DataType = DataTypes.String;
                imageAttr.SetValue(imageUri);
                obj["ImageThumb"].SetValue(imageThumbUri);

                if (!obj.HasError && obj.Parent.FullTypeName == "Bootstrap.Website")
                    base.SaveNew(obj);
                else
                {
                    IImages imagesParent;
                    using (var context = obj.Parent.GetImagesParent(out imagesParent))
                    {
                        if (imagesParent != null)
                        {
                            var images = JArray.Parse(imagesParent.Images ?? "[]");
                            images.Add(obj.AsJImage());
                            imagesParent.Images = images.ToString(Formatting.None);

                            context.SaveChanges();
                        }
                    }
                }
            }
            else
                base.SaveNew(obj);
        }

        protected override void SaveExisting(PersistentObject obj, TEntity entity)
        {
            if (obj.Parent.FullTypeName == "Bootstrap.Website")
                base.SaveExisting(obj, entity);
            else
            {
                IImages imagesParent;
                using (var context = obj.Parent.GetImagesParent(out imagesParent))
                {
                    if (imagesParent != null)
                    {
                        var images = JArray.Parse(imagesParent.Images ?? "[]");
                        obj.AsJImage(images.First(img => ((string)img["Id"]) == obj.ObjectId));
                        imagesParent.Images = images.ToString(Formatting.None);

                        context.SaveChanges();
                    }
                }
            }
        }

        public override void OnDelete(PersistentObject parent, IEnumerable<TEntity> entities, Query query, QueryResultItem[] selectedItems)
        {
            if (parent.FullTypeName == "Bootstrap.Website")
            {
                base.OnDelete(parent, entities, query, selectedItems);

                selectedItems.Run(item =>
                {
                    ImagesController.ImagesContainer.GetBlockBlobReference(parent.GetImagePath() + item["Name"]).DeleteIfExists();
                    ImagesController.ImagesContainer.GetBlockBlobReference(parent.GetImagePath(thumbs: true) + item["Name"]).DeleteIfExists();
                });
            }
            else
            {
                IImages imagesParent;
                using (var context = parent.GetImagesParent(out imagesParent))
                {
                    if (imagesParent != null)
                    {
                        var images = JArray.Parse(imagesParent.Images ?? "[]");
                        selectedItems.Run(item =>
                        {
                            var image = images.FirstOrDefault(img => ((string)img["Id"]) == item.Id);
                            images.Remove(image);

                            ImagesController.ImagesContainer.GetBlockBlobReference(parent.GetImagePath() + item["Name"]).DeleteIfExists();
                            ImagesController.ImagesContainer.GetBlockBlobReference(parent.GetImagePath(thumbs: true) + item["Name"]).DeleteIfExists();
                        });

                        imagesParent.Images = images.ToString(Formatting.None);
                        context.SaveChanges();
                    }
                }
            }
        }

        public IEnumerable<TEntity> Images(CustomQueryArgs e)
        {
            if (e.Parent.FullTypeName == "Bootstrap.Website")
                return GetSource(e.Query.PersistentObject);

            IImages imagesParent;
            using (e.Parent.GetImagesParent(out imagesParent))
            {
                if (imagesParent != null)
                    return JArray.Parse(imagesParent.Images ?? "[]").Select(jImage => (TEntity)jImage.AsIImage<TEntity>()).ToArray();
            }

            return Empty<TEntity>.Array;
        }

        private static string UploadImage(string name, byte[] image)
        {
            var blob = ImagesController.ImagesContainer.GetBlockBlobReference(name);
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
            }
            blob.SetProperties();

            return blob.Uri.ToString();
        }
    }
}
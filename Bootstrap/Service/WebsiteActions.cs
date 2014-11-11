using Microsoft.CSharp;
using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using Vidyano.Core.Extensions;
using Vidyano.Service;
using Vidyano.Service.Charts;
using Vidyano.Service.Dynamic;
using Vidyano.Service.Repository;

namespace Bootstrap.Service
{
    public class WebsiteActions : PersistentObjectActions<BootstrapEntityModelContainer, Website>
    {
        private static readonly CSharpCodeProvider provider = new CSharpCodeProvider();

        public override void OnLoad(PersistentObject obj, PersistentObject parent)
        {
            base.OnLoad(obj, parent);

            var schema = Manager.Current.Dynamic.GetOrCreateSchema((string)obj["DynamicSchema_Id"], false);
            if (schema != null)
            {
                schema.Collections.Run(coll => obj.Queries.Add(coll.ToQuery()));
                schema.ConfigureOn(obj, true, true, false);
            }

            obj.Queries.Run(q => q.IsIncludedInParentObject = true);
        }

        public override void OnSave(PersistentObject obj)
        {
            if (obj.IsNew)
            {
                var name = (string)obj.GetAttributeValue("Name");
                if (!string.IsNullOrWhiteSpace(name))
                    obj["DynamicSchema_Id"] = ValidIdentifier(name);
            }

            base.OnSave(obj);

            if (!obj.HasError && obj.IsNew)
            {
                var schema = Manager.Current.Dynamic.GetOrCreateSchema((string)obj["DynamicSchema_Id"]);
                var pages = schema.GetOrCreateCollection("Page", "Pages", true, false);
                pages.GetOrCreateProperty("Name", "Name", "Text", 10);
                pages.GetOrCreateProperty("Content", "Content", "CommonMark", 20);

                var images = schema.GetOrCreateCollection("Image", "Images");
                images.GetOrCreateProperty("Name", "Name", "Text", 10);
                images.GetOrCreateProperty("ImageThumb", "Image", "LongText", 20);
                images.GetOrCreateProperty("Description", "Description", "LongText", 30);
                images.GetOrCreateProperty("Image", "Image", "LongText", 40);

                var builder = Manager.Current.GetBuilder();

                var imagesPo = builder.GetOrCreatePersistentObject(schema.Name + ".Image");
                imagesPo.Breadcrumb = "{Name}";
                imagesPo.SortOptions = "Name ASC";
                var keyAttr = imagesPo.GetOrCreateAttribute("Key");
                keyAttr.Visibility = AttributeVisibility.Never;
                keyAttr.IsReadOnly = true;

                var imagesQueryBuilder = builder.GetOrCreateQuery(schema.Name + "_Images");
                imagesQueryBuilder.Source = "Custom.Images";

                builder.Save();

                Manager.Current.GetUserOrGroup(schema.Name).AddToGroup("Users");
            }
        }

        public override void OnDelete(PersistentObject parent, IEnumerable<Website> entities, Query query, QueryResultItem[] selectedItems)
        {
            entities.Run(website =>
            {
                Manager.Current.Dynamic.DeleteSchema(website.DynamicSchema_Id);
                ImagesController.ImagesContainer.ListBlobs(website.Name, true).OfType<CloudBlockBlob>().Run(blob => blob.DeleteIfExists());
            });
            base.OnDelete(parent, entities, query, selectedItems);
        }

        private static string ValidIdentifier(string identifier, bool isProperty = false)
        {
            if (!provider.IsValidIdentifier(identifier))
            {
                identifier = provider.CreateValidIdentifier(Regex.Replace(identifier, @"[^\p{Ll}\p{Lu}\p{Lt}\p{Lo}\p{Nd}\p{Nl}\p{Mn}\p{Mc}\p{Cf}\p{Pc}\p{Lm}]", "_"));
                if (char.IsDigit(identifier[0]))
                    identifier = "_" + identifier;
            }

            if (isProperty && identifier[0] == '_')
                identifier = "m" + identifier;

            return identifier;
        }

        internal static Website GetWebsite(PersistentObject obj)
        {
            if(obj == null)
                return null;

            using (var context = new BootstrapEntityModelContainer())
            {
                if (obj.FullTypeName == "Bootstrap.Website")
                    return context.GetEntity<Website>(obj);

                var schemaName = obj.FullTypeName.Split('.')[0];
                return context.Websites.FirstOrDefault(website => website.DynamicSchema_Id == schemaName);
            }
        }
    }
}
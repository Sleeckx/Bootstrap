using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Vidyano.Core.Extensions;
using Vidyano.Service.Dynamic;
using Vidyano.Service.Repository;

namespace Bootstrap.Service
{
    public class DefaultPersistentObjectActions<TEntity> : DynamicPersistentObjectActions<TEntity>
        where TEntity : class, ICollectionEntity
    {
        protected static bool IsReadOnly
        {
            get
            {
                return Manager.Current.User.IsGroup;
            }
        }

        public override void OnConstruct(PersistentObject obj)
        {
            base.OnConstruct(obj);

            var commonMarkAttributes = obj.Attributes.Where(attr => attr.DataType.Type == DataTypes.CommonMark).ToArray();
            if (commonMarkAttributes.Length > 0)
            {
                if (IsReadOnly)
                    commonMarkAttributes.Run(attr => attr.DataTypeHints = "QueryMaxContentLength=0");

                if (!IsReadOnly)
                {
                    PersistentObjectAttribute imagesAttribute;
                    if (obj.TryGetAttribute("Images", out imagesAttribute))
                        obj.Attributes.Remove(imagesAttribute);
                    else
                    {
                        // Collections with CommonMark properties can have associated images
                        var schemaName = obj.FullTypeName.Split('.')[0];
                        var schema = Manager.Current.Dynamic.GetOrCreateSchema(schemaName);
                        var collection = schema.GetOrCreateCollection(obj.Type);
                        collection.GetOrCreateProperty("Images", offset: 100000, dataType: "MultiLineString");

                        var builder = Manager.Current.GetBuilder();
                        var poBuilder = builder.GetOrCreatePersistentObject(obj.FullTypeName);
                        var imagesAttributeBuilder = poBuilder.GetOrCreateAttribute("Images");
                        imagesAttributeBuilder.DataTypeHints = "QueryMaxContentLength=0";
                        imagesAttributeBuilder.Visibility = AttributeVisibility.Query;
                        builder.Save();
                    }
                }
            }

            obj.Attributes.Where(a => a.DataType.Type == DataTypes.NullableBoolean).Run(a => a.DataType = DataTypes.YesNo);
        }

        public override void OnLoad(PersistentObject obj, PersistentObject parent)
        {
            base.OnLoad(obj, parent);

            if (obj.HasError)
                return;

            var commonMarkAttributes = obj.Attributes.Where(a => a.DataType.Type == DataTypes.CommonMark).ToArray();
            if (commonMarkAttributes.Length > 0)
            {
                var schemaName = obj.FullTypeName.Split('.')[0];

                if (!IsReadOnly)
                {
                    obj.Queries.Add(Manager.Current.GetQuery(schemaName + "_Images"));

                    commonMarkAttributes.Run(attr =>
                    {
                        attr.Column = 0;
                        attr.ColumnSpan = 4;
                        attr.DataTypeHints = "Height=400";
                    });

                    obj.StateBehavior = StateBehavior.StayInEdit;
                }
                else
                {
                    // If the current user isn't an editor or administrator, convert the CommonMark to HTML
                    var images = JArray.Parse((string)obj["Images"] ?? "[]");
                    commonMarkAttributes.Run(attr => attr.SetOriginalValue(CommonMarkToHTML(obj.Type, (string)attr, images)));
                }
            }
        }

        public override void OnDelete(PersistentObject parent, IEnumerable<TEntity> entities, Query query, QueryResultItem[] selectedItems)
        {
            if (parent != null && parent.FullTypeName == "Bootstrap.Website" && query.PersistentObject.Type != "Image")
            {
                var dynQuery = GetSource(query.PersistentObject);
                selectedItems.Run(item =>
                {
                    var id = Guid.Parse(item.Id);
                    var entity = dynQuery.FirstOrDefault(e => e.Id == id) as IImages;
                    if (entity != null)
                    {
                        var images = JArray.Parse(entity.Images ?? "[]").ToList();
                        images.Run(image =>
                        {
                            ImagesController.ImagesContainer.GetBlockBlobReference(query.PersistentObject.GetImagePath(item.Id) + (string)image["Name"]).DeleteIfExists();
                            ImagesController.ImagesContainer.GetBlockBlobReference(query.PersistentObject.GetImagePath(item.Id, true) + (string)image["Name"]).DeleteIfExists();
                        });
                    }
                });
            }

            base.OnDelete(parent, entities, query, selectedItems);
        }

        public override void QueryExecuted(QueryExecutedArgs args)
        {
            if (IsReadOnly)
            {
                // If the current user isn't an editor or administrator, convert the CommonMark to HTML
                var commonMarkColumns = args.Query.Columns.Where(col => col.Type == DataTypes.CommonMark).ToArray();
                if (commonMarkColumns.Length > 0)
                {
                    args.Result.Items.Run(item =>
                    {
                        var images = JArray.Parse(item["Images"] ?? "[]");
                        commonMarkColumns.Run(col => { item.SetValue(col.Name, CommonMarkToHTML(args.Query.PersistentObject.Type, item[col.Name], images)); });

                        // Clean up image data for client
                        item.SetValue("Images", new JArray(images.Select(image =>
                        {
                            var newImage = new JObject();
                            newImage["Image"] = (string)image["Image"];
                            newImage["ImageThumb"] = (string)image["ImageThumb"];

                            return newImage;
                        })).ToString(Formatting.None));
                    });
                }
            }
        }

        protected virtual string CommonMarkToHTML(string collection, string value, JArray images, bool addRemainingImages = false)
        {
            if (String.IsNullOrEmpty(value))
            {
                if (!addRemainingImages)
                    return string.Empty;

                value = string.Empty;
            }

            var unusedImages = images.ToList();
            var html = Regex.Replace(value, @"\((.+?)\)", match =>
            {
                var imageName = match.Groups[1].Value;

                var imageMatch = images.FirstOrDefault(image => (string)image["Name"] == imageName);
                if (imageMatch == null)
                    return match.Groups[0].Value;

                unusedImages.Remove(imageMatch);

                return CreateLightBoxLink(
                    (string)imageMatch["Image"],
                    collection,
                    (string)imageMatch["Description"],
                    (string)imageMatch["ImageThumb"]);
            });

            if (addRemainingImages)
            {
                var sb = new StringBuilder(html);
                sb.AppendLine();
                sb.AppendLine();

                unusedImages.Run(image => sb.AppendLine(CreateLightBoxLink((string)image["Image"], (string)image["ImageThumb"], (string)image["Description"], collection)));

                html = sb.ToString();
            }

            return html.ConvertFromCommonMark();
        }

        protected virtual string CreateLightBoxLink(string image, string thumb, string desc, string group)
        {
            return string.Format("<a class='bootstrap-image-link' href='{0}' data-lightbox='{1}' data-title='{2}'><img class='bootstrap-image' src='{3}' alt='' /></a>",
                image, group, desc, thumb);
        }
    }
}
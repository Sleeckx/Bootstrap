using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data.Entity.Core.Objects;
using System.Data.Entity.Core.Objects.DataClasses;
using System.Linq;
using System.Runtime.Remoting.Messaging;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
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

            var commonMarkAttributes = obj.Attributes.Where(attr => attr.DataType.Type == "CommonMark").ToArray();
            if (commonMarkAttributes.Length > 0)
            {
                if (IsReadOnly)
                    commonMarkAttributes.Run(attr => attr.DataTypeHints = "QueryMaxContentLength=0");

                if (!IsReadOnly)
                {
                    PersistentObjectAttribute imagesAttribute;
                    if (obj.TryGetAttribute("Images", out imagesAttribute))
                        obj.Attributes.Remove(imagesAttribute);
                }
            }

            obj.Attributes.Where(a => a.DataType.Type == DataTypes.NullableBoolean).Run(a => a.DataType = Manager.Current.GetDataType(DataTypes.YesNo));
        }

        public override void OnNew(PersistentObject obj, PersistentObject parent, Query query, Dictionary<string, string> parameters)
        {
            base.OnNew(obj, parent, query, parameters);

            obj.Attributes.Where(a => a.DataType.Type == DataTypes.YesNo).Run(a => a.SetOriginalValue(false));
        }

        public override void OnLoad(Vidyano.Service.Repository.PersistentObject obj, Vidyano.Service.Repository.PersistentObject parent)
        {
            base.OnLoad(obj, parent);

            if (obj.HasError)
                return;

            var commonMarkAttributes = obj.Attributes.Where(a => a.DataType.Type == "CommonMark").ToArray();
            if (commonMarkAttributes.Length > 0)
            {
                var schemaName = obj.FullTypeName.Split('.')[0];

                if (!IsReadOnly)
                {
                    // Collections with CommonMark properties can have associated images
                    PersistentObjectAttribute imagesAttribute;
                    if (!obj.TryGetAttribute("Images", out imagesAttribute))
                    {
                        var schema = Manager.Current.Dynamic.GetOrCreateSchema(schemaName);
                        var collection = schema.GetOrCreateCollection(obj.Type);
                        var imagesProperty = collection.GetOrCreateProperty("Images", offset: 100000, dataType: "MultiLineString");

                        var builder = Manager.Current.GetBuilder();
                        var poBuilder = builder.GetOrCreatePersistentObject(obj.FullTypeName);
                        var imagesAttributeBuilder = poBuilder.GetOrCreateAttribute("Images");
                        imagesAttributeBuilder.DataTypeHints = "QueryMaxContentLength=0";
                        imagesAttributeBuilder.Visibility = AttributeVisibility.Query;
                        builder.Save();
                    }

                    obj.Queries.Add(Manager.Current.GetQuery(schemaName + "_Images"));

                    commonMarkAttributes.Run(attr =>
                    {
                        attr.Column = 0;
                        attr.ColumnSpan = 4;
                        attr.DataTypeHints = "Height=400";
                    });

                    obj.StateBehavior = StateBehavior.StayInEdit;

                    obj.Attributes.Where(a => a.DataType.Type == DataTypes.NullableBoolean).Run(a => a.DataType = Manager.Current.GetDataType(DataTypes.YesNo));
                }

                if (IsReadOnly)
                {
                    // If the current user isn't an editor or administrator, convert the CommonMark to HTML
                    using (var dbContext = new BootstrapEntityModelContainer())
                    {
                        var website = dbContext.Websites.First(ws => ws.DynamicSchema_Id == schemaName);
                        var images = JArray.Parse((string)obj.GetAttributeValue("Images") ?? "[]");
                        commonMarkAttributes.Run(attr => attr.SetOriginalValue(CommonMarkToHTML(website, obj.Type, (string)attr.GetValue(), images)));
                    }
                }
            }
        }

        public override void OnDelete(PersistentObject parent, IEnumerable<TEntity> entities, Query query, QueryResultItem[] selectedItems)
        {
            if (parent != null && parent.FullTypeName == "Bootstrap.Website" && query.PersistentObject.Type != "Image")
            {
                var dynQuery = ((ObjectQuery<TEntity>)DynamicContext.Query(query.PersistentObject));
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
                var commonMarkColumns = args.Query.Columns.Where(col => col.Attribute.DataType.Type == "CommonMark").ToArray();
                if (commonMarkColumns.Length > 0)
                {
                    var schemaName = args.Query.PersistentObject.FullTypeName.Split('.')[0];

                    using (var dbContext = new BootstrapEntityModelContainer())
                    {
                        var website = dbContext.Websites.First(ws => ws.DynamicSchema_Id == schemaName);

                        args.Result.Items.Run(item =>
                        {
                            var images = JArray.Parse(item.GetValue("Images") ?? "[]");
                            commonMarkColumns.Run(col =>
                            {
                                item.SetValue(col.Name, CommonMarkToHTML(website, args.Query.PersistentObject.Type, item.GetValue(col.Name), images));
                            });

                            // Clean up image data for client
                            item.SetValue("Images", new JArray(images.Select(image =>
                            {
                                var newImage = new JObject();
                                newImage["Image"] = (string)image["Image"];
                                newImage["ImageThumb"] = (string)image["ImageThumb"];

                                return newImage;
                            }).ToArray()).ToString(Formatting.None));
                        });
                    }
                }
            }
        }

        protected virtual string CommonMarkToHTML(Website website, string collection, string value, JArray images, bool addRemainingImages = false)
        {
            if (String.IsNullOrEmpty(value))
            {
                if (!addRemainingImages)
                    return string.Empty;

                value = string.Empty;
            }

            var unusedImages = images.ToList();
            var html = Regex.Replace(value, @"\((.+?)\)", new MatchEvaluator(match =>
            {
                var imageName = match.Groups[1].Value;

                var imageMatch = images.FirstOrDefault(image => (string)image["Name"] == imageName);
                if (imageMatch == null)
                    return match.Groups[0].Value;

                unusedImages.Remove(imageMatch);

                return string.Format(@"<a class='bootstrap-image-link' href='{0}' data-lightbox='{1}' data-title='{2}'><img class='bootstrap-image' src='{3}' alt='' /></a>",
                    (string)imageMatch["Image"],
                    collection,
                    (string)imageMatch["Description"],
                    (string)imageMatch["ImageThumb"]);
            }));

            if (addRemainingImages)
            {
                var sb = new StringBuilder(html);
                sb.AppendLine();
                sb.AppendLine();

                unusedImages.Run(image => sb.Append(CreateLightBoxLink((string)image["Image"], (string)image["ImageThumb"], (string)image["Description"], collection)));

                html = sb.ToString();
            }

            return html.ConvertFromCommonMark();
        }

        protected virtual string CreateLightBoxLink(string image, string thumb, string desc, string group)
        {
            return string.Format(@"<a class='bootstrap-image-link' href='{0}' data-lightbox='{1}' data-title='{2}'><img class='bootstrap-image' src='{3}' alt='' /></a>",
                image, group, desc, thumb) + Environment.NewLine;
        }
    }
}
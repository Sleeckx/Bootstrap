using System;
using System.Collections.Generic;
using System.Linq;
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
        public override void OnConstruct(PersistentObject obj)
        {
            base.OnConstruct(obj);

            if (IsReadOnly)
            {
                var commonMarkAttributes = obj.Attributes.Where(attr => attr.DataType.Type == "CommonMark").ToArray();
                if (commonMarkAttributes.Length > 0)
                    commonMarkAttributes.Run(attr => attr.DataTypeHints = "QueryMaxContentLength=0");
            }
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
                    // Collections with CommonMark properties can have associated images on Azure storage
                    obj.Queries.Add(Manager.Current.GetQuery("AzureStorageImages"));

                    commonMarkAttributes.Run(attr =>
                    {
                        attr.Column = 0;
                        attr.ColumnSpan = 4;
                        attr.DataTypeHints = "Height=400";
                    });

                    obj.StateBehavior = StateBehavior.StayInEdit;
                }

                if (IsReadOnly)
                {
                    // If the current user isn't an editor or administrator, convert the CommonMark to HTML
                    using (var dbContext = new BootstrapEntityModelContainer())
                    {
                        var website = dbContext.Websites.First(ws => ws.DynamicSchema_Id == schemaName);
                        commonMarkAttributes.Run(attr => attr.SetOriginalValue(CommonMarkToHTML(website, obj.Type, obj.ObjectId, (string)attr.GetValue())));
                    }
                }
            }
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
                            commonMarkColumns.Run(col =>
                            {
                                item.SetValue(col.Name, CommonMarkToHTML(website, args.Query.PersistentObject.Type, item.Id, item.GetValue(col.Name)));
                            });
                        });
                    }
                }
            }
        }

        private static bool IsReadOnly
        {
            get
            {
                return Manager.Current.User.IsGroup;
            }
        }

        private static string CommonMarkToHTML(Website website, string collection, string collectionEntityId, string value)
        {
            if (String.IsNullOrEmpty(value))
                return string.Empty;

            return Regex.Replace(value, @"\(((.+?) ""(.+?)"")\)", new MatchEvaluator(match =>
            {
                var imageName = match.Groups[2].Value;
                var imageTitle = match.Groups[3].Value;

                var fullBlob = ImageActions.ImagesContainer.GetBlockBlobReference(ImageActions.GetContainerPrefix(website, collection, collectionEntityId) + imageName);
                var thumbBlob = ImageActions.ImagesContainer.GetBlockBlobReference(ImageActions.GetContainerPrefix(website, collection, collectionEntityId, true) + imageName);

                return string.Format(@"<a class='bootstrap-image-link' href='{0}' data-lightbox='{1}' data-title='{2}'><img class='bootstrap-image' src='{3}' alt='' /></a>",
                    fullBlob.Uri.ToString(),
                    collection,
                    imageTitle,
                    thumbBlob.Uri.ToString()) + Environment.NewLine;
            })).ConvertFromCommonMark();
        }
    }
}
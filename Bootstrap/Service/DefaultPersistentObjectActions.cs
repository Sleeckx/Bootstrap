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
        public override void OnLoad(Vidyano.Service.Repository.PersistentObject obj, Vidyano.Service.Repository.PersistentObject parent)
        {
            base.OnLoad(obj, parent);

            if (obj.HasError)
                return;

            var commonMarkAttributes = obj.Attributes.Where(a => a.DataType.Type == "CommonMark").ToArray();
            if (commonMarkAttributes.Length > 0)
            {
                var schemaName = obj.FullTypeName.Split('.')[0];
                var isAdmin = Manager.Current.User.IsMemberOf(schemaName + "_Admin");
                var isEditor = Manager.Current.User.IsMemberOf(schemaName + "_Edit");

                if (isAdmin)
                {
                    // Collections with CommonMark properties can have associated images on Azure storage
                    obj.Queries.Add(Manager.Current.GetQuery("AzureStorageImages"));
                }

                using (var dbContext = new BootstrapEntityModelContainer())
                {
                    var website = dbContext.Websites.First(ws => ws.DynamicSchema_Id == schemaName);

                    // If the current user isn't an editor or administrator, convert the CommonMark to HTML
                    if (!isAdmin && !isEditor)
                    {
                        commonMarkAttributes.Run(attr =>
                        {
                            var content = Regex.Replace((string)attr.GetValue(), @"\(((.+?) ""(.+?)"")\)", new MatchEvaluator(match =>
                            {
                                var imageName = match.Groups[2].Value;
                                var imageTitle = match.Groups[3].Value;

                                var fullBlob = ImageActions.ImagesContainer.GetBlockBlobReference(ImageActions.GetContainerPrefix(website, obj.Type, obj.ObjectId) + imageName);
                                var thumbBlob = ImageActions.ImagesContainer.GetBlockBlobReference(ImageActions.GetContainerPrefix(website, obj.Type, obj.ObjectId, true) + imageName);

                                return string.Format(@"<a class='bootstrap-image-link' href='{0}' data-lightbox='{1}' data-title='{2}'><img class='bootstrap-image' src='{3}' alt='' /></a>",
                                    fullBlob.Uri.ToString(),
                                    obj.FullTypeName.Replace('.', '_'),
                                    imageTitle,
                                    thumbBlob.Uri.ToString());
                            }));

                            attr.SetOriginalValue(content.ConvertFromCommonMark());
                        });
                    }
                }
            }
        }
    }
}
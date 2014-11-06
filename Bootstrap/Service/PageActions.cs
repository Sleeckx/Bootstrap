using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Vidyano.Core.Extensions;
using Vidyano.Service;
using Vidyano.Service.Charts;
using Vidyano.Service.Dynamic;
using Vidyano.Service.Repository;

namespace Bootstrap.Service
{
    public class PageActions<TEntity> : DefaultPersistentObjectActions<TEntity>
        where TEntity : class, ICollectionEntity
    {
        public override void OnLoad(Vidyano.Service.Repository.PersistentObject obj, Vidyano.Service.Repository.PersistentObject parent)
        {
            Guid pageId;
            if (!Guid.TryParse(obj.ObjectId, out pageId))
            {
                using (var dbContext = new BootstrapEntityModelContainer())
                {
                    var website = dbContext.Websites.FirstOrDefault(ws => ws.DynamicSchema_Id == Manager.Current.User.Name);
                    if (website == null)
                        throw new InvalidOperationException("Website for the requested page was not found.");

                    var schema = Manager.Current.Dynamic.GetOrCreateSchema(Manager.Current.User.Name);
                    var pageCollection = schema.GetOrCreateCollection("Page");
                    var pages = Manager.Current.ExecuteQuery(pageCollection.ToQuery());
                    var page = pages.Items.FirstOrDefault(pageItem => pageItem.GetValue("Name") == obj.ObjectId);
                    if (page == null)
                        throw new InvalidOperationException("The requested page was not found.");

                    obj.ObjectId = page.Id;
                }
            }

            base.OnLoad(obj, parent);
        }
    }
}
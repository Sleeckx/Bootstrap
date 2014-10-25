using CommonMark;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Vidyano.Core.Extensions;
using Vidyano.Service;
using Vidyano.Service.Charts;
using Vidyano.Service.Repository;

namespace Bootstrap.Service
{
    public class PageActions : PersistentObjectActions<BootstrapEntityModelContainer, Page>
    {
        public override void OnLoad(PersistentObject obj, PersistentObject parent)
        {
            Guid id;
            if (!Guid.TryParse(obj.ObjectId, out id))
            {
                var idParts = obj.ObjectId.Split('.');
                var websiteId = idParts[0];
                var pageId = idParts[1];

                var website = Context.Websites.FirstOrDefault(w => w.Name == websiteId);
                if (website != null)
                {
                    Context.VerifyWebsiteAccess(website.Id);

                    var page = website.Pages.FirstOrDefault(p => p.Name == pageId);
                    if (page != null)
                    {
                        obj.ObjectId = Convert.ToString(page.Id);
                        base.OnLoad(obj, parent);

                        obj["Content"].SetOriginalValue(CommonMarkConverter.Convert((string)obj["Content"]));
                    }
                }
            }
            else
                base.OnLoad(obj, parent);
        }

        protected override Source<Page> Where(Source<Page> source, Query query)
        {
            if (Manager.Current.User.IsMemberOf("Administrators"))
                return base.Where(source, query);

            var userId = Manager.Current.User.Id;
            return base.Where(source, query).Where(p => p.Website.Users.Any(u => u.Id == userId));
        }
    }
}
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
    public class WebsiteActions : PersistentObjectActions<BootstrapEntityModelContainer, Website>
    {
        public override void OnConstruct(PersistentObject obj)
        {
            base.OnConstruct(obj);

            obj.Queries.Run(query => query.IsCountIncludedInParentObject = true);
        }

        protected override Source<Website> Where(Source<Website> source, Query query)
        {
            if (Manager.Current.User.IsMemberOf("Administrators"))
                return base.Where(source, query);

            var userId = Manager.Current.User.Id;
            return base.Where(source, query).Where(ws => ws.Users.Any(u => u.Id == userId));
        }
    }
}
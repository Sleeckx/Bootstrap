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
    public class UserActions : PersistentObjectActions<BootstrapEntityModelContainer, User>
    {
        public override void OnConstruct(Query query, PersistentObject parent)
        {
            base.OnConstruct(query, parent);
            query.Actions = query.Actions.Where(a => a != "New" && a != "BulkEdit").ToArray();
        }

        public override void OnAddReference(PersistentObject parent, IEnumerable<User> entities, Query query, QueryResultItem[] selectedItems)
        {
            selectedItems.Run(vidyanoUser =>
            {
                var website = Context.GetEntity<Website>(parent);
                website.Users.Add(new User { Id = Guid.Parse(vidyanoUser.Id), Website_Id = website.Id });
            });

            Context.SaveChanges();
        }

        public override void QueryExecuted(QueryExecutedArgs args)
        {
            base.QueryExecuted(args);

            args.Items.Run(item =>
            {
                var user = Manager.Current.GetUser(Guid.Parse(item.Id.Split(';')[0]));
                item.SetValue("Name", user.Name);
                item.SetValue("Groups", string.Join("; ", user.Groups.Select(g => g.Name)));
            });
        }
    }
}
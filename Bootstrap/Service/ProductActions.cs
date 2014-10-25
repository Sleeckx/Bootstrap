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
    public class ProductActions : PersistentObjectActions<BootstrapEntityModelContainer, Product>
    {
        protected override Source<Product> Where(Source<Product> source, Query query)
        {
            if (Manager.Current.User.IsMemberOf("Administrators"))
                return base.Where(source, query);

            var userId = Manager.Current.User.Id;
            return base.Where(source, query).Where(product => product.Website.Users.Any(u => u.Id == userId));
        }
    }
}
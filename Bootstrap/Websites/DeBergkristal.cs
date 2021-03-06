﻿using Bootstrap.Service;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using Vidyano.Core.Extensions;
using Vidyano.Service.Dynamic;
using Vidyano.Service.Repository;

namespace Bootstrap.Websites
{
    [Schema("DeBergkristal")]
    public class PageActions<TEntity> : Service.PageActions<TEntity>
        where TEntity : class, ICollectionEntity
    {
        protected override string CommonMarkToHTML(string collection, string value, JArray images, bool addRemainingImages = false)
        {
            return base.CommonMarkToHTML(collection, value, images, true);
        }
    }

    [Schema("DeBergkristal")]
    public class ProductActions<TEntity> : DefaultPersistentObjectActions<TEntity>
        where TEntity : class, ICollectionEntity
    {
        protected override string CommonMarkToHTML(string collection, string value, JArray images, bool addRemainingImages = false)
        {
            return base.CommonMarkToHTML(collection, value, images, true);
        }
    }

    [Schema("DeBergkristal")]
    public class NewsActions<TEntity> : DefaultPersistentObjectActions<TEntity>
        where TEntity : class, ICollectionEntity
    {
        public override void OnConstruct(PersistentObject obj)
        {
            base.OnConstruct(obj);

            obj["On"].Visibility = AttributeVisibility.Query;
        }

        public override void OnNew(PersistentObject obj, PersistentObject parent, Query query, Dictionary<string, string> parameters)
        {
            base.OnNew(obj, parent, query, parameters);

            obj.SetAttributeValue("On", Manager.Current.Now);
            obj["On"].IsReadOnly = true;
        }

        protected override string CommonMarkToHTML(string collection, string value, JArray images, bool addRemainingImages = false)
        {
            return base.CommonMarkToHTML(collection, value, images, true);
        }
    }
}
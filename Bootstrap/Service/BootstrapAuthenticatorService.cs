using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Vidyano.Core.Extensions;
using Vidyano.Service;
using Vidyano.Service.Repository;

namespace Bootstrap.Service
{
    public class BootstrapAuthenticatorService : AuthenticatorService
    {
        // NOTE: This feature requires an Application license (http://www.vidyano.com/Documentation/security)

        //public override bool CheckUserCredentials(UserCredentials credentials)
        //{
        //    // NOTE: This can use any external provider to validate users (AD, webservice, ...)
        //    // Failed logins can return false to show the default message (Invalid username or password) or throw an exception to use a custom message (Can't connect to AD...)
        //
        //    // Example: Find the user in the repository
        //    var user = GetUser(credentials.UserName);
        //    // As sample, if the user isn't mapped allow it (and it will use the default Users group), if it is found the password will be checked
        //    return user == null || user.CheckPassword(credentials.Password);
        //}

        //public override IUser GetUser(UserCredentials credentials)
        //{
        //    // The GetUserOrGroup method will return null if the userName isn't found, in that case we will map the unknown user to the Users group
        //    return GetUserOrGroup(credentials.UserName) ?? GetUserOrGroup("Users");
        //}

        //public override string GetFriendlyUserName(string userName, IUser user)
        //{
        //    // Return null or an empty string to use the friendly name defined for the user
        //    if (string.Equals(userName, "admin", StringComparison.InvariantCultureIgnoreCase))
        //        return "Administrator";
        //
        //    return null;
        //}
    }
}
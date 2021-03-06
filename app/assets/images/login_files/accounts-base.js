//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
//                                                                      //
// If you are using Chrome, open the Developer Tools and click the gear //
// icon in its lower right corner. In the General Settings panel, turn  //
// on 'Enable source maps'.                                             //
//                                                                      //
// If you are using Firefox 23, go to `about:config` and set the        //
// `devtools.debugger.source-maps-enabled` preference to true.          //
// (The preference should be on by default in Firefox 24; versions      //
// older than 23 do not support source maps.)                           //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var Deps = Package.deps.Deps;
var Random = Package.random.Random;
var DDP = Package.livedata.DDP;

/* Package-scope variables */
var Accounts, EXPIRE_TOKENS_INTERVAL_MS, CONNECTION_CLOSE_DELAY_MS, getTokenLifetimeMs, autoLoginEnabled, makeClientLoggedOut, makeClientLoggedIn, storeLoginToken, unstoreLoginToken, storedLoginToken, storedLoginTokenExpires;

(function () {

//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
// packages/accounts-base/accounts_common.js                                            //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////
                                                                                        //
Accounts = {};                                                                          // 1
                                                                                        // 2
// Currently this is read directly by packages like accounts-password                   // 3
// and accounts-ui-unstyled.                                                            // 4
Accounts._options = {};                                                                 // 5
                                                                                        // 6
// how long (in days) until a login token expires                                       // 7
var DEFAULT_LOGIN_EXPIRATION_DAYS = 90;                                                 // 8
// Clients don't try to auto-login with a token that is going to expire within          // 9
// .1 * DEFAULT_LOGIN_EXPIRATION_DAYS, capped at MIN_TOKEN_LIFETIME_CAP_SECS.           // 10
// Tries to avoid abrupt disconnects from expiring tokens.                              // 11
var MIN_TOKEN_LIFETIME_CAP_SECS = 3600; // one hour                                     // 12
// how often (in milliseconds) we check for expired tokens                              // 13
EXPIRE_TOKENS_INTERVAL_MS = 600 * 1000; // 10 minutes                                   // 14
// how long we wait before logging out clients when Meteor.logoutOtherClients is        // 15
// called                                                                               // 16
CONNECTION_CLOSE_DELAY_MS = 10 * 1000;                                                  // 17
                                                                                        // 18
// Set up config for the accounts system. Call this on both the client                  // 19
// and the server.                                                                      // 20
//                                                                                      // 21
// XXX we should add some enforcement that this is called on both the                   // 22
// client and the server. Otherwise, a user can                                         // 23
// 'forbidClientAccountCreation' only on the client and while it looks                  // 24
// like their app is secure, the server will still accept createUser                    // 25
// calls. https://github.com/meteor/meteor/issues/828                                   // 26
//                                                                                      // 27
// @param options {Object} an object with fields:                                       // 28
// - sendVerificationEmail {Boolean}                                                    // 29
//     Send email address verification emails to new users created from                 // 30
//     client signups.                                                                  // 31
// - forbidClientAccountCreation {Boolean}                                              // 32
//     Do not allow clients to create accounts directly.                                // 33
// - restrictCreationByEmailDomain {Function or String}                                 // 34
//     Require created users to have an email matching the function or                  // 35
//     having the string as domain.                                                     // 36
// - loginExpirationInDays {Number}                                                     // 37
//     Number of days since login until a user is logged out (login token               // 38
//     expires).                                                                        // 39
//                                                                                      // 40
Accounts.config = function(options) {                                                   // 41
  // We don't want users to accidentally only call Accounts.config on the               // 42
  // client, where some of the options will have partial effects (eg removing           // 43
  // the "create account" button from accounts-ui if forbidClientAccountCreation        // 44
  // is set, or redirecting Google login to a specific-domain page) without             // 45
  // having their full effects.                                                         // 46
  if (Meteor.isServer) {                                                                // 47
    __meteor_runtime_config__.accountsConfigCalled = true;                              // 48
  } else if (!__meteor_runtime_config__.accountsConfigCalled) {                         // 49
    // XXX would be nice to "crash" the client and replace the UI with an error         // 50
    // message, but there's no trivial way to do this.                                  // 51
    Meteor._debug("Accounts.config was called on the client but not on the " +          // 52
                  "server; some configuration options may not take effect.");           // 53
  }                                                                                     // 54
                                                                                        // 55
  // validate option keys                                                               // 56
  var VALID_KEYS = ["sendVerificationEmail", "forbidClientAccountCreation",             // 57
                    "restrictCreationByEmailDomain", "loginExpirationInDays"];          // 58
  _.each(_.keys(options), function (key) {                                              // 59
    if (!_.contains(VALID_KEYS, key)) {                                                 // 60
      throw new Error("Accounts.config: Invalid key: " + key);                          // 61
    }                                                                                   // 62
  });                                                                                   // 63
                                                                                        // 64
  // set values in Accounts._options                                                    // 65
  _.each(VALID_KEYS, function (key) {                                                   // 66
    if (key in options) {                                                               // 67
      if (key in Accounts._options) {                                                   // 68
        throw new Error("Can't set `" + key + "` more than once");                      // 69
      } else {                                                                          // 70
        Accounts._options[key] = options[key];                                          // 71
      }                                                                                 // 72
    }                                                                                   // 73
  });                                                                                   // 74
                                                                                        // 75
  // If the user set loginExpirationInDays to null, then we need to clear the           // 76
  // timer that periodically expires tokens.                                            // 77
  if (Meteor.isServer)                                                                  // 78
    maybeStopExpireTokensInterval();                                                    // 79
};                                                                                      // 80
                                                                                        // 81
if (Meteor.isClient) {                                                                  // 82
  // The connection used by the Accounts system. This is the connection                 // 83
  // that will get logged in by Meteor.login(), and this is the                         // 84
  // connection whose login state will be reflected by Meteor.userId().                 // 85
  //                                                                                    // 86
  // It would be much preferable for this to be in accounts_client.js,                  // 87
  // but it has to be here because it's needed to create the                            // 88
  // Meteor.users collection.                                                           // 89
  Accounts.connection = Meteor.connection;                                              // 90
                                                                                        // 91
  if (typeof __meteor_runtime_config__ !== "undefined" &&                               // 92
      __meteor_runtime_config__.ACCOUNTS_CONNECTION_URL) {                              // 93
    // Temporary, internal hook to allow the server to point the client                 // 94
    // to a different authentication server. This is for a very                         // 95
    // particular use case that comes up when implementing a oauth                      // 96
    // server. Unsupported and may go away at any point in time.                        // 97
    //                                                                                  // 98
    // We will eventually provide a general way to use account-base                     // 99
    // against any DDP connection, not just one special one.                            // 100
    Accounts.connection = DDP.connect(                                                  // 101
      __meteor_runtime_config__.ACCOUNTS_CONNECTION_URL)                                // 102
  }                                                                                     // 103
}                                                                                       // 104
                                                                                        // 105
// Users table. Don't use the normal autopublish, since we want to hide                 // 106
// some fields. Code to autopublish this is in accounts_server.js.                      // 107
// XXX Allow users to configure this collection name.                                   // 108
//                                                                                      // 109
Meteor.users = new Meteor.Collection("users", {                                         // 110
  _preventAutopublish: true,                                                            // 111
  connection: Meteor.isClient ? Accounts.connection : Meteor.connection                 // 112
});                                                                                     // 113
// There is an allow call in accounts_server that restricts this                        // 114
// collection.                                                                          // 115
                                                                                        // 116
// loginServiceConfiguration and ConfigError are maintained for backwards compatibility // 117
Meteor.startup(function () {                                                            // 118
  var ServiceConfiguration =                                                            // 119
    Package['service-configuration'].ServiceConfiguration;                              // 120
  Accounts.loginServiceConfiguration = ServiceConfiguration.configurations;             // 121
  Accounts.ConfigError = ServiceConfiguration.ConfigError;                              // 122
});                                                                                     // 123
                                                                                        // 124
// Thrown when the user cancels the login process (eg, closes an oauth                  // 125
// popup, declines retina scan, etc)                                                    // 126
Accounts.LoginCancelledError = function(description) {                                  // 127
  this.message = description;                                                           // 128
};                                                                                      // 129
                                                                                        // 130
// This is used to transmit specific subclass errors over the wire. We should           // 131
// come up with a more generic way to do this (eg, with some sort of symbolic           // 132
// error code rather than a number).                                                    // 133
Accounts.LoginCancelledError.numericError = 0x8acdc2f;                                  // 134
Accounts.LoginCancelledError.prototype = new Error();                                   // 135
Accounts.LoginCancelledError.prototype.name = 'Accounts.LoginCancelledError';           // 136
                                                                                        // 137
getTokenLifetimeMs = function () {                                                      // 138
  return (Accounts._options.loginExpirationInDays ||                                    // 139
          DEFAULT_LOGIN_EXPIRATION_DAYS) * 24 * 60 * 60 * 1000;                         // 140
};                                                                                      // 141
                                                                                        // 142
Accounts._tokenExpiration = function (when) {                                           // 143
  // We pass when through the Date constructor for backwards compatibility;             // 144
  // `when` used to be a number.                                                        // 145
  return new Date((new Date(when)).getTime() + getTokenLifetimeMs());                   // 146
};                                                                                      // 147
                                                                                        // 148
Accounts._tokenExpiresSoon = function (when) {                                          // 149
  var minLifetimeMs = .1 * getTokenLifetimeMs();                                        // 150
  var minLifetimeCapMs = MIN_TOKEN_LIFETIME_CAP_SECS * 1000;                            // 151
  if (minLifetimeMs > minLifetimeCapMs)                                                 // 152
    minLifetimeMs = minLifetimeCapMs;                                                   // 153
  return new Date() > (new Date(when) - minLifetimeMs);                                 // 154
};                                                                                      // 155
                                                                                        // 156
//////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
// packages/accounts-base/url_client.js                                                 //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////
                                                                                        //
autoLoginEnabled = true;                                                                // 1
                                                                                        // 2
// reads a reset password token from the url's hash fragment, if it's                   // 3
// there. if so prevent automatically logging in since it could be                      // 4
// confusing to be logged in as user A while resetting password for                     // 5
// user B                                                                               // 6
//                                                                                      // 7
// reset password urls use hash fragments instead of url paths/query                    // 8
// strings so that the reset password token is not sent over the wire                   // 9
// on the http request                                                                  // 10
var match;                                                                              // 11
match = window.location.hash.match(/^\#\/reset-password\/(.*)$/);                       // 12
if (match) {                                                                            // 13
  autoLoginEnabled = false;                                                             // 14
  Accounts._resetPasswordToken = match[1];                                              // 15
  window.location.hash = '';                                                            // 16
}                                                                                       // 17
                                                                                        // 18
// reads a verify email token from the url's hash fragment, if                          // 19
// it's there.  also don't automatically log the user is, as for                        // 20
// reset password links.                                                                // 21
//                                                                                      // 22
// XXX we don't need to use hash fragments in this case, and having                     // 23
// the token appear in the url's path would allow us to use a custom                    // 24
// middleware instead of verifying the email on pageload, which                         // 25
// would be faster but less DDP-ish (and more specifically, any                         // 26
// non-web DDP app, such as an iOS client, would do something more                      // 27
// in line with the hash fragment approach)                                             // 28
match = window.location.hash.match(/^\#\/verify-email\/(.*)$/);                         // 29
if (match) {                                                                            // 30
  autoLoginEnabled = false;                                                             // 31
  Accounts._verifyEmailToken = match[1];                                                // 32
  window.location.hash = '';                                                            // 33
}                                                                                       // 34
                                                                                        // 35
// reads an account enrollment token from the url's hash fragment, if                   // 36
// it's there.  also don't automatically log the user is, as for                        // 37
// reset password links.                                                                // 38
match = window.location.hash.match(/^\#\/enroll-account\/(.*)$/);                       // 39
if (match) {                                                                            // 40
  autoLoginEnabled = false;                                                             // 41
  Accounts._enrollAccountToken = match[1];                                              // 42
  window.location.hash = '';                                                            // 43
}                                                                                       // 44
                                                                                        // 45
//////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
// packages/accounts-base/accounts_client.js                                            //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////
                                                                                        //
///                                                                                     // 1
/// CURRENT USER                                                                        // 2
///                                                                                     // 3
                                                                                        // 4
// This is reactive.                                                                    // 5
Meteor.userId = function () {                                                           // 6
  return Accounts.connection.userId();                                                  // 7
};                                                                                      // 8
                                                                                        // 9
var loggingIn = false;                                                                  // 10
var loggingInDeps = new Deps.Dependency;                                                // 11
// This is mostly just called within this file, but Meteor.loginWithPassword            // 12
// also uses it to make loggingIn() be true during the beginPasswordExchange            // 13
// method call too.                                                                     // 14
Accounts._setLoggingIn = function (x) {                                                 // 15
  if (loggingIn !== x) {                                                                // 16
    loggingIn = x;                                                                      // 17
    loggingInDeps.changed();                                                            // 18
  }                                                                                     // 19
};                                                                                      // 20
Meteor.loggingIn = function () {                                                        // 21
  loggingInDeps.depend();                                                               // 22
  return loggingIn;                                                                     // 23
};                                                                                      // 24
                                                                                        // 25
// This calls userId, which is reactive.                                                // 26
Meteor.user = function () {                                                             // 27
  var userId = Meteor.userId();                                                         // 28
  if (!userId)                                                                          // 29
    return null;                                                                        // 30
  return Meteor.users.findOne(userId);                                                  // 31
};                                                                                      // 32
                                                                                        // 33
///                                                                                     // 34
/// LOGIN METHODS                                                                       // 35
///                                                                                     // 36
                                                                                        // 37
// Call a login method on the server.                                                   // 38
//                                                                                      // 39
// A login method is a method which on success calls `this.setUserId(id)` and           // 40
// `Accounts._setLoginToken` on the server and returns an object with fields            // 41
// 'id' (containing the user id), 'token' (containing a resume token), and              // 42
// optionally `tokenExpires`.                                                           // 43
//                                                                                      // 44
// This function takes care of:                                                         // 45
//   - Updating the Meteor.loggingIn() reactive data source                             // 46
//   - Calling the method in 'wait' mode                                                // 47
//   - On success, saving the resume token to localStorage                              // 48
//   - On success, calling Accounts.connection.setUserId()                              // 49
//   - Setting up an onReconnect handler which logs in with                             // 50
//     the resume token                                                                 // 51
//                                                                                      // 52
// Options:                                                                             // 53
// - methodName: The method to call (default 'login')                                   // 54
// - methodArguments: The arguments for the method                                      // 55
// - validateResult: If provided, will be called with the result of the                 // 56
//                 method. If it throws, the client will not be logged in (and          // 57
//                 its error will be passed to the callback).                           // 58
// - userCallback: Will be called with no arguments once the user is fully              // 59
//                 logged in, or with the error on error.                               // 60
//                                                                                      // 61
Accounts.callLoginMethod = function (options) {                                         // 62
  options = _.extend({                                                                  // 63
    methodName: 'login',                                                                // 64
    methodArguments: [],                                                                // 65
    _suppressLoggingIn: false                                                           // 66
  }, options);                                                                          // 67
  // Set defaults for callback arguments to no-op functions; make sure we               // 68
  // override falsey values too.                                                        // 69
  _.each(['validateResult', 'userCallback'], function (f) {                             // 70
    if (!options[f])                                                                    // 71
      options[f] = function () {};                                                      // 72
  });                                                                                   // 73
  // make sure we only call the user's callback once.                                   // 74
  var onceUserCallback = _.once(options.userCallback);                                  // 75
                                                                                        // 76
  var reconnected = false;                                                              // 77
                                                                                        // 78
  // We want to set up onReconnect as soon as we get a result token back from           // 79
  // the server, without having to wait for subscriptions to rerun. This is             // 80
  // because if we disconnect and reconnect between getting the result and              // 81
  // getting the results of subscription rerun, we WILL NOT re-send this                // 82
  // method (because we never re-send methods whose results we've received)             // 83
  // but we WILL call loggedInAndDataReadyCallback at "reconnect quiesce"               // 84
  // time. This will lead to makeClientLoggedIn(result.id) even though we               // 85
  // haven't actually sent a login method!                                              // 86
  //                                                                                    // 87
  // But by making sure that we send this "resume" login in that case (and              // 88
  // calling makeClientLoggedOut if it fails), we'll end up with an accurate            // 89
  // client-side userId. (It's important that livedata_connection guarantees            // 90
  // that the "reconnect quiesce"-time call to loggedInAndDataReadyCallback             // 91
  // will occur before the callback from the resume login call.)                        // 92
  var onResultReceived = function (err, result) {                                       // 93
    if (err || !result || !result.token) {                                              // 94
      Accounts.connection.onReconnect = null;                                           // 95
    } else {                                                                            // 96
      Accounts.connection.onReconnect = function () {                                   // 97
        reconnected = true;                                                             // 98
        // If our token was updated in storage, use the latest one.                     // 99
        var storedToken = storedLoginToken();                                           // 100
        if (storedToken) {                                                              // 101
          result = {                                                                    // 102
            token: storedToken,                                                         // 103
            tokenExpires: storedLoginTokenExpires()                                     // 104
          };                                                                            // 105
        }                                                                               // 106
        if (! result.tokenExpires)                                                      // 107
          result.tokenExpires = Accounts._tokenExpiration(new Date());                  // 108
        if (Accounts._tokenExpiresSoon(result.tokenExpires)) {                          // 109
          makeClientLoggedOut();                                                        // 110
        } else {                                                                        // 111
          Accounts.callLoginMethod({                                                    // 112
            methodArguments: [{resume: result.token}],                                  // 113
            // Reconnect quiescence ensures that the user doesn't see an                // 114
            // intermediate state before the login method finishes. So we don't         // 115
            // need to show a logging-in animation.                                     // 116
            _suppressLoggingIn: true,                                                   // 117
            userCallback: function (error) {                                            // 118
              var storedTokenNow = storedLoginToken();                                  // 119
              if (error) {                                                              // 120
                // If we had a login error AND the current stored token is the          // 121
                // one that we tried to log in with, then declare ourselves             // 122
                // logged out. If there's a token in storage but it's not the           // 123
                // token that we tried to log in with, we don't know anything           // 124
                // about whether that token is valid or not, so do nothing. The         // 125
                // periodic localStorage poll will decide if we are logged in or        // 126
                // out with this token, if it hasn't already. Of course, even           // 127
                // with this check, another tab could insert a new valid token          // 128
                // immediately before we clear localStorage here, which would           // 129
                // lead to both tabs being logged out, but by checking the token        // 130
                // in storage right now we hope to make that unlikely to happen.        // 131
                //                                                                      // 132
                // If there is no token in storage right now, we don't have to          // 133
                // do anything; whatever code removed the token from storage was        // 134
                // responsible for calling `makeClientLoggedOut()`, or the              // 135
                // periodic localStorage poll will call `makeClientLoggedOut`           // 136
                // eventually if another tab wiped the token from storage.              // 137
                if (storedTokenNow && storedTokenNow === result.token) {                // 138
                  makeClientLoggedOut();                                                // 139
                }                                                                       // 140
              }                                                                         // 141
              // Possibly a weird callback to call, but better than nothing if          // 142
              // there is a reconnect between "login result received" and "data         // 143
              // ready".                                                                // 144
              onceUserCallback(error);                                                  // 145
            }});                                                                        // 146
        }                                                                               // 147
      };                                                                                // 148
    }                                                                                   // 149
  };                                                                                    // 150
                                                                                        // 151
  // This callback is called once the local cache of the current-user                   // 152
  // subscription (and all subscriptions, in fact) are guaranteed to be up to           // 153
  // date.                                                                              // 154
  var loggedInAndDataReadyCallback = function (error, result) {                         // 155
    // If the login method returns its result but the connection is lost                // 156
    // before the data is in the local cache, it'll set an onReconnect (see             // 157
    // above). The onReconnect will try to log in using the token, and *it*             // 158
    // will call userCallback via its own version of this                               // 159
    // loggedInAndDataReadyCallback. So we don't have to do anything here.              // 160
    if (reconnected)                                                                    // 161
      return;                                                                           // 162
                                                                                        // 163
    // Note that we need to call this even if _suppressLoggingIn is true,               // 164
    // because it could be matching a _setLoggingIn(true) from a                        // 165
    // half-completed pre-reconnect login method.                                       // 166
    Accounts._setLoggingIn(false);                                                      // 167
    if (error || !result) {                                                             // 168
      error = error || new Error(                                                       // 169
        "No result from call to " + options.methodName);                                // 170
      onceUserCallback(error);                                                          // 171
      return;                                                                           // 172
    }                                                                                   // 173
    try {                                                                               // 174
      options.validateResult(result);                                                   // 175
    } catch (e) {                                                                       // 176
      onceUserCallback(e);                                                              // 177
      return;                                                                           // 178
    }                                                                                   // 179
                                                                                        // 180
    // Make the client logged in. (The user data should already be loaded!)             // 181
    makeClientLoggedIn(result.id, result.token, result.tokenExpires);                   // 182
    onceUserCallback();                                                                 // 183
  };                                                                                    // 184
                                                                                        // 185
  if (!options._suppressLoggingIn)                                                      // 186
    Accounts._setLoggingIn(true);                                                       // 187
  Accounts.connection.apply(                                                            // 188
    options.methodName,                                                                 // 189
    options.methodArguments,                                                            // 190
    {wait: true, onResultReceived: onResultReceived},                                   // 191
    loggedInAndDataReadyCallback);                                                      // 192
};                                                                                      // 193
                                                                                        // 194
makeClientLoggedOut = function() {                                                      // 195
  unstoreLoginToken();                                                                  // 196
  Accounts.connection.setUserId(null);                                                  // 197
  Accounts.connection.onReconnect = null;                                               // 198
};                                                                                      // 199
                                                                                        // 200
makeClientLoggedIn = function(userId, token, tokenExpires) {                            // 201
  storeLoginToken(userId, token, tokenExpires);                                         // 202
  Accounts.connection.setUserId(userId);                                                // 203
};                                                                                      // 204
                                                                                        // 205
Meteor.logout = function (callback) {                                                   // 206
  Accounts.connection.apply('logout', [], {wait: true}, function(error, result) {       // 207
    if (error) {                                                                        // 208
      callback && callback(error);                                                      // 209
    } else {                                                                            // 210
      makeClientLoggedOut();                                                            // 211
      callback && callback();                                                           // 212
    }                                                                                   // 213
  });                                                                                   // 214
};                                                                                      // 215
                                                                                        // 216
Meteor.logoutOtherClients = function (callback) {                                       // 217
  // Call the `logoutOtherClients` method. Store the login token that we get            // 218
  // back and use it to log in again. The server is not supposed to close               // 219
  // connections on the old token for 10 seconds, so we should have time to             // 220
  // store our new token and log in with it before being disconnected. If we get        // 221
  // disconnected, then we'll immediately reconnect with the new token. If for          // 222
  // some reason we get disconnected before storing the new token, then the             // 223
  // worst that will happen is that we'll have a flicker from trying to log in          // 224
  // with the old token before storing and logging in with the new one.                 // 225
  Accounts.connection.apply('logoutOtherClients', [], { wait: true },                   // 226
               function (error, result) {                                               // 227
                 if (error) {                                                           // 228
                   callback && callback(error);                                         // 229
                 } else {                                                               // 230
                   var userId = Meteor.userId();                                        // 231
                   storeLoginToken(userId, result.token, result.tokenExpires);          // 232
                   // If the server hasn't disconnected us yet by deleting our          // 233
                   // old token, then logging in now with the new valid token           // 234
                   // will prevent us from getting disconnected. If the server          // 235
                   // has already disconnected us due to our old invalid token,         // 236
                   // then we would have already tried and failed to login with         // 237
                   // the old token on reconnect, and we have to make sure a            // 238
                   // login method gets sent here with the new token.                   // 239
                   Meteor.loginWithToken(result.token, function (err) {                 // 240
                     if (err &&                                                         // 241
                         storedLoginToken() &&                                          // 242
                         storedLoginToken().token === result.token) {                   // 243
                       makeClientLoggedOut();                                           // 244
                     }                                                                  // 245
                     callback && callback(err);                                         // 246
                   });                                                                  // 247
                 }                                                                      // 248
               });                                                                      // 249
};                                                                                      // 250
                                                                                        // 251
                                                                                        // 252
///                                                                                     // 253
/// LOGIN SERVICES                                                                      // 254
///                                                                                     // 255
                                                                                        // 256
var loginServicesHandle =                                                               // 257
  Accounts.connection.subscribe("meteor.loginServiceConfiguration");                    // 258
                                                                                        // 259
// A reactive function returning whether the loginServiceConfiguration                  // 260
// subscription is ready. Used by accounts-ui to hide the login button                  // 261
// until we have all the configuration loaded                                           // 262
//                                                                                      // 263
Accounts.loginServicesConfigured = function () {                                        // 264
  return loginServicesHandle.ready();                                                   // 265
};                                                                                      // 266
                                                                                        // 267
///                                                                                     // 268
/// HANDLEBARS HELPERS                                                                  // 269
///                                                                                     // 270
                                                                                        // 271
// If our app has a UI, register the {{currentUser}} and {{loggingIn}}                  // 272
// global helpers.                                                                      // 273
if (Package.ui) {                                                                       // 274
  Package.ui.UI.registerHelper('currentUser', function () {                             // 275
    return Meteor.user();                                                               // 276
  });                                                                                   // 277
  Package.ui.UI.registerHelper('loggingIn', function () {                               // 278
    return Meteor.loggingIn();                                                          // 279
  });                                                                                   // 280
}                                                                                       // 281
                                                                                        // 282
//////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
// packages/accounts-base/localstorage_token.js                                         //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////
                                                                                        //
// This file deals with storing a login token and user id in the                        // 1
// browser's localStorage facility. It polls local storage every few                    // 2
// seconds to synchronize login state between multiple tabs in the same                 // 3
// browser.                                                                             // 4
                                                                                        // 5
var lastLoginTokenWhenPolled;                                                           // 6
                                                                                        // 7
// Login with a Meteor access token. This is the only public function                   // 8
// here.                                                                                // 9
Meteor.loginWithToken = function (token, callback) {                                    // 10
  Accounts.callLoginMethod({                                                            // 11
    methodArguments: [{resume: token}],                                                 // 12
    userCallback: callback});                                                           // 13
};                                                                                      // 14
                                                                                        // 15
// Semi-internal API. Call this function to re-enable auto login after                  // 16
// if it was disabled at startup.                                                       // 17
Accounts._enableAutoLogin = function () {                                               // 18
  autoLoginEnabled = true;                                                              // 19
  pollStoredLoginToken();                                                               // 20
};                                                                                      // 21
                                                                                        // 22
                                                                                        // 23
///                                                                                     // 24
/// STORING                                                                             // 25
///                                                                                     // 26
                                                                                        // 27
// Key names to use in localStorage                                                     // 28
var loginTokenKey = "Meteor.loginToken";                                                // 29
var loginTokenExpiresKey = "Meteor.loginTokenExpires";                                  // 30
var userIdKey = "Meteor.userId";                                                        // 31
                                                                                        // 32
// Call this from the top level of the test file for any test that does                 // 33
// logging in and out, to protect multiple tabs running the same tests                  // 34
// simultaneously from interfering with each others' localStorage.                      // 35
Accounts._isolateLoginTokenForTest = function () {                                      // 36
  loginTokenKey = loginTokenKey + Random.id();                                          // 37
  userIdKey = userIdKey + Random.id();                                                  // 38
};                                                                                      // 39
                                                                                        // 40
storeLoginToken = function(userId, token, tokenExpires) {                               // 41
  Meteor._localStorage.setItem(userIdKey, userId);                                      // 42
  Meteor._localStorage.setItem(loginTokenKey, token);                                   // 43
  if (! tokenExpires)                                                                   // 44
    tokenExpires = Accounts._tokenExpiration(new Date());                               // 45
  Meteor._localStorage.setItem(loginTokenExpiresKey, tokenExpires);                     // 46
                                                                                        // 47
  // to ensure that the localstorage poller doesn't end up trying to                    // 48
  // connect a second time                                                              // 49
  lastLoginTokenWhenPolled = token;                                                     // 50
};                                                                                      // 51
                                                                                        // 52
unstoreLoginToken = function() {                                                        // 53
  Meteor._localStorage.removeItem(userIdKey);                                           // 54
  Meteor._localStorage.removeItem(loginTokenKey);                                       // 55
  Meteor._localStorage.removeItem(loginTokenExpiresKey);                                // 56
                                                                                        // 57
  // to ensure that the localstorage poller doesn't end up trying to                    // 58
  // connect a second time                                                              // 59
  lastLoginTokenWhenPolled = null;                                                      // 60
};                                                                                      // 61
                                                                                        // 62
// This is private, but it is exported for now because it is used by a                  // 63
// test in accounts-password.                                                           // 64
//                                                                                      // 65
storedLoginToken = Accounts._storedLoginToken = function() {                            // 66
  return Meteor._localStorage.getItem(loginTokenKey);                                   // 67
};                                                                                      // 68
                                                                                        // 69
storedLoginTokenExpires = function () {                                                 // 70
  return Meteor._localStorage.getItem(loginTokenExpiresKey);                            // 71
};                                                                                      // 72
                                                                                        // 73
var storedUserId = function() {                                                         // 74
  return Meteor._localStorage.getItem(userIdKey);                                       // 75
};                                                                                      // 76
                                                                                        // 77
var unstoreLoginTokenIfExpiresSoon = function () {                                      // 78
  var tokenExpires = Meteor._localStorage.getItem(loginTokenExpiresKey);                // 79
  if (tokenExpires && Accounts._tokenExpiresSoon(new Date(tokenExpires)))               // 80
    unstoreLoginToken();                                                                // 81
};                                                                                      // 82
                                                                                        // 83
///                                                                                     // 84
/// AUTO-LOGIN                                                                          // 85
///                                                                                     // 86
                                                                                        // 87
if (autoLoginEnabled) {                                                                 // 88
  // Immediately try to log in via local storage, so that any DDP                       // 89
  // messages are sent after we have established our user account                       // 90
  unstoreLoginTokenIfExpiresSoon();                                                     // 91
  var token = storedLoginToken();                                                       // 92
  if (token) {                                                                          // 93
    // On startup, optimistically present us as logged in while the                     // 94
    // request is in flight. This reduces page flicker on startup.                      // 95
    var userId = storedUserId();                                                        // 96
    userId && Accounts.connection.setUserId(userId);                                    // 97
    Meteor.loginWithToken(token, function (err) {                                       // 98
      if (err) {                                                                        // 99
        Meteor._debug("Error logging in with token: " + err);                           // 100
        makeClientLoggedOut();                                                          // 101
      }                                                                                 // 102
    });                                                                                 // 103
  }                                                                                     // 104
}                                                                                       // 105
                                                                                        // 106
// Poll local storage every 3 seconds to login if someone logged in in                  // 107
// another tab                                                                          // 108
lastLoginTokenWhenPolled = token;                                                       // 109
var pollStoredLoginToken = function() {                                                 // 110
  if (! autoLoginEnabled)                                                               // 111
    return;                                                                             // 112
                                                                                        // 113
  var currentLoginToken = storedLoginToken();                                           // 114
                                                                                        // 115
  // != instead of !== just to make sure undefined and null are treated the same        // 116
  if (lastLoginTokenWhenPolled != currentLoginToken) {                                  // 117
    if (currentLoginToken) {                                                            // 118
      Meteor.loginWithToken(currentLoginToken, function (err) {                         // 119
        if (err)                                                                        // 120
          makeClientLoggedOut();                                                        // 121
      });                                                                               // 122
    } else {                                                                            // 123
      Meteor.logout();                                                                  // 124
    }                                                                                   // 125
  }                                                                                     // 126
  lastLoginTokenWhenPolled = currentLoginToken;                                         // 127
};                                                                                      // 128
                                                                                        // 129
setInterval(pollStoredLoginToken, 3000);                                                // 130
                                                                                        // 131
//////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['accounts-base'] = {
  Accounts: Accounts
};

})();

//# sourceMappingURL=d26a434cc8a43bee70694939d167a79e67694f71.map

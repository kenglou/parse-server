'use strict';

var _AdapterLoader = require('../AdapterLoader');

var _AdapterLoader2 = _interopRequireDefault(_AdapterLoader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const facebook = require('./facebook');
const instagram = require("./instagram");
const linkedin = require("./linkedin");
const meetup = require("./meetup");
const google = require("./google");
const gcenter = require("./gcenter");
const gpgames = require("./gpgames");
const github = require("./github");
const twitter = require("./twitter");
const spotify = require("./spotify");
const digits = require("./twitter"); // digits tokens are validated by twitter
const janrainengage = require("./janrainengage");
const janraincapture = require("./janraincapture");
const vkontakte = require("./vkontakte");
const qq = require("./qq");
const wechat = require("./wechat");
const weibo = require("./weibo");
const xiaomi = require("./xiaomi");
const anonymous = {
  validateAuthData: () => {
    return Promise.resolve();
  },
  validateAppId: () => {
    return Promise.resolve();
  }
};

const providers = {
  facebook,
  instagram,
  linkedin,
  meetup,
  google,
  gcenter,
  gpgames,
  github,
  twitter,
  spotify,
  anonymous,
  digits,
  janrainengage,
  janraincapture,
  vkontakte,
  qq,
  wechat,
  weibo,
  xiaomi
};

function authDataValidator(adapter, appIds, options)
{
  return function (authData)
  {
    return adapter.validateAuthData(authData, options).then(() =>
    {
      if (appIds)
      {
        return adapter.validateAppId(appIds, authData, options);
      }
      return Promise.resolve();
    });
  };
}

function loadAuthAdapter(provider, authOptions) {
  const defaultAdapter = providers[provider];
  const adapter = Object.assign({}, defaultAdapter);
  const providerOptions = authOptions[provider];

  if (!defaultAdapter && !providerOptions)
    return;

  const appIds = providerOptions ? providerOptions.appIds : undefined;

  // Try the configuration methods
  if (providerOptions) {
    const optionalAdapter = (0, _AdapterLoader2.default)(providerOptions, undefined, providerOptions);
    if (optionalAdapter) {
      ['validateAuthData', 'validateAppId'].forEach(key => {
        if (optionalAdapter[key]) {
          adapter[key] = optionalAdapter[key];
        }
      });
    }
  }

  if (!adapter.validateAuthData || !adapter.validateAppId) {
    return;
  }

  return { adapter, appIds, providerOptions };
}

module.exports = function (authOptions = {}, enableAnonymousUsers = true)
{
  let _enableAnonymousUsers = enableAnonymousUsers;
  const setEnableAnonymousUsers = function (enable)
  {
    _enableAnonymousUsers = enable;
  };
  // To handle the test cases on configuration
  const getValidatorForProvider = function (provider)
  {
    if (provider === 'anonymous' && !_enableAnonymousUsers)
      return;

    if(!providers.hasOwnProperty(provider) &&
        provider !== 'myoauth' &&
        provider !== 'customAuthentication' &&
        provider !== 'shortLivedAuth')
      return;

    const {
      adapter,
      appIds,
      providerOptions
    } = loadAuthAdapter(provider, authOptions);

    return authDataValidator(adapter, appIds, providerOptions);
  };

  return Object.freeze({
    getValidatorForProvider,
    setEnableAnonymousUsers
  });
};

module.exports.loadAuthAdapter = loadAuthAdapter;

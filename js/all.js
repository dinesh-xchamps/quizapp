
/*
  Copyright (c) 2017, Dealance, Inc. All rights reserved.

  Shared module between server and client that defines the REST API
  root and version information.
 */
'use strict';
angular.module("qz.REST", ['ngResource']);


/*
  Copyright (c) 2016, Deal, Inc. All rights reserved.

  Shared module between server and client that defines the REST API
  root and version information.
 */
var API_VERSION, REST_ROOT, SERVER_ROOT, authUrlRoot, factory, ngModule, restfulMethods, unauthUrlRoot, urlRoot;

SERVER_ROOT = "https://www.infasta.com.au/rest2/";

REST_ROOT = "index.php";

API_VERSION = "1.0";

urlRoot = "" + SERVER_ROOT + REST_ROOT + "/" + API_VERSION;

authUrlRoot = "" + SERVER_ROOT + REST_ROOT + "/" + API_VERSION + "/auth";

unauthUrlRoot = "" + SERVER_ROOT + REST_ROOT + "/" + API_VERSION + "/unauth";

restfulMethods = {
  query: {
    method: 'GET',
    isArray: true
  },
  get: {
    method: 'GET'
  },
  save: {
    method: 'POST'
  },
  create: {
    method: 'POST'
  },
  generateOtp: {
    method: 'POST'
  },
  remove: {
    method: 'DELETE'
  },
  'delete': {
    method: 'DELETE'
  },
  login: {
    url: urlRoot + "/unauth/login",
    method: 'POST',
    ignoreAuthModule: true
  },
  sessionInfo: {
    method: 'GET'
  },
  logout: {
    url: urlRoot + "/auth/logout",
    method: 'POST',
    ignoreAuthModule: true
  }
};

factory = function() {
  return {
    urlRoot: urlRoot,
    authUrlRoot: authUrlRoot,
    unauthUrlRoot: unauthUrlRoot,
    version: API_VERSION,
    restfulMethods: restfulMethods
  };
};

ngModule = angular.module("qz.REST");

ngModule.factory('RestApi', [factory]);

var DEPENDENCIES, factory, ngModule, theSingleton;

DEPENDENCIES = ["$q", "$log", "$http", "$rootScope", "ServerApi", "Const"];

theSingleton = null;

factory = function($q, $log, $http, $rootScope, ServerApi, Const) {
  var App, User, objectFactory, sessionInfo;
  User = ServerApi.User;
  sessionInfo = ServerApi.sessionInfo;
  objectFactory = ServerApi.objectFactory;
  App = (function() {
    function App() {
      this.queryCache = {};
    }

    App.prototype.getInstance = function(classId, instanceId) {
      return objectFactory.getInstance(classId, instanceId);
    };

    App.prototype.login = function(userData) {
      var user;
      user = new User(null);
      user.props.email = userData.email;
      user.props.username = userData.username;
      return user.qLogin();
    };

    App.prototype.logout = function() {
      var q, user;
      user = new User(null);
      q = $q.defer();
      user.qLogOut().then(function(success) {
        delete sessionInfo.user;
        delete sessionInfo.sessionId;
        sessionInfo.loggedIn = false;
        $rootScope.$broadcast(Const.LOGOUT_EVENT);
        return q.resolve("LogOutSuccessFully");
      })["catch"](function(error) {
        return q.reject(error);
      });
      return q.promise;
    };

    App.prototype.getSessionInfo = function() {
      var error, success;
      success = (function(_this) {
        return function(svrResults) {
          if (svrResults.errorCode && svrResults.errorCode === ERROR) {
            error(svrResults.msg);
            return;
          }
          sessionInfo.user = new User(svrResults.sessionInfo.instanceId, svrResults.sessionInfo);
          sessionInfo.sessionId = svrResults.sessionInfo.instanceId || null;
          sessionInfo.loggedIn = true;
          return $rootScope.$broadcast(Const.LOGIN_SUCCESS, sessionInfo);
        };
      })(this);
      error = function(err) {
        return sessionInfo.error = err;
      };
      this.checkSessionInfo().then(success, error);
      return sessionInfo;
    };

    App.prototype.checkSessionInfo = function() {
      var user;
      user = new User(null);
      return user.checkSessionInfo();
    };

    return App;

  })();
  if (!theSingleton) {
    theSingleton = new App();
  }
  return theSingleton;
};

ngModule = this.angular.module("qz.REST");

DEPENDENCIES.push(factory);

ngModule.factory('Rest.App', DEPENDENCIES);


/*
  Copyright (c) 2017, Deal, Inc. All rights reserved.

  A simple service to access constant values in the system.
 */
var CONSTANTS, DEPENDENCIES, factory, ngModule;

CONSTANTS = {
  OK: "OK",
  ERROR: "ERROR",
  LOGIN_SUCCESS: "login-success"
};

DEPENDENCIES = [];

factory = function() {
  return CONSTANTS;
};

DEPENDENCIES.push(factory);

ngModule = this.angular.module("qz.Const", []);

ngModule.factory('Const', DEPENDENCIES);

var DEPENDENCIES, factory, ngModule, noop,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

noop = function() {};

DEPENDENCIES = ['Rest.RestBase', 'RestApi'];

factory = function(RestBaseSvc, RestApi) {
  var Devices, RestBase;
  RestBase = RestBaseSvc.RestBase;
  Devices = (function(superClass) {
    extend(Devices, superClass);

    function Devices(id, props) {
      Devices.__super__.constructor.call(this, "Devices", id, props);
    }

    Devices.prototype.url = function() {
      return RestApi.authUrlRoot + "/User/" + this.instanceId + "/" + this.classId;
    };

    Devices.prototype.createUrl = function() {
      return RestApi.authUrlRoot + "/User/" + this.instanceId + "/" + this.classId + "/:subclass1/:subclass2";
    };

    Devices.prototype.updateDeviseAccess = function() {
      var paramDefaults;
      paramDefaults = {
        'subclass1': this.props.deviseId
      };
      return this.create(this.createUrl(), paramDefaults, this.props);
    };

    Devices.prototype.noOfDvsUserAccess = function() {
      var paramDefaults;
      paramDefaults = {};
      return this.load(this.url(), paramDefaults);
    };

    Devices.prototype.devicesInfo = function() {
      var paramDefaults;
      paramDefaults = {
        'subclass1': this.props.deviseId,
        'subclass2': 'Info'
      };
      return this.load(this.createUrl(), paramDefaults);
    };

    Devices.prototype.devicesQuestions = function() {
      var paramDefaults;
      paramDefaults = {
        'subclass1': this.props.deviseId,
        'subclass2': 'Questions'
      };
      return this.load(this.createUrl(), paramDefaults);
    };

    Devices.prototype.diviceUserAccess = function() {
      var paramDefaults;
      paramDefaults = {
        'subclass1': this.props.deviseId,
        'subclass2': 'AccessCount'
      };
      return this.load(this.createUrl(), paramDefaults);
    };

    return Devices;

  })(RestBase);
  return {
    Devices: Devices
  };
};

ngModule = this.angular.module("qz.REST");

DEPENDENCIES.push(factory);

ngModule.factory('Rest.Devices', DEPENDENCIES);

'use strict';
var DEPENDENCIES, ERROR, OK, angular, factory, ngModule;

angular = this.angular;

OK = "OK";

ERROR = "ERROR";

DEPENDENCIES = ["Rest.User", "Rest.Cache", "Rest.Util", "Rest.Devices"];

factory = function(UserSvc, CacheSvc, utilSvc, DevicesSvc) {
  var Cache, Devices, ObjectFactory, User, Utilities, objectFactory;
  User = UserSvc.User;
  Cache = CacheSvc.Cache;
  Utilities = utilSvc.Utilities;
  Devices = DevicesSvc.Devices;
  ObjectFactory = (function() {
    function ObjectFactory() {}

    ObjectFactory.prototype.create = function(classId, instanceId, props) {
      switch (classId) {
        case "User":
          return new User(instanceId, props);
        case "Utilities":
          return new Utilities(instanceId, props);
        case "Devices":
          return new Devices(instanceId, props);
      }
      throw "Unknown object type";
    };

    ObjectFactory.prototype.getInstance = function(classId, instanceId) {
      var obj;
      obj = Cache.find(classId, instanceId);
      if (!obj) {
        obj = this.create(classId, instanceId);
        Cache.insert(obj);
      }
      return obj;
    };

    return ObjectFactory;

  })();
  objectFactory = new ObjectFactory();
  return {
    objectFactory: objectFactory
  };
};

ngModule = angular.module("qz.REST");

DEPENDENCIES.push(factory);

ngModule.factory('Rest.ObjectFactory', DEPENDENCIES);

var DEPENDENCIES, app, factory;

DEPENDENCIES = ["$rootScope", "Rest.App", "Rest.Util"];

factory = function($rootScope, RestAppSvc, RestUtilSvc) {
  var PageContext;
  PageContext = (function() {
    var bootStrap, start;

    function PageContext() {
      var init, reinit;
      init = reinit = (function(_this) {
        return function() {
          _this.user = null;
          return _this.devices = null;
        };
      })(this);
      init();
      $rootScope.pageContext = this;
      $rootScope.pageContext.loaded = true;
    }

    bootStrap = function() {};

    start = function() {
      var self;
      self = this;
      return bootStrap();
    };

    start();

    return PageContext;

  })();
  return new PageContext();
};

app = angular.module('qzcloud', []);

DEPENDENCIES.push(factory);

app.factory('qzcloud.PageContext', DEPENDENCIES);

var DEPENDENCIES, DISABLED, factory, ngModule, noop;

noop = function() {};

DEPENDENCIES = ["$log", "$rootScope", "Const"];

DISABLED = false;

factory = function($log, $rootScope, Const) {
  var Cache;
  Cache = (function() {
    var clearCache, lookupTbl;

    function Cache() {}

    lookupTbl = {};

    Cache.find = function(classId, instanceId) {
      var cacheEntry;
      cacheEntry = lookupTbl[classId + "/" + instanceId];
      if (cacheEntry) {
        if (!cacheEntry.isDirty()) {
          return cacheEntry;
        } else {
          delete lookupTbl[classId + "/" + instanceId];
        }
      }
      return void 0;
    };

    Cache.insert = function(obj) {
      var key;
      if (DISABLED) {
        return;
      }
      key = obj.classId + "/" + obj.instanceId;
      return lookupTbl[key] = obj;
    };

    Cache.getNumObjects = function() {
      var count, k, v;
      count = 0;
      for (k in lookupTbl) {
        v = lookupTbl[k];
        count++;
      }
      return count;
    };

    Cache.showCache = function() {
      return lookupTbl;
    };

    clearCache = function() {
      var e, k, v;
      for (k in lookupTbl) {
        v = lookupTbl[k];
        try {
          v.destroy();
        } catch (error) {
          e = error;
          $log.warn("Destroy failed");
        }
      }
      return lookupTbl = {};
    };

    $rootScope.$on(Const.LOGOUT_EVENT, clearCache);

    $rootScope.$on(Const.LOGIN_SUCCESS, clearCache);

    $rootScope.$on(Const.SIGNUP_SUCCESS, clearCache);

    return Cache;

  })();
  return {
    Cache: Cache
  };
};

ngModule = this.angular.module("qz.REST");

DEPENDENCIES.push(factory);

ngModule.factory('Rest.Cache', DEPENDENCIES);

var DEPENDENCIES, factory, getTypeof, ngModule, noop;

noop = function() {};

DEPENDENCIES = ['$resource', '$http', '$log', "$q", "$timeout", 'RestApi'];

factory = function($resource, $http, $log, $q, $timeout, RestApi) {
  var API_VERSION, REST_ROOT, RestBase, restfulMethods;
  API_VERSION = RestApi.version;
  REST_ROOT = RestApi.urlRoot;
  restfulMethods = RestApi.restfulMethods;
  RestBase = (function() {
    function RestBase(classId, instanceId, props) {
      this.classId = classId;
      this.instanceId = instanceId;
      this.loaded = false;
      if (this.instanceId && props) {
        this.loaded = true;
      }
      this.loadPromises = [];
      this.props = props || {};
      this.status = {
        errorCode: void 0,
        msg: void 0,
        isBusy: false,
        errors: []
      };
    }

    RestBase.prototype.set = function(name, val) {
      return this.props[name] = val;
    };

    RestBase.prototype.setProps = function(oProps) {
      var k, results, v;
      results = [];
      for (k in oProps) {
        v = oProps[k];
        if (k !== "_id" && k !== "id") {
          results.push(this.set(k, v));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    RestBase.prototype.get = function(name) {
      return this.props[name];
    };

    RestBase.prototype.createUrl = function() {
      throw "Subclass must define createUrl method";
    };

    RestBase.prototype.create = function(url, paramDefaults, props) {
      var createResults, error, q, success;
      q = $q.defer();
      if (!url) {
        url = this.createUrl();
      }
      createResults = {
        isBusy: true
      };
      success = function(svrResults) {
        createResults.isBusy = false;
        if (svrResults.errorCode && svrResults.errorCode === OK) {
          return q.resolve(svrResults.msg);
        } else {
          createResults.errorCode = svrResults.errorCode || 'SYSTEMERROR';
          createResults.msg = svrResults.msg || 'System Encountered A error Please try again later';
          return q.reject(createResults);
        }
      };
      error = function(err) {
        console.log("rest error " + err);
        createResults.errorCode = err.statusText;
        createResults.errors = err.statusText;
        return q.reject(createResults);
      };
      $resource(url, paramDefaults, restfulMethods).create(this.props, success, error);
      return q.promise;
    };

    RestBase.prototype.load = function(url, paramDefaults) {
      var createResults, error, q, success;
      q = $q.defer();
      if (!url) {
        url = this.createUrl();
      }
      createResults = {
        isBusy: true
      };
      success = function(svrResults) {
        createResults.isBusy = false;
        if (svrResults.errorCode && svrResults.errorCode === OK) {
          return q.resolve(svrResults.msg);
        } else {
          createResults.errorCode = svrResults.errorCode || 'SYSTEMERROR';
          createResults.msg = svrResults.msg || 'System Encountered A error Please try again later';
          return q.reject(createResults);
        }
      };
      error = function(err) {
        createResults.errorCode = err.statusText;
        createResults.errors = err.statusText;
        return q.reject(createResults);
      };
      $resource(url, paramDefaults, restfulMethods).get(success, error);
      return q.promise;
    };

    RestBase.prototype["delete"] = function(url, paramDefaults) {
      var createResults, error, q, success;
      q = $q.defer();
      if (!url) {
        url = this.createUrl();
      }
      createResults = {
        isBusy: true
      };
      success = function(svrResults) {
        createResults.isBusy = false;
        if (svrResults.errorCode && svrResults.errorCode === OK) {
          return q.resolve(svrResults.msg);
        } else {
          createResults.errorCode = svrResults.errorCode || 'SYSTEMERROR';
          createResults.msg = svrResults.msg || 'System Encountered A error Please try again later';
          return q.reject(createResults);
        }
      };
      error = function(err) {
        createResults.errorCode = err.statusText;
        createResults.errors = err.statusText;
        return q.reject(createResults);
      };
      $resource(url, paramDefaults, restfulMethods).remove(success, error);
      return q.promise;
    };

    RestBase.prototype.setDirty = function() {
      return this.dirty = true;
    };

    RestBase.prototype.clearDirty = function() {
      return this.dirty = false;
    };

    RestBase.prototype.isDirty = function() {
      return this.dirty;
    };

    return RestBase;

  })();
  return {
    RestBase: RestBase
  };
};

ngModule = angular.module("qz.REST");

DEPENDENCIES.push(factory);

ngModule.factory('Rest.RestBase', DEPENDENCIES);

getTypeof = function(obj) {
  var classToType;
  if (obj === void 0 || obj === null) {
    return String(obj);
  }
  classToType = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regexp',
    '[object Object]': 'object'
  };
  return classToType[Object.prototype.toString.call(obj)];
};

'use strict';
var DEPENDENCIES, ERROR, OK, ServerApiFactory, factory, ngModule;

OK = "OK";

ERROR = "ERROR";

DEPENDENCIES = ["RestApi", "Rest.User", "Rest.ObjectFactory"];

ServerApiFactory = function(RestApi, UserSvc, ObjectFactorySvc) {
  var User, objectFactory;
  User = UserSvc.User;
  objectFactory = ObjectFactorySvc.objectFactory;
  return {
    objectFactory: objectFactory,
    User: User,
    sessionInfo: UserSvc.sessionInfo
  };
};

factory = ServerApiFactory;

ngModule = this.angular.module("qz.REST");

DEPENDENCIES.push(factory);

ngModule.factory('ServerApi', DEPENDENCIES);

var DEPENDENCIES, factory, ngModule, noop,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

noop = function() {};

DEPENDENCIES = ['$rootScope', '$q', '$http', '$log', '$timeout', '$resource', 'RestApi', 'Rest.RestBase', 'Const'];

factory = function($rootScope, $q, $http, $log, $timeout, $resource, RestApi, RestBaseSvc, Const) {
  var RestBase, User, sessionInfo;
  RestBase = RestBaseSvc.RestBase;
  sessionInfo = {
    sessionId: null,
    user: null,
    request: null
  };
  User = (function(superClass) {
    extend(User, superClass);

    function User(id, props) {
      User.__super__.constructor.call(this, "User", id, props);
    }

    User.prototype.url = function() {
      return RestApi.authUrlRoot + "/User/" + this.instanceId + "/:subclass";
    };

    User.prototype.createUrl = function() {
      return RestApi.authUrlRoot + "/User";
    };

    User.prototype.loginUrl = function() {
      return RestApi.unauthUrlRoot + "/login";
    };

    User.prototype.logOutUrl = function() {
      return RestApi.unauthUrlRoot + "/login";
    };

    User.prototype.sessioninfoUrl = function() {
      return RestApi.authUrlRoot + "/sessioninfo";
    };

    User.prototype.getUserScore = function() {
      var paramDefaults;
      paramDefaults = {
        'subclass': 'Score'
      };
      return this.load(this.url(), paramDefaults);
    };

    User.prototype.submitAnswer = function() {
      var paramDefaults;
      paramDefaults = {
        'subclass': 'SubmitAnswer'
      };
      return this.create(this.url(), paramDefaults, this.props);
    };

    User.prototype.qLogOut = function() {
      var fail, pass, q, signupResults;
      signupResults = {};
      q = $q.defer();
      fail = function(err) {
        signupResults.errorCode = err.statusText;
        signupResults.errors = err.statusText;
        return q.reject(signupResults);
      };
      pass = function(svrResults) {
        signupResults.errorCode = svrResults.errorCode;
        if (svrResults.errorCode && svrResults.errorCode !== OK) {
          signupResults.msg = svrResults.msg;
          q.reject(svrResults);
          return;
        }
        signupResults.errorCode = OK;
        signupResults.isBusy = false;
        signupResults.msg = svrResults.msg;
        return q.resolve(signupResults);
      };
      $resource(this.logOutUrl(), {}, restfulMethods).logout(this.props, pass, fail);
      return q.promise;
    };

    User.prototype.qLogin = function() {
      var fail, loginResults, pass, q, user;
      loginResults = {};
      q = $q.defer();
      user = this;
      fail = function(err) {
        switch (err && err.status) {
          case 401:
            loginResults.errorCode = "ERROR";
            loginResults.msg = {
              type: "Enter a unique email"
            };
            break;
          default:
            loginResults.errorCode = err.errorCode || "ERROR";
            loginResults.msg = {
              type: err.message || "Enter a unique email"
            };
        }
        return q.reject(loginResults);
      };
      pass = function(svrResults) {
        if (svrResults.errorCode && svrResults.errorCode === OK) {
          delete user.props.email;
          delete user.props.username;
          user.instanceId = svrResults.params.user.instanceId;
          user.setProps(svrResults.params.user);
          sessionInfo.user = user;
          sessionInfo.sessionId = svrResults.params.user.instanceId || null;
          sessionInfo.loggedIn = true;
          $rootScope.$broadcast(Const.LOGIN_SUCCESS, sessionInfo);
          loginResults.user = user;
          loginResults.sessionId = svrResults.params.sessionId;
          return q.resolve(loginResults);
        } else {
          loginResults.errorCode = svrResults.errorCode || 'SYSTEMERROR';
          loginResults.msg = svrResults.msg || 'System Encountered A error Please try again later';
          return q.reject(loginResults);
        }
      };
      $resource(this.loginUrl(), {}, restfulMethods).login(this.props, pass, fail);
      return q.promise;
    };

    User.prototype.checkSessionInfo = function() {
      var fail, pass, q;
      q = $q.defer();
      sessionInfo = {};
      fail = function(err) {
        sessionInfo.errorCode = err.statusText;
        sessionInfo.errors = err.statusText;
        return q.reject(sessionInfo);
      };
      pass = function(svrResults) {
        if (svrResults.errorCode && svrResults.errorCode !== 'OK') {
          q.reject(svrResults.msg);
        }
        return q.resolve(svrResults);
      };
      $resource(this.sessioninfoUrl(), {}, restfulMethods).sessionInfo(pass, fail);
      return q.promise;
    };

    return User;

  })(RestBase);
  return {
    User: User,
    sessionInfo: sessionInfo
  };
};

ngModule = this.angular.module("qz.REST");

DEPENDENCIES.push(factory);

ngModule.factory('Rest.User', DEPENDENCIES);

var DEPENDENCIES, factory, ngModule, noop,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

noop = function() {};

DEPENDENCIES = ['Rest.RestBase', 'RestApi', '$q', 'Rest.Cache'];

factory = function(RestBaseSvc, RestApi, $q, CacheSvc) {
  var RestBase, Utilities;
  RestBase = RestBaseSvc.RestBase;
  Utilities = (function(superClass) {
    var lookupTbl;

    extend(Utilities, superClass);

    function Utilities() {
      return Utilities.__super__.constructor.apply(this, arguments);
    }

    lookupTbl = {};

    Utilities.prototype.url = function() {
      return "" + RestApi.unauthUrlRoot;
    };

    Utilities.prototype.createUrl = function() {
      return RestApi.unauthUrlRoot + "/:subclass1/:subclass2";
    };

    return Utilities;

  })(RestBase);
  return new Utilities();
};

ngModule = this.angular.module("qz.REST");

DEPENDENCIES.push(factory);

ngModule.factory('Rest.Util', DEPENDENCIES);


/*
  Copyright (c) 2017, Dealance, Inc. All rights reserved.
 */
'use strict';
var $, $A, $G, jQuery, ngModule;

$G = this;

$A = this.angular;

$ = jQuery = this.jQuery;

ngModule = this.angular.module("qz.directives", []);


/*
  Copyright (c) 2017, Deal, Inc. All rights reserved.
 */
'use strict';
var $G, DEPENDENCIES, ERROR, OK, RestSvcCreator, angular, ngModule, noop;

$G = this;

angular = this.angular;

OK = "OK";

ERROR = "ERROR";

noop = function() {};

ngModule = angular.module("qz.REST");

DEPENDENCIES = ["Rest.App"];

RestSvcCreator = function(restApp) {
  return restApp;
};

DEPENDENCIES.push(RestSvcCreator);

ngModule.factory('RestSvc', DEPENDENCIES);


/*
  Copyright (c) 2018, Deal, Inc. All rights reserved.
 */
var GLOBAL_CONST, SvcCreator, module;

GLOBAL_CONST = this.jQuery;

SvcCreator = function() {
  return jQuery;
};

module = angular.module("qz.jQuery", []);

module.factory('jQuery', [SvcCreator]);


/*
  Copyright (c) 2017, Dealance, Inc. All rights reserved.
 */
'use strict';
var appDependencies, bbNgapp;

appDependencies = ['ngRoute', 'ngResource', 'ngCookies', 'ngMessages', 'ngAnimate', 'qz.REST', 'qz.Const', "qz.jQuery", 'qzcloud', 'qz.directives', 'http-auth-interceptor', 'ui.bootstrap'];

bbNgapp = angular.module('qzManager', appDependencies);


/*
Copyright (c) 2017, Deal, Inc. All rights reserved.
 */
'use strict';
var $, $A, $G, DEPS, app, jQuery, qzMgrAppCtrl;

$G = this;

$A = this.angular;

$ = jQuery = this.jQuery;

app = angular.module('qzManager');

DEPS = ["$q", "$scope", "authService", "RestSvc", "$location", "Const", "qzcloud.PageContext", "$rootScope", "$uibModal", "$interval"];

qzMgrAppCtrl = function($q, scope, authService, RestSvc, $location, Const, PageContextSvc, rootScope, uibModal, interval) {
  var checkSess, onLoginPage, onLoginSuccess;
  rootScope.title = 'loading';
  scope.sessionInfo = RestSvc.getSessionInfo();
  onLoginPage = null;
  scope.isActive = function(path) {
    return path === $location.path();
  };
  onLoginSuccess = function(sessionInfo) {
    if (!sessionInfo) {
      return;
    }
    authService.loginConfirmed();
    scope.sessionInfo = sessionInfo;
    scope.loggedIn = true;
    PageContextSvc.user = RestSvc.getInstance("User", sessionInfo.user.instanceId);
    PageContextSvc.devices = RestSvc.getInstance("Devices", sessionInfo.user.instanceId);
    if (onLoginPage === '/') {
      onLoginPage = "/instruction";
    }
    $location.path(onLoginPage || "/instruction");
    $location.search("");
    if (!scope.sessionInfo.user.instanceId) {
      return scope.sessionInfo = RestSvc.getSessionInfo();
    }
  };
  scope.$on(Const.LOGIN_SUCCESS, function($event, data) {
    return onLoginSuccess(data);
  });
  checkSess = function() {
    if (scope.sessionInfo.sessionId !== null && scope.sessionInfo) {
      return true;
    } else {
      return false;
    }
  };
  scope.$on('$routeChangeStart', function() {
    var pageId;
    pageId = $location.path();
    if (/\/signin/.test(pageId)) {
      scope.isLoginPage = true;
      if (checkSess()) {
        $location.path("/instruction");
      }
      return;
    }
    if (checkSess()) {
      if (pageId === '/') {
        $location.path("/instruction");
      }
      return;
    }
    onLoginPage = pageId;
    scope.isLoginPage = false;
    return scope.loading = true;
  });
  scope.logout = function() {
    onLoginPage = null;
    return RestSvc.logout().then(function(success) {
      scope.sessionInfo = '';
      scope.loggedIn = false;
      return $location.path("/");
    })["catch"](function(error) {});
  };
  scope.$on('logout', function($event, data) {
    return scope.logout();
  });
  scope.$on("$routeChangeSuccess", function(event, current, previous) {
    return scope.loading = false;
  });
  scope.$on('event:auth-loginRequired', function() {
    scope.loggedIn = false;
    switch ($location.path().split("/")[1]) {
      case 'instruction':
      case 'error':
        return $location.path("/");
    }
  });
  return scope.isLoggedIn = false;
};

DEPS.push(qzMgrAppCtrl);

app.controller("qzMgrAppCtrl", DEPS);


/*
  Copyright (c) 2018, Deal. All rights reserved.
 */
'use strict';
var $, $A, $G, app, deviceQuizFun, jQuery;

$G = this;

$A = this.angular;

$ = jQuery = this.jQuery;

app = angular.module('qzManager');

deviceQuizFun = function(scope, q, location, PageContextSvc, RestSvc, uibModal) {
  var clearProps, dealUId, devices, makeQuestions, makeRecords, refresh, showDialog, str, user;
  scope.pageLoading = true;
  scope.showError = false;
  scope.disableAnswer = false;
  devices = null;
  user = null;
  str = location.url();
  dealUId = str.split("/");
  scope.section = "one";
  makeRecords = function(dsList) {
    return dsList.forEach(function(ds) {
      scope.name = ds.name;
      scope.info = ds.info;
      return scope.clue = ds.clue;
    });
  };
  makeQuestions = function(dsList) {
    var i, records;
    records = [];
    i = 0;
    dsList.forEach(function(ds) {
      records.push({
        id: ds.id,
        question: ds.question,
        options: ds.options,
        'answered': i === 0 ? 'true' : 'false',
        'givedAnswer': ''
      });
      return i++;
    });
    return records;
  };
  refresh = function() {
    var promises;
    devices.props.deviseId = dealUId[2];
    promises = {
      devices: devices.noOfDvsUserAccess(),
      devicesAccess: devices.diviceUserAccess(),
      userScore: user.getUserScore(),
      devicesInfo: devices.devicesInfo(),
      devicesQuestions: devices.devicesQuestions()
    };
    return q.all(promises).then(function(results) {
      scope.devicesCount = results.devices;
      scope.accessCount = parseInt(results.devicesAccess);
      scope.userScore = results.userScore;
      makeRecords(results.devicesInfo);
      scope.questList = makeQuestions(results.devicesQuestions);
      console.log(results);
      return scope.pageLoading = false;
    })["catch"](function(error) {
      scope.pageLoading = false;
      if (error.errorCode === 'Unauthorized') {
        return showDialog('partials/unAuth.html');
      } else {
        return showDialog('partials/serverError.html');
      }
    });
  };
  scope.$watchGroup(["pageContext.loaded", "sessionInfo.user.instanceId"], function(newVal, oldValues) {
    if (newVal[0] && newVal[1]) {
      devices = PageContextSvc.devices;
      user = PageContextSvc.user;
      refresh();
    }
  });
  scope.checkAnswer = function(data, answer, next) {
    console.log(data);
    console.log(answer);
    console.log(next);
    if (data && answer && !scope.disableAnswer) {
      console.log("execute");
      scope.showError = false;
      scope.disableAnswer = true;
      user.props.quesId = data;
      user.props.ans = answer;
      user.props.attempt = scope.accessCount;
      return user.submitAnswer().then(function(result) {
        if (next) {
          if (result === 'correct') {
            console.log("scope.accessCount");
            console.log(typeof scope.accessCount);
            if (scope.accessCount === 1) {
              scope.userScore = parseInt(scope.userScore) + 4;
            } else if (scope.accessCount === 2) {
              scope.userScore = parseInt(scope.userScore) + 3;
            } else if (scope.accessCount === 3) {
              scope.userScore = parseInt(scope.userScore) + 2;
            }
            console.log("scope.userScore " + scope.userScore);
            scope.section = 'two';
          } else if (result === 'wrong') {
            scope.section = 'three';
          }
          scope.questList.forEach(function(ds) {
            if (ds.id === next) {
              return ds.answered = 'true';
            } else {
              return ds.answered = 'flase';
            }
          });
        } else {
          if (scope.devicesCount < 15) {
            if (result === 'correct') {
              if (scope.accessCount === 1) {
                scope.userScore = parseInt(scope.userScore) + 4;
              } else if (scope.accessCount === 2) {
                scope.userScore = parseInt(scope.userScore) + 3;
              } else if (scope.accessCount === 3) {
                scope.userScore = parseInt(scope.userScore) + 2;
              }
              console.log("scope.userScore " + scope.userScore);
              scope.section = 'five';
            } else if (result === 'wrong') {
              scope.section = 'four';
            }
          } else {
            if (result === 'correct') {
              if (scope.accessCount === 1) {
                scope.userScore = parseInt(scope.userScore) + 4;
              } else if (scope.accessCount === 2) {
                scope.userScore = parseInt(scope.userScore) + 3;
              } else if (scope.accessCount === 3) {
                scope.userScore = parseInt(scope.userScore) + 2;
              }
              console.log("scope.userScore " + scope.userScore);
              scope.section = 'seven';
            } else if (result === 'wrong') {
              scope.section = 'six';
            }
          }
        }
        return scope.disableAnswer = false;
      })["catch"](function(error) {
        scope.disableAnswer = false;
        if (error.errorCode === 'Unauthorized') {
          return showDialog('partials/unAuth.html');
        } else {
          return showDialog('partials/serverError.html');
        }
      });
    } else {
      return scope.showError = true;
    }
  };
  scope.nextQuestion = function() {
    return scope.section = 'one';
  };
  scope.nextDevise = function() {
    return location.path('/startHunt');
  };
  scope.logout = function() {
    return $scope.$emit('logout', 'true');
  };
  clearProps = function() {
    user.props = void 0;
    return user.props = {};
  };
  return showDialog = function(data) {
    var modalInstance;
    return modalInstance = uibModal.open({
      animation: true,
      backdrop: 'static',
      backdropClass: 'backdropclass',
      templateUrl: data,
      windowClass: 'loginwindow',
      controller: 'errorPopUpCtrl'
    });
  };
};

deviceQuizFun.$inject = ["$scope", "$q", "$location", "qzcloud.PageContext", "RestSvc", "$uibModal"];

app.controller("deviceQuizCtrl", deviceQuizFun);


/*
 Copyright (c) 2017, Deal. All rights reserved.

 Controllers is user to display content to users. It doesn't perform any actions. It just show content to user and will have a close option.
 */
'use strict';
var $, $A, $G, errorPopUpFun, jQuery, ngModule;

$G = this;

$A = this.angular;

$ = jQuery = this.jQuery;

ngModule = angular.module('qzManager');

errorPopUpFun = function(scope, uibModalInstance, location) {
  scope.cancel = function() {
    return uibModalInstance.close('cancel');
  };
  scope.ok = function() {
    return uibModalInstance.close('OK');
  };
  scope.pageRedirection = function(data) {
    uibModalInstance.close('cancel');
    return location.path(data);
  };
  return scope.$on('$routeChangeStart', function() {
    return uibModalInstance.close('cancel');
  });
};

errorPopUpFun.$inject = ["$scope", "$uibModalInstance", "$location"];

ngModule.controller("errorPopUpCtrl", errorPopUpFun);


/*
  Copyright (c) 2018, Deal. All rights reserved.
 */
'use strict';
var $, $A, $G, app, instructionsFun, jQuery;

$G = this;

$A = this.angular;

$ = jQuery = this.jQuery;

app = angular.module('qzManager');

instructionsFun = function(scope, location, PageContextSvc, RestSvc, uibModal) {
  var showDialog;
  scope.pageLoading = true;
  scope.startHunt = function() {
    return location.path('/startHunt');
  };
  scope.$watchGroup(["pageContext.loaded", "sessionInfo.user.instanceId"], function(newVal, oldValues) {
    if (newVal[0] && newVal[1]) {
      scope.pageLoading = false;
    }
  });
  return showDialog = function(data) {
    var modalInstance;
    return modalInstance = uibModal.open({
      animation: true,
      backdrop: 'static',
      backdropClass: 'backdropclass',
      templateUrl: data,
      windowClass: 'loginwindow',
      controller: 'errorPopUpCtrl'
    });
  };
};

instructionsFun.$inject = ["$scope", "$location", "qzcloud.PageContext", "RestSvc", "$uibModal"];

app.controller("instructionsCtrl", instructionsFun);


/*
  Copyright (c) 2018, Deal. All rights reserved.
 */
'use strict';
var $, $A, $G, app, jQuery, startHuntFun;

$G = this;

$A = this.angular;

$ = jQuery = this.jQuery;

app = angular.module('qzManager');

startHuntFun = function(scope, location, PageContextSvc, uibModal) {
  var clearProps, devices, showDialog;
  scope.pageLoading = true;
  devices = null;
  scope.deviseNewId = 'false';
  scope.$broadcast("event:deviseId", 'false');
  scope.devises = [];
  scope.start = function() {
    return scope.cameraRequested = true;
  };
  scope.start();
  scope.processURLfromQR = function(url) {
    scope.url = url;
    return scope.cameraRequested = false;
  };
  scope.onError = function(data) {
    console.log("data");
    return console.log(data);
  };
  scope.selectDevise = function(ds) {
    scope.deviseNewId = ds;
    return scope.$broadcast("event:deviseId", ds);
  };
  scope.$on('event:gotDevices', function(events, args) {
    if (args.length > 0) {
      return args.forEach(function(ds) {
        return scope.devises.push(ds);
      });
    }
  });
  scope.testUrl = function(data) {
    devices.props.deviseId = data;
    return devices.updateDeviseAccess().then(function(result) {
      var url;
      console.log(result);
      url = "/devise/" + data;
      return location.path(url);
    })["catch"](function(error) {
      console.log(error);
      if (error.errorCode === 'LIMITERROR') {

      } else if (error.errorCode === 'Unauthorized') {
        return showDialog('partials/unAuth.html');
      } else {
        return showDialog('partials/serverError.html');
      }
    });
  };
  scope.$watchGroup(["pageContext.loaded", "sessionInfo.user.instanceId"], function(newVal, oldValues) {
    if (newVal[0] && newVal[1]) {
      scope.pageLoading = false;
      devices = PageContextSvc.devices;
    }
  });
  clearProps = function() {
    devices.props = void 0;
    return devices.props = {};
  };
  return showDialog = function(data) {
    var modalInstance;
    return modalInstance = uibModal.open({
      animation: true,
      backdrop: 'static',
      backdropClass: 'backdropclass',
      templateUrl: data,
      windowClass: 'loginwindow',
      controller: 'errorPopUpCtrl'
    });
  };
};

startHuntFun.$inject = ["$scope", "$location", "qzcloud.PageContext", "$uibModal"];

app.controller("startHuntCtrl", startHuntFun);


/*
  Copyright (c) 2018, Deal. All rights reserved.
 */
'use strict';
var $, $A, $G, SignupFun, app, jQuery;

$G = this;

$A = this.angular;

$ = jQuery = this.jQuery;

app = angular.module('qzManager');

SignupFun = function(scope, uibModal, RestSvc) {
  var showDialog;
  scope.disableForm = false;
  scope.errors = void 0;
  scope.userSignup = function() {
    var userData;
    console.log("sfsdfd");
    if (scope.signup.$valid && !scope.disableForm) {
      scope.disableForm = true;
      userData = {
        email: scope.email,
        username: scope.username
      };
      return RestSvc.login(userData).then(function(results) {})["catch"](function(err) {
        console.log(err);
        scope.disableForm = false;
        if (err.errorCode === 'INVALIDATION') {
          return scope.errors = err.msg;
        } else {
          return showDialog('partials/serverError.html');
        }
      });
    } else {
      scope.signup.email.$touched = true;
      return scope.signup.username.$touched = true;
    }
  };
  return showDialog = function(data) {
    var modalInstance;
    return modalInstance = uibModal.open({
      animation: true,
      backdrop: 'static',
      backdropClass: 'backdropclass',
      templateUrl: data,
      windowClass: 'loginwindow',
      controller: 'errorPopUpCtrl'
    });
  };
};

SignupFun.$inject = ["$scope", "$uibModal", "RestSvc"];

app.controller("SignupCtrl", SignupFun);

'use strict';
var ngModule;

ngModule = angular.module("qzManager");

ngModule.config([
  '$routeProvider', function($routeProvider, RestSvc) {
    return $routeProvider.when('/', {
      templateUrl: 'partials/signup.html'
    }).when('/signup', {
      templateUrl: 'partials/signup.html'
    }).when('/instruction', {
      resolve: {
        session: [
          "RestSvc", function(RestSvc) {
            return RestSvc.checkSessionInfo();
          }
        ]
      },
      templateUrl: 'partials/instruction.html'
    }).when('/startHunt', {
      resolve: {
        session: [
          "RestSvc", function(RestSvc) {
            return RestSvc.checkSessionInfo();
          }
        ]
      },
      templateUrl: 'partials/startHunt.html'
    }).when('/devise/:code', {
      templateUrl: 'partials/devisequiz.html'
    }).otherwise({
      templateUrl: 'partials/404.html'
    });
  }
]);

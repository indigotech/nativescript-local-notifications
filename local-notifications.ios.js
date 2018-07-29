"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("tns-core-modules/utils/utils");
var local_notifications_common_1 = require("./local-notifications-common");
var LocalNotificationsImpl = (function (_super) {
    __extends(LocalNotificationsImpl, _super);
    function LocalNotificationsImpl() {
        var _this = _super.call(this) || this;
        _this.pendingReceivedNotifications = [];
        _this.notificationOptions = new Map();
        console.log("LocalNotifications constructor @ " + new Date().getTime());
        if (LocalNotificationsImpl.isUNUserNotificationCenterAvailable()) {
            _this.delegate = UNUserNotificationCenterDelegateImpl.initWithOwner(new WeakRef(_this));
            UNUserNotificationCenter.currentNotificationCenter().delegate = _this.delegate;
        }
        else {
            _this.notificationReceivedObserver = LocalNotificationsImpl.addObserver("notificationReceived", function (result) {
                var notificationDetails = JSON.parse(result.userInfo.objectForKey("message"));
                _this.addOrProcessNotification(notificationDetails);
            });
            _this.notificationHandler = Notification.new();
            _this.notificationManager = NotificationManager.new();
        }
        return _this;
    }
    LocalNotificationsImpl.isUNUserNotificationCenterAvailable = function () {
        try {
            return !!UNUserNotificationCenter;
        }
        catch (ignore) {
            return false;
        }
    };
    LocalNotificationsImpl.hasPermission = function () {
        var settings = UIApplication.sharedApplication.currentUserNotificationSettings;
        var types = 4 | 1 | 2;
        return (settings.types & types) > 0;
    };
    LocalNotificationsImpl.addObserver = function (eventName, callback) {
        return NSNotificationCenter.defaultCenter.addObserverForNameObjectQueueUsingBlock(eventName, null, NSOperationQueue.mainQueue, callback);
    };
    ;
    LocalNotificationsImpl.getInterval = function (interval) {
        if (!interval) {
            return 2;
        }
        else if (interval === "second") {
            return 128;
        }
        else if (interval === "minute") {
            return 64;
        }
        else if (interval === "hour") {
            return 32;
        }
        else if (interval === "day") {
            return 16;
        }
        else if (interval === "week") {
            return 8192;
        }
        else if (interval === "month") {
            return 8;
        }
        else if (interval === "quarter") {
            return 2048;
        }
        else if (interval === "year") {
            return 4;
        }
        else {
            return 2;
        }
    };
    ;
    LocalNotificationsImpl.schedulePendingNotifications = function (pending) {
        if (LocalNotificationsImpl.isUNUserNotificationCenterAvailable()) {
            LocalNotificationsImpl.schedulePendingNotificationsNew(pending);
        }
        else {
            LocalNotificationsImpl.schedulePendingNotificationsLegacy(pending);
        }
    };
    LocalNotificationsImpl.schedulePendingNotificationsNew = function (pending) {
        var _loop_1 = function (n) {
            var options = LocalNotificationsImpl.merge(pending[n], LocalNotificationsImpl.defaults);
            var content = UNMutableNotificationContent.new();
            content.title = options.title;
            content.subtitle = options.subtitle;
            content.body = options.body;
            if (options.sound === undefined || options.sound === "default") {
                content.sound = UNNotificationSound.defaultSound();
            }
            content.badge = options.badge;
            var userInfoDict = new NSMutableDictionary({ capacity: 1 });
            userInfoDict.setObjectForKey(options.forceShowWhenInForeground, "forceShowWhenInForeground");
            content.userInfo = userInfoDict;
            var trigger_at = options.at ? options.at : new Date();
            var repeats = options.interval !== undefined;
            console.log(">> repeats: " + repeats);
            var trigger = void 0;
            if (options.trigger === "timeInterval") {
            }
            else {
                var FormattedDate = NSDateComponents.new();
                FormattedDate.day = trigger_at.getUTCDate();
                FormattedDate.month = trigger_at.getUTCMonth() + 1;
                FormattedDate.year = trigger_at.getUTCFullYear();
                FormattedDate.minute = trigger_at.getMinutes();
                FormattedDate.hour = trigger_at.getHours();
                FormattedDate.second = trigger_at.getSeconds();
                trigger = UNCalendarNotificationTrigger.triggerWithDateMatchingComponentsRepeats(FormattedDate, repeats);
                console.log(">> trigger: " + trigger);
            }
            if (options.actions) {
                var categoryIdentifier_1 = "CATEGORY";
                var actions_1 = [];
                options.actions.forEach(function (action) {
                    categoryIdentifier_1 += ("_" + action.id);
                    var notificationActionOptions = UNNotificationActionOptionNone;
                    if (action.launch) {
                        notificationActionOptions = 4;
                    }
                    if (action.type === "input") {
                        actions_1.push(UNTextInputNotificationAction.actionWithIdentifierTitleOptionsTextInputButtonTitleTextInputPlaceholder("" + action.id, action.title, notificationActionOptions, action.submitLabel || "Submit", action.placeholder));
                    }
                    else if (action.type === "button") {
                        actions_1.push(UNNotificationAction.actionWithIdentifierTitleOptions("" + action.id, action.title, notificationActionOptions));
                    }
                    else {
                        console.log("Unsupported action type: " + action.type);
                    }
                });
                var notificationCategory_1 = UNNotificationCategory.categoryWithIdentifierActionsIntentIdentifiersOptions(categoryIdentifier_1, actions_1, [], 1);
                content.categoryIdentifier = categoryIdentifier_1;
                UNUserNotificationCenter.currentNotificationCenter().getNotificationCategoriesWithCompletionHandler(function (categories) {
                    console.log({ categories: categories });
                    UNUserNotificationCenter.currentNotificationCenter().setNotificationCategories(categories.setByAddingObject(notificationCategory_1));
                });
            }
            var request = UNNotificationRequest.requestWithIdentifierContentTrigger("" + options.id, content, trigger);
            UNUserNotificationCenter.currentNotificationCenter().addNotificationRequestWithCompletionHandler(request, function (error) {
                if (error) {
                    console.log("Error scheduling notification (id " + options.id + "): " + error.localizedDescription);
                }
            });
        };
        for (var n in pending) {
            _loop_1(n);
        }
    };
    LocalNotificationsImpl.schedulePendingNotificationsLegacy = function (pending) {
        for (var n in pending) {
            var options = LocalNotificationsImpl.merge(pending[n], LocalNotificationsImpl.defaults);
            var notification = UILocalNotification.new();
            notification.fireDate = options.at ? options.at : new Date();
            notification.alertTitle = options.title;
            notification.alertBody = options.body;
            notification.timeZone = utils.ios.getter(NSTimeZone, NSTimeZone.defaultTimeZone);
            notification.applicationIconBadgeNumber = options.badge;
            var userInfoDict = NSMutableDictionary.alloc().initWithCapacity(4);
            userInfoDict.setObjectForKey(options.id, "id");
            userInfoDict.setObjectForKey(options.title, "title");
            userInfoDict.setObjectForKey(options.body, "body");
            userInfoDict.setObjectForKey(options.interval, "interval");
            notification.userInfo = userInfoDict;
            switch (options.sound) {
                case null:
                case false:
                    break;
                case undefined:
                case "default":
                    notification.soundName = UILocalNotificationDefaultSoundName;
                    break;
                default:
                    notification.soundName = options.sound;
                    break;
            }
            if (options.interval !== undefined) {
                notification.repeatInterval = LocalNotificationsImpl.getInterval(options.interval);
            }
            UIApplication.sharedApplication.scheduleLocalNotification(notification);
        }
    };
    LocalNotificationsImpl.prototype.addOrProcessNotification = function (notificationDetails) {
        if (this.receivedNotificationCallback) {
            this.receivedNotificationCallback(notificationDetails);
        }
        else {
            this.pendingReceivedNotifications.push(notificationDetails);
        }
    };
    LocalNotificationsImpl.prototype.hasPermission = function () {
        return new Promise(function (resolve, reject) {
            try {
                resolve(LocalNotificationsImpl.hasPermission());
            }
            catch (ex) {
                console.log("Error in LocalNotifications.hasPermission: " + ex);
                reject(ex);
            }
        });
    };
    LocalNotificationsImpl.prototype.requestPermission = function () {
        return new Promise(function (resolve, reject) {
            if (LocalNotificationsImpl.isUNUserNotificationCenterAvailable()) {
                var center = UNUserNotificationCenter.currentNotificationCenter();
                center.requestAuthorizationWithOptionsCompletionHandler(4 | 1 | 2, function (granted, error) { return resolve(granted); });
            }
            else {
                LocalNotificationsImpl.didRegisterUserNotificationSettingsObserver = LocalNotificationsImpl.addObserver("didRegisterUserNotificationSettings", function (result) {
                    NSNotificationCenter.defaultCenter.removeObserver(LocalNotificationsImpl.didRegisterUserNotificationSettingsObserver);
                    LocalNotificationsImpl.didRegisterUserNotificationSettingsObserver = undefined;
                    var granted = result.userInfo.objectForKey("message");
                    resolve(granted != "false");
                });
                var types = UIApplication.sharedApplication.currentUserNotificationSettings.types | 4 | 1 | 2;
                var settings = UIUserNotificationSettings.settingsForTypesCategories(types, null);
                UIApplication.sharedApplication.registerUserNotificationSettings(settings);
            }
        });
    };
    LocalNotificationsImpl.prototype.addOnMessageReceivedCallback = function (onReceived) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                _this.receivedNotificationCallback = onReceived;
                for (var p in _this.pendingReceivedNotifications) {
                    console.log("notificationDetails p: " + JSON.parse(p));
                    onReceived(_this.pendingReceivedNotifications[p]);
                }
                _this.pendingReceivedNotifications = [];
                resolve(true);
            }
            catch (ex) {
                console.log("Error in LocalNotifications.addOnMessageReceivedCallback: " + ex);
                reject(ex);
            }
        });
    };
    LocalNotificationsImpl.prototype.cancel = function (id) {
        return new Promise(function (resolve, reject) {
            try {
                if (LocalNotificationsImpl.isUNUserNotificationCenterAvailable()) {
                    console.log(id);
                    console.log(typeof id);
                    UNUserNotificationCenter.currentNotificationCenter().removePendingNotificationRequestsWithIdentifiers(["" + id]);
                    resolve(true);
                }
                else {
                    var scheduled = UIApplication.sharedApplication.scheduledLocalNotifications;
                    for (var i = 0, l = scheduled.count; i < l; i++) {
                        var noti = scheduled.objectAtIndex(i);
                        if (id == noti.userInfo.valueForKey("id")) {
                            UIApplication.sharedApplication.cancelLocalNotification(noti);
                            resolve(true);
                            return;
                        }
                    }
                    resolve(false);
                }
            }
            catch (ex) {
                console.log("Error in LocalNotifications.cancel: " + ex);
                reject(ex);
            }
        });
    };
    LocalNotificationsImpl.prototype.cancelAll = function () {
        return new Promise(function (resolve, reject) {
            try {
                if (LocalNotificationsImpl.isUNUserNotificationCenterAvailable()) {
                    UNUserNotificationCenter.currentNotificationCenter().removeAllPendingNotificationRequests();
                }
                else {
                    UIApplication.sharedApplication.cancelAllLocalNotifications();
                }
                UIApplication.sharedApplication.applicationIconBadgeNumber = 0;
                resolve();
            }
            catch (ex) {
                console.log("Error in LocalNotifications.cancelAll: " + ex);
                reject(ex);
            }
        });
    };
    LocalNotificationsImpl.prototype.getScheduledIds = function () {
        return new Promise(function (resolve, reject) {
            try {
                var scheduledIds_1 = [];
                if (LocalNotificationsImpl.isUNUserNotificationCenterAvailable()) {
                    UNUserNotificationCenter.currentNotificationCenter().getPendingNotificationRequestsWithCompletionHandler(function (notRequests) {
                        for (var i = 0; i < notRequests.count; i++) {
                            scheduledIds_1.push(notRequests[i].identifier);
                        }
                        resolve(scheduledIds_1);
                    });
                }
                else {
                    var scheduled = UIApplication.sharedApplication.scheduledLocalNotifications;
                    for (var i = 0, l = scheduled.count; i < l; i++) {
                        scheduledIds_1.push(scheduled.objectAtIndex(i).userInfo.valueForKey("id"));
                    }
                    resolve(scheduledIds_1);
                }
            }
            catch (ex) {
                console.log("Error in LocalNotifications.getScheduledIds: " + ex);
                reject(ex);
            }
        });
    };
    LocalNotificationsImpl.prototype.schedule = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                if (!LocalNotificationsImpl.hasPermission()) {
                    _this.requestPermission().then(function (granted) {
                        if (granted) {
                            LocalNotificationsImpl.schedulePendingNotifications(options);
                            resolve();
                        }
                    });
                }
                else {
                    LocalNotificationsImpl.schedulePendingNotifications(options);
                    resolve();
                }
            }
            catch (ex) {
                console.log("Error in LocalNotifications.schedule: " + ex);
                reject(ex);
            }
        });
    };
    return LocalNotificationsImpl;
}(local_notifications_common_1.LocalNotificationsCommon));
exports.LocalNotificationsImpl = LocalNotificationsImpl;
var UNUserNotificationCenterDelegateImpl = (function (_super) {
    __extends(UNUserNotificationCenterDelegateImpl, _super);
    function UNUserNotificationCenterDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UNUserNotificationCenterDelegateImpl.new = function () {
        try {
            UNUserNotificationCenterDelegateImpl.ObjCProtocols.push(UNUserNotificationCenterDelegate);
        }
        catch (ignore) {
        }
        return _super.new.call(this);
    };
    UNUserNotificationCenterDelegateImpl.initWithOwner = function (owner) {
        var delegate = UNUserNotificationCenterDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    };
    UNUserNotificationCenterDelegateImpl.prototype.userNotificationCenterDidReceiveNotificationResponseWithCompletionHandler = function (center, notificationResponse, completionHandler) {
        var request = notificationResponse.notification.request, notificationContent = request.content, action = notificationResponse.actionIdentifier;
        if (action === UNNotificationDismissActionIdentifier) {
            completionHandler();
            return;
        }
        var event = "default";
        if (action !== UNNotificationDefaultActionIdentifier) {
            event = notificationResponse instanceof UNTextInputNotificationResponse ? "input" : "button";
        }
        var response = notificationResponse.actionIdentifier;
        if (response === UNNotificationDefaultActionIdentifier) {
            response = undefined;
        }
        else if (notificationResponse instanceof UNTextInputNotificationResponse) {
            response = notificationResponse.userText;
        }
        this._owner.get().addOrProcessNotification({
            id: +request.identifier,
            title: notificationContent.title,
            body: notificationContent.body,
            event: event,
            response: response
        });
        completionHandler();
    };
    UNUserNotificationCenterDelegateImpl.prototype.userNotificationCenterWillPresentNotificationWithCompletionHandler = function (center, notification, completionHandler) {
        if (notification.request.trigger instanceof UNPushNotificationTrigger) {
            return;
        }
        if (notification.request.content.userInfo.valueForKey("forceShowWhenInForeground")) {
            completionHandler(1 | 2 | 4);
        }
        else {
            completionHandler(1 | 2);
        }
    };
    UNUserNotificationCenterDelegateImpl.ObjCProtocols = [];
    return UNUserNotificationCenterDelegateImpl;
}(NSObject));
exports.LocalNotifications = new LocalNotificationsImpl();

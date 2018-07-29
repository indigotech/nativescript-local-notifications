"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("tns-core-modules/utils/utils");
var local_notifications_common_1 = require("./local-notifications-common");
var LocalNotificationsImpl = (function (_super) {
    __extends(LocalNotificationsImpl, _super);
    function LocalNotificationsImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LocalNotificationsImpl.getInterval = function (interval) {
        if (interval === undefined) {
            return 0;
        }
        else if (interval === "second") {
            return 1000;
        }
        else if (interval === "minute") {
            return android.app.AlarmManager.INTERVAL_FIFTEEN_MINUTES / 15;
        }
        else if (interval === "hour") {
            return android.app.AlarmManager.INTERVAL_HOUR;
        }
        else if (interval === "day") {
            return android.app.AlarmManager.INTERVAL_DAY;
        }
        else if (interval === "week") {
            return android.app.AlarmManager.INTERVAL_DAY * 7;
        }
        else if (interval === "month") {
            return android.app.AlarmManager.INTERVAL_DAY * 31;
        }
        else if (interval === "quarter") {
            return android.app.AlarmManager.INTERVAL_HOUR * 2190;
        }
        else if (interval === "year") {
            return android.app.AlarmManager.INTERVAL_DAY * 365;
        }
        else {
            return 0;
        }
    };
    LocalNotificationsImpl.cancelById = function (id) {
        var context = utils.ad.getApplicationContext();
        var notificationIntent = new android.content.Intent(context, com.telerik.localnotifications.NotificationPublisher.class).setAction("" + id);
        var pendingIntent = android.app.PendingIntent.getBroadcast(context, 0, notificationIntent, 0);
        var alarmManager = context.getSystemService(android.content.Context.ALARM_SERVICE);
        alarmManager.cancel(pendingIntent);
        var notificationManager = context.getSystemService(android.content.Context.NOTIFICATION_SERVICE);
        notificationManager.cancel(id);
        LocalNotificationsImpl.unpersist(id);
    };
    ;
    LocalNotificationsImpl.persist = function (options) {
        var sharedPreferences = LocalNotificationsImpl.getSharedPreferences();
        var sharedPreferencesEditor = sharedPreferences.edit();
        options.largeIconDrawable = null;
        sharedPreferencesEditor.putString("" + options.id, JSON.stringify(options));
        sharedPreferencesEditor.apply();
    };
    ;
    LocalNotificationsImpl.unpersist = function (id) {
        var sharedPreferences = LocalNotificationsImpl.getSharedPreferences();
        var sharedPreferencesEditor = sharedPreferences.edit();
        sharedPreferencesEditor.remove("" + id);
        sharedPreferencesEditor.commit();
    };
    ;
    LocalNotificationsImpl.getSharedPreferences = function () {
        var PREF_KEY = "LocalNotificationsPlugin";
        return utils.ad.getApplicationContext().getSharedPreferences(PREF_KEY, android.content.Context.MODE_PRIVATE);
    };
    ;
    LocalNotificationsImpl.prototype.hasPermission = function () {
        return new Promise(function (resolve, reject) {
            try {
                resolve(true);
            }
            catch (ex) {
                console.log("Error in LocalNotifications.hasPermission: " + ex);
                reject(ex);
            }
        });
    };
    LocalNotificationsImpl.prototype.requestPermission = function () {
        return new Promise(function (resolve, reject) {
            try {
                resolve(true);
            }
            catch (ex) {
                console.log("Error in LocalNotifications.requestPermission: " + ex);
                reject(ex);
            }
        });
    };
    LocalNotificationsImpl.prototype.addOnMessageReceivedCallback = function (onReceived) {
        return new Promise(function (resolve, reject) {
            try {
                com.telerik.localnotifications.LocalNotificationsPlugin.setOnMessageReceivedCallback(new com.telerik.localnotifications.LocalNotificationsPluginListener({
                    success: function (notification) {
                        onReceived(JSON.parse(notification));
                    }
                }));
                resolve();
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
                LocalNotificationsImpl.cancelById(id);
                resolve(true);
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
                var sharedPreferences = LocalNotificationsImpl.getSharedPreferences();
                var keys = sharedPreferences.getAll().keySet();
                var iterator = keys.iterator();
                while (iterator.hasNext()) {
                    var cancelMe = iterator.next();
                    console.log(">> canceling " + cancelMe);
                    LocalNotificationsImpl.cancelById(cancelMe);
                }
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
                var scheduledIds = [];
                var sharedPreferences = LocalNotificationsImpl.getSharedPreferences();
                var keys = sharedPreferences.getAll().keySet();
                var iterator = keys.iterator();
                while (iterator.hasNext()) {
                    scheduledIds.push(iterator.next());
                }
                resolve(scheduledIds);
            }
            catch (ex) {
                console.log("Error in LocalNotifications.getScheduledIds: " + ex);
                reject(ex);
            }
        });
    };
    LocalNotificationsImpl.prototype.schedule = function (scheduleOptions) {
        return new Promise(function (resolve, reject) {
            try {
                var context = utils.ad.getApplicationContext();
                var resources = context.getResources();
                for (var n in scheduleOptions) {
                    var options = LocalNotificationsImpl.merge(scheduleOptions[n], LocalNotificationsImpl.defaults);
                    if (options.smallIcon) {
                        if (options.smallIcon.indexOf(utils.RESOURCE_PREFIX) === 0) {
                            options.smallIcon = resources.getIdentifier(options.smallIcon.substr(utils.RESOURCE_PREFIX.length), 'drawable', context.getApplicationInfo().packageName);
                        }
                    }
                    if (!options.smallIcon) {
                        options.smallIcon = resources.getIdentifier("ic_stat_notify", "drawable", context.getApplicationInfo().packageName);
                    }
                    if (!options.smallIcon) {
                        options.smallIcon = context.getApplicationInfo().icon;
                    }
                    if (options.largeIcon) {
                        if (options.largeIcon.indexOf(utils.RESOURCE_PREFIX) === 0) {
                            options.largeIcon = resources.getIdentifier(options.largeIcon.substr(utils.RESOURCE_PREFIX.length), 'drawable', context.getApplicationInfo().packageName);
                        }
                    }
                    if (!options.largeIcon) {
                        options.largeIcon = resources.getIdentifier("ic_notify", "drawable", context.getApplicationInfo().packageName);
                    }
                    if (!options.largeIcon) {
                        options.largeIcon = context.getApplicationInfo().icon;
                    }
                    if (options.largeIcon) {
                        options.largeIconDrawable = android.graphics.BitmapFactory.decodeResource(context.getResources(), options.largeIcon);
                    }
                    options.atTime = options.at ? options.at.getTime() : new Date().getTime();
                    if (options.vibrate === undefined) {
                        options.vibrate = [];
                    }
                    if (options.priority === undefined) {
                        options.priority = options.forceShowWhenInForeground ? 1 : 0;
                    }
                    if (options.autocancel === undefined) {
                        options.autocancel = true;
                    }
                    var useDefaultSound = options.sound !== null;
                    var builder = new android.support.v4.app.NotificationCompat.Builder(context)
                        .setDefaults(0)
                        .setContentTitle(options.title)
                        .setContentText(options.body)
                        .setSmallIcon(options.smallIcon)
                        .setLargeIcon(options.largeIconDrawable)
                        .setAutoCancel(options.autocancel)
                        .setNumber(options.badge)
                        .setOngoing(options.ongoing)
                        .setTicker(options.ticker || options.body)
                        .setVibrate(options.vibrate)
                        .setPriority(options.priority);
                    if (android.os.Build.VERSION.SDK_INT >= 26 && builder.setChannelId) {
                        var channelId = "myChannelId";
                        var notificationManager = context.getSystemService(android.content.Context.NOTIFICATION_SERVICE);
                        if (notificationManager && notificationManager.getNotificationChannel) {
                            var notificationChannel = notificationManager.getNotificationChannel(channelId);
                            if (notificationChannel === null) {
                                notificationChannel = new android.app.NotificationChannel(channelId, options.channel, android.app.NotificationManager.IMPORTANCE_HIGH);
                                notificationManager.createNotificationChannel(notificationChannel);
                            }
                            builder.setChannelId(channelId);
                        }
                    }
                    if (options.groupedMessages !== null && Array.isArray(options.groupedMessages)) {
                        var inboxStyle = new android.support.v4.app.NotificationCompat.InboxStyle();
                        var events = options.groupedMessages;
                        (events.length > 5) ? events.splice(0, events.length - 5) : 0;
                        inboxStyle.setBigContentTitle(options.title);
                        for (var i = 0; i < events.length; i++) {
                            inboxStyle.addLine(events[i]);
                        }
                        options.groupSummary !== null ? inboxStyle.setSummaryText(options.groupSummary) : 0;
                        builder
                            .setGroup(options.group)
                            .setStyle(inboxStyle);
                    }
                    var reqCode = new java.util.Random().nextInt();
                    var clickIntent = new android.content.Intent(context, com.telerik.localnotifications.NotificationClickedActivity.class)
                        .putExtra("pushBundle", JSON.stringify(options))
                        .setFlags(android.content.Intent.FLAG_ACTIVITY_NO_HISTORY);
                    var pendingContentIntent = android.app.PendingIntent.getActivity(context, reqCode, clickIntent, android.app.PendingIntent.FLAG_UPDATE_CURRENT);
                    builder.setContentIntent(pendingContentIntent);
                    if (options.bigTextStyle) {
                        var bigTextStyle = new android.support.v4.app.NotificationCompat.BigTextStyle();
                        bigTextStyle.setBigContentTitle(options.title);
                        bigTextStyle.bigText(options.body);
                        builder.setStyle(bigTextStyle);
                    }
                    var notification = builder.build();
                    if (useDefaultSound) {
                        notification.defaults |= android.app.Notification.DEFAULT_SOUND;
                    }
                    var notificationIntent = new android.content.Intent(context, com.telerik.localnotifications.NotificationPublisher.class)
                        .setAction("" + options.id)
                        .putExtra(com.telerik.localnotifications.NotificationPublisher.NOTIFICATION_ID, options.id)
                        .putExtra(com.telerik.localnotifications.NotificationPublisher.NOTIFICATION, notification);
                    var pendingIntent = android.app.PendingIntent.getBroadcast(context, 0, notificationIntent, android.app.PendingIntent.FLAG_CANCEL_CURRENT);
                    var alarmManager = utils.ad.getApplicationContext().getSystemService(android.content.Context.ALARM_SERVICE);
                    var repeatInterval = LocalNotificationsImpl.getInterval(options.interval);
                    options.repeatInterval = repeatInterval;
                    if (repeatInterval > 0) {
                        alarmManager.setRepeating(android.app.AlarmManager.RTC_WAKEUP, options.atTime, repeatInterval, pendingIntent);
                    }
                    else {
                        if (options.at) {
                            alarmManager.set(android.app.AlarmManager.RTC_WAKEUP, options.atTime, pendingIntent);
                        }
                        else {
                            var notiManager = context.getSystemService(android.content.Context.NOTIFICATION_SERVICE);
                            notiManager.notify(options.id, notification);
                        }
                    }
                    LocalNotificationsImpl.persist(options);
                }
                resolve();
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
exports.LocalNotifications = new LocalNotificationsImpl();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LocalNotificationsCommon = (function () {
    function LocalNotificationsCommon() {
    }
    LocalNotificationsCommon.merge = function (obj1, obj2) {
        var result = {};
        for (var i in obj1) {
            if ((i in obj2) && (typeof obj1[i] === "object") && (i !== null)) {
                result[i] = this.merge(obj1[i], obj2[i]);
            }
            else {
                result[i] = obj1[i];
            }
        }
        for (var i in obj2) {
            if (i in result) {
                continue;
            }
            result[i] = obj2[i];
        }
        return result;
    };
    LocalNotificationsCommon.defaults = {
        id: 0,
        title: "",
        body: "",
        badge: 0,
        interval: undefined,
        ongoing: false,
        groupSummary: null,
        bigTextStyle: false,
        channel: "Channel",
        forceShowWhenInForeground: false
    };
    return LocalNotificationsCommon;
}());
exports.LocalNotificationsCommon = LocalNotificationsCommon;

import { LocalNotificationsApi, LocalNotificationsCommon, ReceivedNotification, ScheduleOptions } from "./local-notifications-common";
export declare class LocalNotificationsImpl extends LocalNotificationsCommon implements LocalNotificationsApi {
    private static didRegisterUserNotificationSettingsObserver;
    private notificationReceivedObserver;
    private pendingReceivedNotifications;
    private receivedNotificationCallback;
    private notificationHandler;
    private notificationManager;
    notificationOptions: Map<string, ScheduleOptions>;
    private delegate;
    constructor();
    static isUNUserNotificationCenterAvailable(): boolean;
    private static hasPermission();
    private static addObserver(eventName, callback);
    private static getInterval(interval);
    private static schedulePendingNotifications(pending);
    private static schedulePendingNotificationsNew(pending);
    private static schedulePendingNotificationsLegacy(pending);
    addOrProcessNotification(notificationDetails: ReceivedNotification): void;
    hasPermission(): Promise<boolean>;
    requestPermission(): Promise<boolean>;
    addOnMessageReceivedCallback(onReceived: (data: ReceivedNotification) => void): Promise<any>;
    cancel(id: number): Promise<boolean>;
    cancelAll(): Promise<any>;
    getScheduledIds(): Promise<any>;
    schedule(options: ScheduleOptions[]): Promise<any>;
}
export declare const LocalNotifications: LocalNotificationsImpl;

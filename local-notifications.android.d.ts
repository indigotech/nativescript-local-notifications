import { LocalNotificationsCommon, LocalNotificationsApi, ReceivedNotification, ScheduleOptions } from "./local-notifications-common";
export declare class LocalNotificationsImpl extends LocalNotificationsCommon implements LocalNotificationsApi {
    private static getInterval(interval);
    private static cancelById(id);
    private static persist(options);
    private static unpersist(id);
    private static getSharedPreferences();
    hasPermission(): Promise<boolean>;
    requestPermission(): Promise<boolean>;
    addOnMessageReceivedCallback(onReceived: (data: ReceivedNotification) => void): Promise<any>;
    cancel(id: number): Promise<boolean>;
    cancelAll(): Promise<any>;
    getScheduledIds(): Promise<any>;
    schedule(scheduleOptions: ScheduleOptions[]): Promise<any>;
}
export declare const LocalNotifications: LocalNotificationsImpl;

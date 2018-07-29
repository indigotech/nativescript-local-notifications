export declare type ScheduleInterval = "second" | "minute" | "hour" | "day" | "week" | "month" | "quarter" | "year";
export interface NotificationAction {
    id: string;
    type: "button" | "input";
    title?: string;
    launch?: boolean;
    submitLabel?: string;
    placeholder?: string;
}
export interface ScheduleOptions {
    id?: number;
    title?: string;
    subtitle?: string;
    body?: string;
    ticker?: string;
    at?: Date;
    trigger?: "timeInterval";
    badge?: number;
    sound?: string;
    interval?: ScheduleInterval;
    smallIcon?: string;
    largeIcon?: string;
    ongoing?: boolean;
    groupedMessages?: Array<string>;
    groupSummary?: string;
    bigTextStyle?: boolean;
    channel?: string;
    forceShowWhenInForeground?: boolean;
    actions?: Array<NotificationAction>;
    vibrate?: Array<number>;
    priority?: number;
    autocancel?: boolean;
}
export interface ReceivedNotification {
    id: number;
    title?: string;
    body?: string;
    event?: string;
    response?: string;
}
export interface LocalNotificationsApi {
    schedule(options: ScheduleOptions[]): Promise<any>;
    addOnMessageReceivedCallback(onReceived: (data: ReceivedNotification) => void): Promise<any>;
    getScheduledIds(): Promise<any>;
    cancel(id: number): Promise<boolean>;
    cancelAll(): Promise<any>;
    hasPermission(): Promise<boolean>;
    requestPermission(): Promise<boolean>;
}
export declare abstract class LocalNotificationsCommon {
    static defaults: {
        id: number;
        title: string;
        body: string;
        badge: number;
        interval: any;
        ongoing: boolean;
        groupSummary: any;
        bigTextStyle: boolean;
        channel: string;
        forceShowWhenInForeground: boolean;
    };
    static merge(obj1: {}, obj2: {}): any;
}

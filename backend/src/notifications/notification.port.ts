import { AppRole } from '@prisma/client';

/**
 * INotificationPort
 *
 * The minimal interface that Part B domain services (ApprovalsService,
 * LifecycleService, WorkerService) use to dispatch in-app notifications.
 *
 * This interface is intentionally narrow — it exposes only the method
 * that is actually called today. Do not expand it without a concrete
 * new call site in Part B that justifies the addition.
 *
 * Part B consumers should inject this by the NotificationPort / NOTIFICATION_PORT token,
 * not by the concrete NotificationsService class, to preserve the
 * boundary between Part A (notifications infrastructure) and Part B
 * (domain business logic).
 *
 * Injection example (Part B service):
 *
 *   @Inject('NotificationPort')
 *   private readonly notificationsService: NotificationPort,
 */
export interface INotificationPort {
  createNotification(data: CreateNotificationData): Promise<any>;
}

export type NotificationPort = INotificationPort;

export interface CreateNotificationData {
  recipientId?: string;
  recipientRole?: AppRole;
  title: string;
  message: string;
  type?: string;
  severity?: string;
  link?: string;
  metadata?: any;
}

/**
 * Injection token for the NotificationPort.
 * Use this in Part B @Inject() decorators so Part B never depends
 * on the NotificationsService class directly.
 */
export const NOTIFICATION_PORT = 'NotificationPort';
export const NotificationPort = NOTIFICATION_PORT;

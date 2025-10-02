// Base notification interface that all notifications must implement
export interface BaseNotification {
  notificationType: string;
  data: any[];
  timestamp: Date;
  id?: string;
}

// Generic notification wrapper
export interface NotificationWrapper {
  notificationType: string;
  data: any[];
  timestamp?: Date;
  id?: string;
}

// New backend DTO structure
export interface PurchaseOrderNotificationDto {
  title: string;
  message: string;
  purchaseOrder: PurchaseOrderProposal;
  timestamp: Date;
  notificationType: string;
}

export interface PurchaseOrderProposal {
  contragnetId: number;  // Note: backend has typo "Contragnet" instead of "Contragent"
  contragnetName: string;
  leadId?: number;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  medicineName: string;
  dosage: string;
  quantity?: number;
  minQuantity?: number;
  maxQuantity?: number;
  price?: number;
  currency: string;
  form: string;
}

// Example of how other notification types could be defined
export interface OrderStatusNotificationData {
  orderId: string;
  status: string;
  message: string;
}

export interface SystemAlertNotificationData {
  alertType: 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

// Union type for all possible notification data types
export type NotificationData = 
  | PurchaseOrderNotificationDto 
  | OrderStatusNotificationData 
  | SystemAlertNotificationData;

// Notification types enum
export enum NotificationTypes {
  PURCHASE_ORDER = 'PurchaseOrderNotification',
  ORDER_STATUS = 'OrderStatusNotification',
  SYSTEM_ALERT = 'SystemAlertNotification'
}

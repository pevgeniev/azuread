# SignalR Notification System

## Overview

This notification system has been refactored to support multiple notification types with a modular architecture. Each notification type has its own component for specialized visualization.

## Structure

```
src/app/components/signalr/
├── notification-icon.component.ts          # Main notification icon component
├── notification-icon.component.html        # Template for the notification menu
├── notification-icon.component.scss        # Styles for the notification menu
├── notification.models.ts                  # All notification type definitions
├── index.ts                                # Barrel export file
└── notification-types/                     # Individual notification components
    ├── purchase-order-notification.component.ts
    ├── purchase-order-notification.component.html
    ├── purchase-order-notification.component.scss
    └── order-status-notification.component.ts (example)
```

## Base Notification Model

All notifications must implement the `BaseNotification` interface:

```typescript
interface BaseNotification {
  notificationType: string;
  data: any[];
  timestamp: Date;
  id?: string;
}
```

## Adding a New Notification Type

1. **Define the notification data model** in `notification.models.ts`:
   ```typescript
   export interface YourNotificationData {
     title: string;
     message: string;
     // Add specific properties for your notification type
   }
   ```

2. **Add the notification type to the enum**:
   ```typescript
   export enum NotificationTypes {
     PURCHASE_ORDER = 'PurchaseOrderNotification',
     YOUR_TYPE = 'YourNotificationType'
   }
   ```

3. **Create a component** for your notification type in `notification-types/`:
   ```typescript
   @Component({
     selector: 'app-your-notification',
     // ... component configuration
   })
   export class YourNotificationComponent {
     @Input() notificationData!: YourNotificationData;
     @Input() timestamp!: Date;
     @Output() remove = new EventEmitter<void>();
   }
   ```

4. **Add the component to the main template** in `notification-icon.component.html`:
   ```html
   <app-your-notification 
     *ngIf="notification.notificationType === NotificationTypes.YOUR_TYPE"
     [notificationData]="getNotificationData(notification)"
     [timestamp]="notification.timestamp"
     (remove)="removeNotification(i)">
   </app-your-notification>
   ```

5. **Import the component** in `notification-icon.component.ts`:
   ```typescript
   import { YourNotificationComponent } from './notification-types/your-notification.component';
   
   // Add to imports array
   imports: [..., YourNotificationComponent]
   ```

## Usage Examples

### Sending a notification from the SignalR service

```typescript
// For a new notification type
const notification: BaseNotification = {
  notificationType: NotificationTypes.YOUR_TYPE,
  data: [{
    title: 'Your Title',
    message: 'Your message',
    // ... other properties
  }],
  timestamp: new Date()
};

this.signalRService.addNotification(notification);
```

### Legacy Purchase Order notifications

The system maintains backward compatibility with the existing `PurchaseOrderNotification` format. These are automatically converted to the new format.

## Benefits of the New Architecture

1. **Modularity**: Each notification type has its own component
2. **Extensibility**: Easy to add new notification types
3. **Maintainability**: Separated concerns and clean code structure
4. **Backward Compatibility**: Existing code continues to work
5. **Type Safety**: Strong typing for all notification data

## Migration Guide

If you have existing code that imports the old notification component:

**Before:**
```typescript
import { NotificationIconComponent } from './components/notification-icon.component';
```

**After:**
```typescript
import { NotificationIconComponent } from './components/signalr/notification-icon.component';
// Or use the barrel export
import { NotificationIconComponent } from './components/signalr';
```

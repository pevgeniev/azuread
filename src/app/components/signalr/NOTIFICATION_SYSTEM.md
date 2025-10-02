# SignalR Notification System

This folder contains a modular notification system that supports multiple notification types through a common interface.

## Structure

```
signalr/
├── notification.models.ts              # Base notification models and type definitions
├── notification-icon.component.ts      # Main notification icon component
├── notification-icon.component.html    # Template for notification icon
├── notification-icon.component.scss    # Styles for notification icon
├── index.ts                            # Barrel exports
└── notification-types/                 # Specific notification type components
    ├── purchase-order-notification.component.ts
    ├── purchase-order-notification.component.html
    ├── purchase-order-notification.component.scss
    └── order-status-notification.component.ts
```

## How It Works

### Base Notification Model
All notifications follow the `BaseNotification` interface:
```typescript
interface BaseNotification {
  notificationType: string;
  data: any[];
  timestamp: Date;
  id?: string;
}
```

### Notification Types
Currently supported notification types:
- `PurchaseOrderNotification` - Purchase order updates with contragent info and lead actions
- `OrderStatusNotification` - Order status changes (example implementation)
- `SystemAlertNotification` - System alerts and warnings (example implementation)

### Adding New Notification Types

1. **Define the notification data model** in `notification.models.ts`:
```typescript
export interface YourNotificationData {
  // Define your specific properties
}
```

2. **Add the type to the enum**:
```typescript
export enum NotificationTypes {
  YOUR_NOTIFICATION = 'YourNotificationType'
}
```

3. **Create a specific component** in `notification-types/`:
```typescript
@Component({
  selector: 'app-your-notification',
  // ... component definition
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
  *ngIf="notification.notificationType === NotificationTypes.YOUR_NOTIFICATION"
  [notificationData]="getNotificationData(notification)"
  [timestamp]="notification.timestamp"
  (remove)="removeNotification(i)">
</app-your-notification>
```

### Purchase Order Notifications

Purchase order notifications now work directly with the backend `PurchaseOrderNotificationDto`:

```csharp
// Backend DTO structure
public class PurchaseOrderNotificationDto {
    public string Title { get; set; }
    public string Message { get; set; }
    public PurchaseOrderProposal PurchaseOrder { get; set; }
    public DateTime Timestamp { get; set; }
    public string NotificationType { get; set; }
}

public class PurchaseOrderProposal {
    public int ContragnetId { get; set; }      // Note: Backend typo
    public string ContragnetName { get; set; }
    public int? LeadId { get; set; }
    public List<PurchaseOrderItem> Items { get; set; }
}
```

**Features:**
- ✅ **Contragent Information**: Shows contragent name and ID from `purchaseOrder.contragnetName` and `purchaseOrder.contragnetId`
- ✅ **Lead Integration**: Shows "Add to Existing Lead" button when `purchaseOrder.leadId` is present
- ✅ **Item Details**: Lists up to 3 items from `purchaseOrder.items` with quantities and prices
- ❌ **Conversation Support**: Removed (no longer supported by backend)

### SignalR Service

The SignalR service now works directly with `PurchaseOrderNotificationDto` without legacy compatibility:

```typescript
// Direct mapping - no conversion needed
this.hubConnection.on('PurchaseOrderNotification', (notification: PurchaseOrderNotificationDto) => {
  const baseNotification: BaseNotification = {
    notificationType: NotificationTypes.PURCHASE_ORDER,
    data: [notification], // Pass entire DTO
    timestamp: notification.timestamp,
    id: this.generateNotificationId()
  };
});
```

## Usage

Import the main component:
```typescript
import { NotificationIconComponent } from './components/signalr/notification-icon.component';
```

Or use the barrel export:
```typescript
import { NotificationIconComponent } from './components/signalr';
```

Add to your template:
```html
<app-notification-icon></app-notification-icon>
```

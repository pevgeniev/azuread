import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OrderStatusNotificationData } from '../notification.models';

@Component({
  selector: 'app-order-status-notification',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="order-status-notification">
      <div class="notification-header-item">
        <strong>Order Status Update</strong>
        <button 
          mat-icon-button 
          (click)="onRemove()"
          class="remove-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <p class="notification-message">{{ notificationData?.message }}</p>
      
      <div class="order-info" *ngIf="notificationData?.orderId">
        <small class="order-id">
          <mat-icon>receipt</mat-icon>
          Order ID: {{ notificationData.orderId }}
        </small>
        <span class="status-badge" [class]="'status-' + (notificationData.status || '').toLowerCase()">
          {{ notificationData.status }}
        </span>
      </div>
      
      <small class="notification-time">
        {{ formatTime(timestamp) }}
      </small>
    </div>
  `,
  styles: [`
    .order-status-notification {
      width: 100%;
    }

    .notification-header-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .notification-message {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
    }

    .order-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 8px 0 4px 0;
    }

    .order-id {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #2196f3;
      font-size: 11px;

      mat-icon {
        font-size: 14px;
        height: 14px;
        width: 14px;
      }
    }

    .status-badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;

      &.status-pending {
        background-color: #fff3cd;
        color: #856404;
      }

      &.status-confirmed {
        background-color: #d4edda;
        color: #155724;
      }

      &.status-shipped {
        background-color: #cce5ff;
        color: #004085;
      }

      &.status-delivered {
        background-color: #d1ecf1;
        color: #0c5460;
      }

      &.status-cancelled {
        background-color: #f8d7da;
        color: #721c24;
      }
    }

    .notification-time {
      color: #999;
      font-size: 11px;
      display: block;
      margin-top: 8px;
    }

    .remove-button {
      width: 24px;
      height: 24px;
      line-height: 24px;

      mat-icon {
        font-size: 16px;
        height: 16px;
        width: 16px;
      }
    }
  `]
})
export class OrderStatusNotificationComponent {
  @Input() notificationData!: OrderStatusNotificationData;
  @Input() timestamp!: Date;
  @Output() remove = new EventEmitter<void>();

  onRemove(): void {
    this.remove.emit();
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }
}

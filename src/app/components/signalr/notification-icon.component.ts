import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { SignalRService } from '../../services/signalr.service';
import { BaseNotification, NotificationTypes } from './notification.models';
import { PurchaseOrderNotificationComponent } from './notification-types/purchase-order-notification.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-icon',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    PurchaseOrderNotificationComponent
  ],
  templateUrl: './notification-icon.component.html',
  styleUrls: ['./notification-icon.component.scss']
})
export class NotificationIconComponent implements OnInit, OnDestroy {
  notifications: BaseNotification[] = [];
  unreadCount = 0;
  connectionStatus = 'Disconnected';
  
  // Expose enum to template
  readonly NotificationTypes = NotificationTypes;
  
  private subscriptions: Subscription[] = [];

  constructor(private signalRService: SignalRService) {}

  ngOnInit(): void {
    // Subscribe to notifications
    this.subscriptions.push(
      this.signalRService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
        this.unreadCount = notifications.length;
      })
    );

    // Subscribe to connection status
    this.subscriptions.push(
      this.signalRService.connectionState$.subscribe(status => {
        this.connectionStatus = status;
      })
    );

    // Start SignalR connection
    this.startConnection();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.signalRService.stopConnection();
  }

  private async startConnection(): Promise<void> {
    try {
      await this.signalRService.startConnection();
    } catch (error) {
      console.error('Failed to start SignalR connection:', error);
    }
  }

  removeNotification(index: number): void {
    this.signalRService.markNotificationAsRead(index);
  }

  clearAllNotifications(): void {
    this.signalRService.clearNotifications();
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

  getNotificationData(notification: BaseNotification): any {
    // For the new format, return the entire DTO object (first item in data array)
    return notification.data?.length > 0 ? notification.data[0] : {};
  }
}

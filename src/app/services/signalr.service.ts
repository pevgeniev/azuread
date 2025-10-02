import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';
import { 
  BaseNotification, 
  PurchaseOrderNotificationDto,
  PurchaseOrderProposal,
  PurchaseOrderItem, 
  NotificationTypes 
} from '../components/signalr/notification.models';

// Re-export for external use
export type { PurchaseOrderItem, PurchaseOrderProposal, PurchaseOrderNotificationDto };

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection?: HubConnection;
  private connectionState = new BehaviorSubject<string>('Disconnected');
  private notifications = new BehaviorSubject<BaseNotification[]>([]);

  public connectionState$ = this.connectionState.asObservable();
  public notifications$ = this.notifications.asObservable();

  constructor(private msalService: MsalService) {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    // Get the base URL for SignalR hub based on environment
    const hubUrl = this.getHubUrl();

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        withCredentials: true,
        accessTokenFactory: async () => {
          const token = await this.getAccessToken();
          console.log('SignalR access token acquired:', token ? 'Token received' : 'No token');
          return token;
        },
        skipNegotiation: false,
        transport: 1 // WebSockets
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(LogLevel.Debug)
      .build();

    this.setupEventHandlers();
  }

  private getHubUrl(): string {

    
    // For staging and production, use Azure-hosted backend
    return `${environment.backendConfig.uri}/purchaseOrderHub`;
  }

  private async getAccessToken(): Promise<string> {
    try {
      console.log('Acquiring access token for SignalR...');
      
      // Get the current account
      const activeAccount = this.msalService.instance.getActiveAccount();
      if (!activeAccount) {
        console.warn('No active account found for SignalR authentication');
        return '';
      }

      console.log('Active account found:', activeAccount.username);

      // Request token silently
      const tokenRequest = {
        scopes: environment.backendConfig.scopes,
        account: activeAccount
      };

      console.log('Token request scopes:', tokenRequest.scopes);

      const response: AuthenticationResult = await this.msalService.instance.acquireTokenSilent(tokenRequest);
      console.log('Token acquired successfully for SignalR');
      return response.accessToken;
    } catch (error) {
      console.error('Failed to acquire access token for SignalR:', error);
      
      // Try interactive token acquisition as fallback
      try {
        console.log('Attempting interactive token acquisition...');
        const interactiveRequest = {
          scopes: environment.backendConfig.scopes,
        };
        const response: AuthenticationResult = await this.msalService.instance.acquireTokenPopup(interactiveRequest);
        console.log('Interactive token acquired successfully');
        return response.accessToken;
      } catch (interactiveError) {
        console.error('Interactive token acquisition also failed:', interactiveError);
        return '';
      }
    }
  }

  private setupEventHandlers(): void {
    if (!this.hubConnection) return;

    // Handle connection state changes
    this.hubConnection.onclose(() => {
      this.connectionState.next('Disconnected');
      console.log('SignalR connection closed');
    });

    this.hubConnection.onreconnecting(() => {
      this.connectionState.next('Reconnecting');
      console.log('SignalR connection reconnecting');
    });

    this.hubConnection.onreconnected(() => {
      this.connectionState.next('Connected');
      console.log('SignalR connection reconnected');
    });

    // Handle purchase order notifications
    this.hubConnection.on('PurchaseOrderNotification', (notification: PurchaseOrderNotificationDto) => {
      console.log('Received purchase order notification:', notification);
      
      // Add timestamp if not present or convert to Date
      if (typeof notification.timestamp === 'string') {
        notification.timestamp = new Date(notification.timestamp);
      }
      
      // Convert new DTO format to BaseNotification format
      const baseNotification: BaseNotification = {
        notificationType: NotificationTypes.PURCHASE_ORDER,
        data: [notification], // Pass the entire DTO as data
        timestamp: notification.timestamp,
        id: this.generateNotificationId()
      };
      
      // Add to notifications list
      const currentNotifications = this.notifications.value;
      this.notifications.next([baseNotification, ...currentNotifications]);
    });
  }

  public async startConnection(): Promise<void> {
    if (!this.hubConnection) {
      this.initializeConnection();
    }

    try {
      if (this.hubConnection?.state === 'Disconnected') {
        this.connectionState.next('Connecting');
        console.log('Attempting to start SignalR connection to:', this.getHubUrl());
        await this.hubConnection.start();
        this.connectionState.next('Connected');
        console.log('SignalR connection started successfully');
      }
    } catch (error) {
      this.connectionState.next('Disconnected');
      console.error('Error starting SignalR connection:', error);
      throw error;
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.connectionState.next('Disconnected');
      console.log('SignalR connection stopped');
    }
  }

  public async joinGroup(groupName: string): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      await this.hubConnection.invoke('JoinGroup', groupName);
      console.log(`Joined group: ${groupName}`);
    }
  }

  public async leaveGroup(groupName: string): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      await this.hubConnection.invoke('LeaveGroup', groupName);
      console.log(`Left group: ${groupName}`);
    }
  }

  public clearNotifications(): void {
    this.notifications.next([]);
  }

  public markNotificationAsRead(index: number): void {
    const currentNotifications = this.notifications.value;
    if (index >= 0 && index < currentNotifications.length) {
      currentNotifications.splice(index, 1);
      this.notifications.next([...currentNotifications]);
    }
  }

  public getUnreadCount(): Observable<number> {
    return new Observable(observer => {
      this.notifications$.subscribe(notifications => {
        observer.next(notifications.length);
      });
    });
  }

  private generateNotificationId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Method to add generic notifications programmatically
  public addNotification(notification: BaseNotification): void {
    if (!notification.timestamp) {
      notification.timestamp = new Date();
    }
    if (!notification.id) {
      notification.id = this.generateNotificationId();
    }
    
    const currentNotifications = this.notifications.value;
    this.notifications.next([notification, ...currentNotifications]);
  }
}

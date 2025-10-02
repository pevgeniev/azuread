import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, throwError } from 'rxjs';
import { PurchaseOrderNotificationDto } from '../notification.models';
import { LeadService } from '../../../backend/api/lead.service';
import { PurchaseOrderService } from '../../../backend/api/purchaseOrder.service';
import { ApiSnackbarService } from '../../../services/api-snackbar.service';
import { LeadDto } from '../../../backend/model/leadDto';
import { LeadStatus } from 'src/app/backend';

@Component({
  selector: 'app-purchase-order-notification',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './purchase-order-notification.component.html',
  styleUrls: ['./purchase-order-notification.component.scss']
})
export class PurchaseOrderNotificationComponent {
  @Input() notificationData!: PurchaseOrderNotificationDto;
  @Input() timestamp!: Date;
  @Output() remove = new EventEmitter<void>();

  isLoading = false;

  constructor(
    private router: Router,
    private leadService: LeadService,
    private purchaseOrderService: PurchaseOrderService,
    private apiSnackbar: ApiSnackbarService
  ) {}

  onRemove(): void {
    this.remove.emit();
  }

  onOpenLead(): void {
    if (this.notificationData?.purchaseOrder?.leadId) {
      console.log('Navigating to lead:', this.notificationData.purchaseOrder.leadId);
      
      // Navigate to the specific lead using fragment-based routing
      this.router.navigate(['/leads'], {
        fragment: this.notificationData.purchaseOrder.leadId.toString()
      });
    }
  }

  onAddToLead(): void {
    if (this.notificationData?.purchaseOrder?.leadId) {
      // Existing lead - add items to it
      this.addItemsToLead(this.notificationData.purchaseOrder.leadId);
    } else {
      // No lead - create new lead and add items
      this.createLeadAndAddItems();
    }
  }

  private createLeadAndAddItems(): void {
    if (!this.notificationData?.purchaseOrder?.items || 
        !this.notificationData?.purchaseOrder?.contragnetId || 
        !this.notificationData?.purchaseOrder?.contragnetName) {
      // For simple error display, use a rejected observable
      this.apiSnackbar.handleCustom(
        throwError(() => new Error('Insufficient data')),
        '',
        'Insufficient data to create lead. Missing contragent information.'
      ).subscribe();
      return;
    }

    this.isLoading = true;

    // Create new lead
    const newLead: LeadDto = {
      contragentId: this.notificationData.purchaseOrder.contragnetId,      
      startDate: new Date(),
      status: LeadStatus.NUMBER_1, // InProgress
      // Add other required fields as needed
    };

    this.apiSnackbar.handleApiCall(
      this.leadService.apiLeadPost(newLead),
      'lead',
      'Lead created successfully',
      {
        showSuccess: false, // Don't show success yet, we have more work to do
        customErrorMessage: 'Failed to create new lead'
      }
    ).subscribe({
      next: (createdLead: LeadDto) => {
        if (createdLead.id) {
          // Now add items to the newly created lead
          this.addItemsToLead(createdLead.id, true);
        } else {
          this.isLoading = false;
          this.apiSnackbar.handleCustom(
            throwError(() => new Error('No lead ID')),
            '',
            'Created lead but no ID returned'
          ).subscribe();
        }
      },
      error: () => {
        this.isLoading = false;
        // Error is handled by ApiSnackbarService
      }
    });
  }

  private addItemsToLead(leadId: number, isNewlyCreated: boolean = false): void {
    if (!this.notificationData?.purchaseOrder?.items) {
      this.isLoading = false;
      return;
    }

    // Set loading state if not already set (for existing leads)
    if (!isNewlyCreated) {
      this.isLoading = true;
    }

    const successMessage = isNewlyCreated 
      ? `Successfully created lead and added ${this.notificationData.purchaseOrder.items.length} items`
      : `Successfully added ${this.notificationData.purchaseOrder.items.length} items to lead`;

    const errorMessage = isNewlyCreated 
      ? 'Lead created but failed to add items'
      : 'Failed to add items to lead';

    this.apiSnackbar.handleApiCall(
      this.purchaseOrderService.apiPurchaseOrderLeadIdPost(leadId, this.notificationData.purchaseOrder.items),
      'purchase order items',
      successMessage,
      {
        showSuccess: true,
        customErrorMessage: errorMessage
      }
    ).subscribe({
      next: () => {
        this.isLoading = false;
        // Navigate to the lead to show the updated items
        // Force refresh by navigating away and back, or reload if already on the same route
        const currentUrl = this.router.url;
        const targetUrl = `/leads#${leadId}`;
        
        if (currentUrl.includes('/leads') && currentUrl.includes(`#${leadId}`)) {
          // Already on the target lead page, force reload
          window.location.reload();
        } else {
          // Navigate to the lead normally
          this.router.navigate(['/leads'], {
            fragment: leadId.toString()
          });
        }
        // Remove the notification since action was successful
        this.onRemove();
      },
      error: () => {
        this.isLoading = false;
        // Error is handled by ApiSnackbarService
      }
    });
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

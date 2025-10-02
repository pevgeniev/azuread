import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SnackbarData } from '../services/snackbar.service';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="snackbar-container" 
         (mouseenter)="onMouseEnter()" 
         (mouseleave)="onMouseLeave()">
      <div class="snackbar-content">
        <mat-icon class="snackbar-icon">
          {{ data.type === 'success' ? 'check_circle' : 'error' }}
        </mat-icon>
        <div class="snackbar-message">
          <div *ngIf="data.customMessage" class="custom-message">{{ data.customMessage }}</div>
          <div class="main-message">{{ data.message }}</div>
        </div>
        <button 
          mat-icon-button 
          class="snackbar-close" 
          (click)="dismiss()"
          aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .snackbar-container {
      display: flex;
      align-items: center;
      width: 100%;
      min-height: 48px;
      cursor: pointer;
      transition: opacity 0.2s ease;
    }

    .snackbar-container:hover {
      opacity: 0.95;
    }

    .snackbar-content {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 12px;
    }

    .snackbar-icon {
      flex-shrink: 0;
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: inherit;
    }

    .snackbar-message {
      flex: 1;
      line-height: 1.4;
    }

    .custom-message {
      font-weight: 500;
      margin-bottom: 2px;
    }

    .main-message {
      color: inherit;
    }

    .snackbar-close {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      color: inherit;
    }

    .snackbar-close mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Global styles for the snackbar container */
    :host ::ng-deep .snackbar-success {
      background-color: #d4edda;
      color: #155724;
      border-left: 4px solid #28a745;
    }

    :host ::ng-deep .snackbar-error {
      background-color: #f8d7da;
      color: #721c24;
      border-left: 4px solid #dc3545;
    }

    :host ::ng-deep .custom-snackbar {
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: 'Roboto', sans-serif;
    }
  `]
})
export class SnackbarComponent implements OnInit, OnDestroy {
  private dismissTimeout: any;
  private isHovered = false;

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: SnackbarData,
    private snackBarRef: MatSnackBarRef<SnackbarComponent>
  ) {}

  ngOnInit(): void {
    console.log('SnackbarComponent initialized with data:', this.data);
    this.startDismissTimer();
  }

  onMouseEnter(): void {
    console.log('Mouse entered snackbar');
    this.isHovered = true;
    this.clearDismissTimer();
  }

  onMouseLeave(): void {
    console.log('Mouse left snackbar');
    this.isHovered = false;
    this.startDismissTimer();
  }

  private startDismissTimer(): void {
    if (this.isHovered) {
      console.log('Not starting timer - snackbar is hovered');
      return;
    }
    
    const duration = this.data.type === 'error' ? 6000 : 4000;
    console.log(`Starting dismiss timer for ${duration}ms (type: ${this.data.type})`);
    
    this.dismissTimeout = setTimeout(() => {
      if (!this.isHovered) {
        console.log('Auto-dismissing snackbar');
        this.dismiss();
      } else {
        console.log('Not dismissing - snackbar is hovered');
      }
    }, duration);
  }

  private clearDismissTimer(): void {
    if (this.dismissTimeout) {
      console.log('Clearing dismiss timer');
      clearTimeout(this.dismissTimeout);
      this.dismissTimeout = null;
    }
  }

  dismiss(): void {
    this.clearDismissTimer();
    this.snackBarRef.dismiss();
  }

  ngOnDestroy(): void {
    this.clearDismissTimer();
  }
}

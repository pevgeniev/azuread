import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../components/snackbar.component';

export interface ApiError {
  message?: string;
  error?: {
    message?: string;
  };
}

export interface SnackbarData {
  message: string;
  type: 'success' | 'error';
  customMessage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private defaultConfig: MatSnackBarConfig = {
    duration: 0, // Disable automatic dismissal - let our component handle it
    horizontalPosition: 'center',
    verticalPosition: 'top',
    panelClass: ['custom-snackbar']
  };

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Show a success snackbar
   * @param message - Main message to display
   * @param customMessage - Optional custom message to append
   */
  showSuccess(message: string, customMessage?: string): void {
    this.show({
      message,
      type: 'success',
      customMessage
    });
  }

  /**
   * Show an error snackbar
   * @param message - Main message to display
   * @param customMessage - Optional custom message to append
   */
  showError(message: string, customMessage?: string): void {
    this.show({
      message,
      type: 'error',
      customMessage
    });
  }

  /**
   * Show error from API response
   * @param error - API error response
   * @param customMessage - Optional custom message to prepend
   */
  showApiError(error: any, customMessage?: string): void {
    const errorMessage = this.extractErrorMessage(error);
    this.show({
      message: errorMessage,
      type: 'error',
      customMessage
    });
  }

  /**
   * Show success for API operations
   * @param operation - The operation that was successful (e.g., 'created', 'updated', 'deleted')
   * @param entity - The entity that was affected (e.g., 'lead', 'shipment')
   * @param customMessage - Optional custom message
   */
  showApiSuccess(operation: string, entity?: string, customMessage?: string): void {
    const message = entity 
      ? `${entity.charAt(0).toUpperCase() + entity.slice(1)} ${operation} successfully`
      : `Operation ${operation} successfully`;
    
    this.show({
      message,
      type: 'success',
      customMessage
    });
  }

  private show(data: SnackbarData): void {
    const config = {
      ...this.defaultConfig,
      data,
      panelClass: [`custom-snackbar`, `snackbar-${data.type}`]
    };

    this.snackBar.openFromComponent(SnackbarComponent, config);
  }

  /**
   * Extract error message from various error response formats
   */
  private extractErrorMessage(error: any): string {
    // Handle HTTP error responses
    if (error?.error) {
      // Check for server error response with message
      if (typeof error.error === 'object' && error.error.message) {
        return error.error.message;
      }
      
      // Check for string error message
      if (typeof error.error === 'string') {
        try {
          const parsed = JSON.parse(error.error);
          if (parsed.message) return parsed.message;
        } catch {
          return error.error;
        }
      }
    }

    // Check for direct error message
    if (error?.message) {
      return error.message;
    }

    // Check for status text
    if (error?.statusText) {
      return error.statusText;
    }

    // Default fallback
    return 'An unexpected error occurred';
  }

  /**
   * Close all open snackbars
   */
  dismiss(): void {
    this.snackBar.dismiss();
  }
}

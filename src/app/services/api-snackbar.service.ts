import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { SnackbarService } from './snackbar.service';

/**
 * Service to wrap API calls with automatic snackbar notifications
 */
@Injectable({
  providedIn: 'root'
})
export class ApiSnackbarService {

  constructor(private snackbarService: SnackbarService) {}

  /**
   * Wrap an API call to show success/error snackbars automatically
   * @param apiCall - The observable API call
   * @param successConfig - Configuration for success message
   * @param errorConfig - Configuration for error message
   * @returns The original observable with snackbar side effects
   */
  wrapApiCall<T>(
    apiCall: Observable<T>,
    successConfig?: {
      message?: string;
      operation?: string;
      entity?: string;
      customMessage?: string;
      showSuccess?: boolean; // Default: true
    },
    errorConfig?: {
      customMessage?: string;
      showError?: boolean; // Default: true
    }
  ): Observable<T> {
    const showSuccess = successConfig?.showSuccess !== false;
    const showError = errorConfig?.showError !== false;

    return apiCall.pipe(
      tap({
        next: (response) => {
          if (showSuccess) {
            if (successConfig?.message) {
              this.snackbarService.showSuccess(successConfig.message, successConfig.customMessage);
            } else if (successConfig?.operation) {
              this.snackbarService.showApiSuccess(
                successConfig.operation,
                successConfig.entity,
                successConfig.customMessage
              );
            } else {
              // Default success message
              this.snackbarService.showSuccess('Operation completed successfully', successConfig?.customMessage);
            }
          }
        },
        error: (error) => {
          if (showError) {
            this.snackbarService.showApiError(error, errorConfig?.customMessage);
          }
        }
      }),
      catchError((error) => {
        // Don't show success message on error, just propagate the error
        return throwError(() => error);
      })
    );
  }

  /**
   * Universal method to handle API calls with automatic verb detection
   * @param apiCall - The HTTP observable (should have method property or be identifiable)
   * @param entity - The entity name for success messages
   * @param customMessage - Optional custom success message
   * @param options - Additional options
   */
  handleApiCall<T>(
    apiCall: Observable<T>,
    entity: string = 'item',
    customMessage?: string,
    options?: {
      showSuccess?: boolean;
      showError?: boolean;
      customErrorMessage?: string;
    }
  ): Observable<T> {
    // Try to detect the HTTP method from the observable or its source
    const operation = this.detectHttpOperation(apiCall, customMessage);
    
    return this.wrapApiCall(
      apiCall,
      { 
        operation, 
        entity, 
        customMessage,
        showSuccess: options?.showSuccess
      },
      { 
        customMessage: options?.customErrorMessage,
        showError: options?.showError
      }
    );
  }

  /**
   * Detect HTTP operation from observable or fallback to generic message
   */
  private detectHttpOperation<T>(apiCall: Observable<T>, customMessage?: string): string {
    // If custom message is provided, we'll use a generic operation
    if (customMessage) {
      return 'processed';
    }

    // Try to extract method from the observable's source
    // This works for Angular HttpClient observables
    const source = (apiCall as any).source;
    if (source && source.method) {
      switch (source.method.toLowerCase()) {
        case 'post': return 'created';
        case 'put': return 'updated';
        case 'patch': return 'updated';
        case 'delete': return 'deleted';
        default: return 'processed';
      }
    }

    // Check if the observable has any identifying properties
    const observable = apiCall as any;
    if (observable.method) {
      switch (observable.method.toLowerCase()) {
        case 'post': return 'created';
        case 'put': return 'updated';
        case 'patch': return 'updated';
        case 'delete': return 'deleted';
        default: return 'processed';
      }
    }

    // Fallback to generic operation
    return 'processed';
  }

  /**
   * For operations where you only want error handling
   */
  handleErrorOnly<T>(
    apiCall: Observable<T>,
    customErrorMessage?: string
  ): Observable<T> {
    return this.wrapApiCall(
      apiCall,
      { showSuccess: false },
      { customMessage: customErrorMessage }
    );
  }

  /**
   * For operations where you want custom success/error messages
   */
  handleCustom<T>(
    apiCall: Observable<T>,
    successMessage: string,
    errorMessage?: string
  ): Observable<T> {
    return this.wrapApiCall(
      apiCall,
      { message: successMessage },
      { customMessage: errorMessage }
    );
  }
}

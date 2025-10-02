# Common Snackbar System

This document describes the common snackbar system implemented for the External Market application to provide consistent user feedback for API operations.

## Components

### 1. SnackbarService (`/services/snackbar.service.ts`)
The core service that provides methods to show success and error messages.

**Key Methods:**
- `showSuccess(message, customMessage?)` - Show a success message
- `showError(message, customMessage?)` - Show an error message  
- `showApiError(error, customMessage?)` - Show error from API response
- `showApiSuccess(operation, entity?, customMessage?)` - Show success for API operations

### 2. ApiSnackbarService (`/services/api-snackbar.service.ts`)
A wrapper service that automatically handles API responses with snackbar notifications.

**Key Methods:**
- `handlePost(apiCall, entity, customMessage?)` - Handle POST operations
- `handlePut(apiCall, entity, customMessage?)` - Handle PUT operations  
- `handleDelete(apiCall, entity, customMessage?)` - Handle DELETE operations
- `handleCustom(apiCall, successMessage, errorMessage?)` - Custom messages
- `wrapApiCall(apiCall, successConfig, errorConfig)` - Full configuration

### 3. SnackbarComponent (`/components/snackbar.component.ts`)
The visual component that displays the actual snackbar with Material Design styling.

**Features:**
- Success messages: Light green background with check icon
- Error messages: Light red background with error icon
- Center-top positioning
- Auto-dismiss (4s for success, 6s for errors)
- Manual close button

## Styling

The snackbars are styled with:
- **Success**: Light green background (#d4edda) with green border (#28a745)
- **Error**: Light red background (#f8d7da) with red border (#dc3545)
- **Position**: Top-center of the screen
- **Design**: Material Design with custom colors and rounded corners

Global styles are defined in `/src/styles.scss` under the "Custom Snackbar Styles" section.

## Usage Examples

### Basic Usage with SnackbarService

```typescript
import { SnackbarService } from '../services/snackbar.service';

constructor(private snackbar: SnackbarService) {}

// Show success message
this.snackbar.showSuccess('Operation completed successfully');

// Show error message  
this.snackbar.showError('Something went wrong');

// Show API error with custom message
this.snackbar.showApiError(error, 'Failed to save data');
```

### Recommended Usage with ApiSnackbarService

```typescript
import { ApiSnackbarService } from '../services/api-snackbar.service';

constructor(private apiSnackbar: ApiSnackbarService) {}

// Handle POST operation
this.apiSnackbar.handlePost(
  this.leadService.apiLeadDetailsDeliveryPost([newDetail]),
  'lead detail',
  'New lead detail created successfully'
).subscribe({
  next: () => {
    // Handle success (snackbar shown automatically)
  }
  // Error handling is automatic
});

// Handle PUT operation  
this.apiSnackbar.handlePut(
  this.leadService.apiLeadDetailsUpsertPut([detail]),
  'lead detail',
  'Lead detail updated successfully'
).subscribe({
  next: () => {
    // Handle success
  }
});

// Handle DELETE operation
this.apiSnackbar.handleDelete(
  this.leadService.apiLeadDetailsDelete(id),
  'lead detail',
  'Lead detail deleted successfully'
).subscribe({
  next: () => {
    // Handle success
  }
});

// Custom messages
this.apiSnackbar.handleCustom(
  this.leadService.apiLeadShipmentsSendPut(shipmentIds),
  'Shipments sent successfully',
  'Failed to send shipments'
).subscribe({
  next: () => {
    // Handle success
  }
});
```

## Configuration

The snackbar is configured in `/src/app/app.config.ts` with:
```typescript
import { MatSnackBarModule } from '@angular/material/snack-bar';

// In importProvidersFrom:
MatSnackBarModule
```

## Error Message Extraction

The snackbar service automatically extracts error messages from various response formats:
- `error.error.message` - Server error responses
- `error.message` - Direct error messages
- `error.statusText` - HTTP status text
- Fallback: "An unexpected error occurred"

This handles the ErrorController format from the backend that returns:
```json
{
  "message": "Your custom error message"
}
```

## Migration Guide

To migrate existing API calls to use the snackbar:

### Before:
```typescript
this.leadService.apiLeadDetailsDeliveryPost([newChild]).subscribe({
  next: () => {
    // Success handling
  },
  error: (error) => {
    console.error('Failed to add child row:', error);
    alert(this.getErrorMessage(error));
  }
});
```

### After:
```typescript
this.apiSnackbar.handlePost(
  this.leadService.apiLeadDetailsDeliveryPost([newChild]),
  'delivery detail',
  'New lead detail created successfully'
).subscribe({
  next: () => {
    // Success handling (no alert needed)
  }
  // Error handling is automatic
});
```

## Benefits

1. **Consistent UI**: All API responses use the same visual feedback system
2. **Better UX**: Replace intrusive `alert()` dialogs with elegant snackbars
3. **Automatic Error Handling**: No need to manually extract error messages
4. **Customizable**: Support for custom success/error messages
5. **Material Design**: Consistent with Angular Material design system
6. **Accessible**: Proper ARIA labels and keyboard support
7. **Mobile Friendly**: Responsive design that works on all screen sizes

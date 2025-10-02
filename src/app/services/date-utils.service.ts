import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {

  /**
   * Converts UTC date string to local time Date object
   * When you receive a UTC date string from the server (e.g., "2024-12-25T14:30:00Z"),
   * this method creates a Date object that represents the same moment in the user's local timezone.
   * 
   * Example: 
   * - Server sends: "2024-12-25T14:30:00Z" (2:30 PM UTC)
   * - If user is in GMT+2, this becomes: Wed Dec 25 2024 16:30:00 GMT+0200 (4:30 PM local)
   * 
   * @param utcDateString - UTC date string from server
   * @returns Date object representing the local time, or null if invalid
   */
  convertUtcToLocal(utcDateString: string | Date | null | undefined): Date | null {
    if (!utcDateString) {
      return null;
    }
    
    try {
      // Handle Date type - assume it's already in the correct timezone
      if (utcDateString instanceof Date) {
        return utcDateString;
      }
      
      // Handle string type - ensure it's treated as UTC and convert to local
      let utcDate: Date;
      
      // If the string already has 'Z' suffix, it's explicitly UTC
      if (utcDateString.includes('Z')) {
        utcDate = new Date(utcDateString);
      } else {
        // If no 'Z' suffix, assume it's UTC and add 'Z' to make it explicit
        utcDate = new Date(utcDateString + 'Z');
      }
      
      // Check if the date is valid
      if (isNaN(utcDate.getTime())) {
        throw new Error('Invalid date');
      }
      
      // JavaScript Date constructor automatically converts UTC to local time
      // The resulting Date object shows local time when displayed
      return utcDate;
      
    } catch (error) {
      console.warn('Failed to parse date:', utcDateString, error);
      return null;
    }
  }

  /**
   * Formats a UTC date string to local time string with custom format
   * @param utcDateString - UTC date string from server
   * @param format - Format string (e.g., 'dd.MM.yyyy', 'dd.MM.yyyy HH:mm:ss')
   * @returns Formatted local date string
   */
  formatLocalDate(utcDateString: string | Date | null | undefined, format: string = 'dd.MM.yyyy HH:mm:ss'): string {
    const localDate = this.convertUtcToLocal(utcDateString);
    if (!localDate) {
      return 'Invalid Date';
    }
    
    return this.formatDateWithCustomFormat(localDate, format);
  }

  /**
   * Formats local date for short display (dd.MM.yyyy HH:mm)
   */
  formatLocalDateShort(utcDateString: string | Date | null | undefined): string {
    return this.formatLocalDate(utcDateString, 'dd.MM.yyyy HH:mm');
  }

  /**
   * Formats local date for full display (dd.MM.yyyy HH:mm:ss)
   */
  formatLocalDateFull(utcDateString: string | Date | null | undefined): string {
    return this.formatLocalDate(utcDateString, 'dd.MM.yyyy HH:mm:ss');
  }

  /**
   * Custom date formatter that handles our specific format requirements
   * @param date - Date object to format
   * @param format - Format string
   * @returns Formatted date string
   */
  private formatDateWithCustomFormat(date: Date, format: string): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    let result = format;

    // Handle year formats
    if (format.includes('yyyy')) {
      result = result.replace('yyyy', year);
    } else if (format.includes('yy')) {
      result = result.replace('yy', year.slice(-2));
    }

    // Handle month formats
    if (format.includes('MMMM')) {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      result = result.replace('MMMM', monthNames[date.getMonth()]);
    } else if (format.includes('MMM')) {
      const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      result = result.replace('MMM', monthAbbr[date.getMonth()]);
    } else if (format.includes('MM')) {
      result = result.replace('MM', month);
    } else if (format.includes('M')) {
      result = result.replace('M', (date.getMonth() + 1).toString());
    }

    // Handle day formats
    if (format.includes('dd')) {
      result = result.replace('dd', day);
    } else if (format.includes('d')) {
      result = result.replace('d', date.getDate().toString());
    }

    // Handle hour formats
    if (format.includes('HH')) {
      result = result.replace('HH', hours);
    } else if (format.includes('hh')) {
      const hour12 = date.getHours() % 12 || 12;
      result = result.replace('hh', hour12.toString().padStart(2, '0'));
    } else if (format.includes('H')) {
      result = result.replace('H', date.getHours().toString());
    } else if (format.includes('h')) {
      const hour12 = date.getHours() % 12 || 12;
      result = result.replace('h', hour12.toString());
    }

    // Handle minute formats
    if (format.includes('mm')) {
      result = result.replace('mm', minutes);
    } else if (format.includes('m')) {
      result = result.replace('m', date.getMinutes().toString());
    }

    // Handle second formats
    if (format.includes('ss')) {
      result = result.replace('ss', seconds);
    } else if (format.includes('s')) {
      result = result.replace('s', date.getSeconds().toString());
    }

    return result;
  }
}

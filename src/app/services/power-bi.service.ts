import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Interface for embedded report view model
export interface EmbeddedReportViewModel {
  id?: string;
  name?: string;
  reportType?: string;
  webUrl?: string;
  embedUrl?: string;
  datasetId?: string;
  token?: string;
}

// Interface for token response
interface TokenResponse {
  token: string;
  tokenId: string;
  expiration: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PowerBiService {
  private readonly powerBiServiceApiRoot: string;

  constructor(private http: HttpClient) {
    // Configure PowerBI service URL and base API URL
    this.powerBiServiceApiRoot = 'https://api.powerbi.com';
  }

  /**
   * Gets a PowerBI report with embedding data
   * @param reportId The GUID of the PowerBI report
   * @returns Observable<EmbeddedReportViewModel> The embedded report view model
   */
  public getReport(reportId: string): Observable<EmbeddedReportViewModel> {
     return this.http.get<EmbeddedReportViewModel>(
          `${this.powerBiServiceApiRoot}/v1.0/myorg/reports/${reportId}`
        ).pipe(
        map((report:EmbeddedReportViewModel) => { 
              return report
        })
      , catchError(this.handleError)
    );
  }

  /**
   * Gets a PowerBI report with embedding data
   * @param reportId The GUID of the PowerBI report
   * @returns Observable<EmbeddedReportViewModel> The embedded report view model
   */
  public getReportEndGenerateToken(reportId: string): Observable<EmbeddedReportViewModel> {
     return this.http.get<EmbeddedReportViewModel>(
          `${this.powerBiServiceApiRoot}/v1.0/myorg/reports/${reportId}`
        ).pipe(
        switchMap(report => 
          this.http.post<TokenResponse>(
            `${this.powerBiServiceApiRoot}/v1.0/myorg/GenerateToken`,
            {
              datasets: [{
                id: report.datasetId!
              }],
              reports: [{
                id: reportId
              }]
            }
          ).pipe
          (
            map((embd:TokenResponse) => { 
              return {
              ...report,
              token: embd.token
            }})
          )
        )
      , catchError(this.handleError)
    );
  }

  /**
   * Error handler for HTTP requests
   * @param error The error response
   * @returns Observable that throws an error
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error('PowerBI Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

import { HttpClient, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, catchError, map } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-file-upload',
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressBarModule
  ],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent implements OnInit, OnDestroy {
  selectedFile: File | null = null;
  progress = 0;
  isUploading = false;
  uploadUrl = 'https://your-api-endpoint.com/upload'; // Replace with your backend API endpoint
  
  recordId?: string | null;
  recordType?: string | null;
  
  subs: Subscription[] = [];
  
  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() 
  { 
    this.subs.push(
      this.route.queryParamMap.subscribe(params => {
        this.recordId = params.get('id');
        this.recordType = params.get('type');
      })
    );
  } 
  
  ngOnDestroy() { 
    this.subs.forEach(s => s.unsubscribe()); 
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onUpload(): void {
    if (!this.selectedFile) {
      alert('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.isUploading = true;
    this.http.post(this.uploadUrl, formData, {
      headers: new HttpHeaders(),
      observe: 'events',
      reportProgress: true
    }).pipe(
      map(event => this.handleUploadProgress(event)),
      catchError(error => {
        console.error('Upload failed:', error);
        this.isUploading = false;
        return [];
      })
    ).subscribe();
  }

  handleUploadProgress(event: any): void {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        if (event.total) {
          this.progress = Math.round(100 * (event.loaded / event.total));
        }
        break;
      case HttpEventType.Response:
        if (event instanceof HttpResponse) {
          console.log('File successfully uploaded!', event.body);
          this.isUploading = false;
        }
        break;
    }
  }
}

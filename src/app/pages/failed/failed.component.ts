import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'login-failed',
  imports: [
      CommonModule,
      MatGridListModule
  ],
  templateUrl: './failed.component.html',
  styleUrl: './failed.component.scss'
})
export class FailedComponent {}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Echo, EchoService } from 'src/app/backend';

@Component({
  selector: 'app-power-user-page',
  templateUrl: './power-user.page.component.html',
  styleUrls: ['./power-user.page.component.css'],
  imports: [CommonModule, MatListModule ]
})
export class PowerUserPageComponent implements OnInit {

  userEchos: Array<Echo> = []
  isLoading = false;
  
  constructor(private echoService: EchoService) {
    
  }

  loadEchos(){
    this.isLoading = true;
    this.echoService.getUserEcho().subscribe(echos =>{
      this.userEchos = echos;
      this.isLoading = false;
    },
    err =>{
      this.isLoading = false;
    });
  }
  ngOnInit() {
    this.loadEchos();
  }
  onAddEcho(){
    this.isLoading = true;
    this.echoService.addUserEcho()
      .subscribe(res => {
        this.loadEchos();
      },
      err =>{
        this.isLoading = false;
      });
  }
}

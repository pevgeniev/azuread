import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Echo, EchoService } from 'src/app/backend';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin.page.component.html',
  styleUrls: ['./admin.page.component.css'],
  imports: [CommonModule, MatListModule ]
})
export class AdminPageComponent implements OnInit {

  allEchos: Array<Echo> = []
   isLoading = false;
   
   constructor(private echoService: EchoService) {
     
   }
 
   loadEchos(){
     this.isLoading = true;
     this.echoService.getAdminEcho().subscribe(echos =>{
       this.allEchos = echos;
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
      this.echoService.addAdminEcho()
        .subscribe(res => {
          this.loadEchos();
       },
       err =>{
          this.isLoading = false;
       });
   }
}

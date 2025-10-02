import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SafePipe } from 'src/app/services/safe.pipe';
import { PowerBIEmbedModule } from 'powerbi-client-angular';
import { IReportEmbedConfiguration, models, Report, service, Embed } from 'powerbi-client';
import { PowerBIReportEmbedComponent } from 'powerbi-client-angular';
import { getParams } from 'src/app/services/urlparams';
import { EmbeddedReportViewModel, PowerBiService } from 'src/app/services/power-bi.service';
import { MsalService } from '@azure/msal-angular';
import { environment } from 'src/environments/environment';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

@Component({
    standalone: true,
    selector: 'app-power-bi-report',
    templateUrl: './power-bi-report.component.html',
    styleUrls: ['./power-bi-report.component.scss'],
    imports: [CommonModule, SafePipe, PowerBIEmbedModule]
})
export class PowerBIReportComponent implements OnInit, AfterViewInit {

  //@ViewChild('power-bi-frame', { read: ElementRef, static:false }) powerBiContainer!: ElementRef<HTMLIFrameElement>;
  @ViewChild(PowerBIReportEmbedComponent) reportObj!: PowerBIReportEmbedComponent;

  public linkReport: string = '';
  public reportId: string = '';
  pageName: string = '';
  public reportConfig: IReportEmbedConfiguration | null = null;
  public report: Report | null = null;
  public reportName?: string;
  public dataSetId?: string;
  public usePowerBiControl: boolean = true;

  public eventHandlersMap = new Map ([
    ['loaded', async () => {
        this.initReport();
      },
    ],
    ['rendered', () => console.log('Report has rendered')],
    ['error', (event?: service.ICustomEvent<any>) => {
        if (event) {
          console.error(event.detail);
        }
      },
    ],
    ['visualClicked', () => console.log('visual clicked')],
    ['pageChanged', (event) => console.log(event)],
  ]) as Map<string, (event?: service.ICustomEvent<any>, embeddedEntity?: Embed) => void | null>;
  
  constructor(
    private route: ActivatedRoute,
    private powerBiSvc: PowerBiService,
    private msalService: MsalService
  ) {
  }

  ngOnInit(): void {
    const that = this;
    this.route.data.subscribe(d => {
      this.linkReport = (d as any).report;
      this.pageName = (d as any).page;
      const mapUrlParams = getParams(this.linkReport);
      this.reportId = mapUrlParams.get('reportid') || '';

      this.powerBiSvc.getReport(this.reportId).subscribe(
        (report: EmbeddedReportViewModel) => {
            this.reportName = report.name;
            //this.dataSetId = report.datasetId;

            const getNewAccessToken = async () => {
              const token = await that.getAccessTokenPowerBI();
              return token;
            }
            const setPowerBiReport = (token:string) => {
              that.reportConfig = {
                  type: "report",
                  id: this.reportId,
                  embedUrl: report.embedUrl,
                  accessToken: token,
                  tokenType: models.TokenType.Aad,
                  settings: {
                      panes: {
                          filters: {
                              expanded: false,
                              visible: false
                          }
                      },
                      background: models.BackgroundType.Transparent,
                      filterPaneEnabled: false,
                      navContentPaneEnabled: false,
                      layoutType: models.LayoutType.Master,
                  },eventHooks: {
                    accessTokenProvider: getNewAccessToken
                  }
                };  
            }

            this.getAccessTokenPowerBI()
              .then(function (token) {
                if(token){
                  setPowerBiReport(token);
                }else{
                  that.usePowerBiControl = false;
                }
              })
              .catch(function (error) {
                console.log(error);
                that.usePowerBiControl = false;
              });
        }
        , (err) => {
          console.log('Failed to embed report with embed token, switch to report embed url')
          this.usePowerBiControl = false;
        }
      );
    });
  }

  ngAfterViewInit(){
      this.initReport();
  }

  getAccessTokenPowerBI(): Promise<string | null>{
    const that = this;
    const account = this.msalService.instance.getAllAccounts()[0];
    const accessTokenRequest = {
      scopes: environment.powerBIConfig.scopes,
      account: account,
    };
    return this.msalService.instance.acquireTokenSilent(accessTokenRequest)
      .then(function (accessTokenResponse) {
        // Acquire token silent success
        const accessToken = accessTokenResponse.accessToken;
        return accessToken;
      })
      .catch(function (error) {
        //Acquire token silent failure, and send an interactive request
        if (error instanceof InteractionRequiredAuthError) {
          return that.msalService.instance
            .acquireTokenPopup(accessTokenRequest)
            .then(function (accessTokenResponse) {
              // Acquire token interactive success
              const accessToken = accessTokenResponse.accessToken;
              return accessToken;
            })
            .catch(function (error) {
              // Acquire token interactive failure
              console.log(error);
              return null;
            });
        }else{
          console.log(error);
          return null;
        }
      });
  }
  
  async initReport(){
    if(!this.report && this.reportObj){
      this.report = this.reportObj.getReport();
      if(this.pageName){
        this.report.setComponentTitle(this.pageName!);
      }else{
        this.report.setComponentTitle(this.reportName!);
      }
      //this.report.fullscreen();
      const pages = await this.report!.getPages();
      console.log('Report has loaded', pages);
      if(this.pageName){
        const p = pages.find(p => p.displayName == this.pageName);
        if(p){
          this.report.setPage(p.name);
        } 
      }
    }
  }
}

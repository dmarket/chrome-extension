import { NgClass, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { DmExtMessagingFacadeService } from '@myth/dm-ext-data-access-messaging';
import { DmExtTabStatus, GaEventNames } from '@myth/dm-ext-shared-constants';
import { DmExtButtonComponent, DmExtIconsEnum } from '@myth/dm-ext-ui-base';
import { DmExtStatusIconComponent } from '@myth/dm-ext-ui-domains';
import { DmExtLinkLocalizePipe } from '@myth/dm-ext-ui-pipes';

@Component({
  selector: 'dm-ext-main-container',
  templateUrl: './dm-ext-main-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TranslocoDirective,
    DmExtButtonComponent,
    MatIcon,
    DmExtStatusIconComponent,
    DmExtLinkLocalizePipe,
    NgClass,
    MatTooltip,
    UpperCasePipe,
  ],
  providers: [DmExtLinkLocalizePipe],
  host: {
    class: 'flex flex-col grow',
  },
})
export class DmExtMainContainerComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly linkLocalizePipe = inject(DmExtLinkLocalizePipe);
  private readonly messagingFacadeService = inject(DmExtMessagingFacadeService);
  readonly status = this.messagingFacadeService.status;
  readonly lastValidatedDomain = this.messagingFacadeService.lastValidatedDomain;
  readonly svgIcons = DmExtIconsEnum;
  readonly statuses = DmExtTabStatus;

  async ngOnInit() {
    const options = await this.messagingFacadeService.getOptions();
    if (!options.tutorialShowed) {
      this.messagingFacadeService.sendGaEvent({ eventName: GaEventNames.ExtensionActivated });
      await this.router.navigate([this.linkLocalizePipe.transform('/home/welcome')]);
    }
    if (options.currentTabStatus !== DmExtTabStatus.Alert) {
      await this.messagingFacadeService.checkTabDomain();
    }
  }

  async redirectToDmarket() {
    await this.messagingFacadeService.redirectToDmarket();
  }

  async checkTabDomain() {
    await this.messagingFacadeService.checkTabDomain();
  }

  async enableScamDetection() {
    await this.messagingFacadeService.setOptions({ domainAuthenticityVerification: true });
    const recheckTimeout = 500; // have to wait for the option sync in the background
    setTimeout(() => this.checkTabDomain(), recheckTimeout);
  }
}

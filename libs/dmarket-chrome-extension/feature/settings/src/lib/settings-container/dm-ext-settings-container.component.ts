import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { TranslocoDirective } from '@jsverse/transloco';
import { DmExtMessagingFacadeService } from '@myth/dm-ext-data-access-messaging';
import { GaEventNames } from '@myth/dm-ext-shared-constants';
import { DmExtOptions, getHasAllUrlsPermission } from '@myth/dm-ext-shared-extension-utils';
import { DmExtButtonComponent, DmExtIconsEnum } from '@myth/dm-ext-ui-base';
import { DmExtLinkLocalizePipe } from '@myth/dm-ext-ui-pipes';
import { isOptionsPage, isWebPage } from 'webext-detect';
import { DmExtPermissionsDialogComponent } from '../permissions-dialog';

@Component({
  selector: 'dm-ext-settings-container',
  templateUrl: './dm-ext-settings-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TranslocoDirective,
    MatDialogModule,
    MatSlideToggle,
    NgClass,
    FormsModule,
    DmExtButtonComponent,
    MatIcon,
    DmExtLinkLocalizePipe,
  ],
  host: {
    class: 'flex flex-col grow',
  },
})
export class DmExtSettingsContainerComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly messagingFacadeService = inject(DmExtMessagingFacadeService);
  options = this.messagingFacadeService.options;
  isOptionsPage = signal<boolean>(isOptionsPage());
  hasAllUrlsPermissions = signal<boolean>(false);
  readonly svgIcons = DmExtIconsEnum;

  async ngOnInit() {
    await this.initOptions();
    await this.initAllUrlsPermission();
    this.grantPermissionsIfNeeded();
    this.messagingFacadeService.sendGaEvent({ eventName: GaEventNames.SettingsOpened });
  }

  async updateOptions(value: boolean, key: keyof DmExtOptions) {
    await this.messagingFacadeService.setOptions({ [key]: value });
    const recheckTimeout = 500; // have to wait for the option sync in the background
    setTimeout(() => this.messagingFacadeService.checkTabDomain(true), recheckTimeout);
  }

  private async initOptions() {
    await this.messagingFacadeService.getOptions();
  }

  private async initAllUrlsPermission() {
    const hasAllPermissions = isWebPage() ? true : await getHasAllUrlsPermission();
    this.hasAllUrlsPermissions.set(hasAllPermissions);
  }

  private grantPermissionsIfNeeded() {
    if (!this.hasAllUrlsPermissions()) {
      this.dialog
        .open(DmExtPermissionsDialogComponent, { role: 'dialog', autoFocus: 'dialog' })
        .afterClosed()
        .subscribe(async (result?: boolean) => {
          if (result) {
            await this.messagingFacadeService.requestAllUrlsPermission();
          }
        });
    }
  }
}

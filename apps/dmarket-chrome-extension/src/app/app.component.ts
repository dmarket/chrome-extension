import { AfterViewInit, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DmExtMessagingFacadeService } from '@myth/dm-ext-data-access-messaging';
import { DmExtMainHeaderComponent } from '@myth/dm-ext-layout-main';
import { GaEventNames } from '@myth/dm-ext-shared-constants';
import { isOptionsPage } from 'webext-detect';

@Component({
  standalone: true,
  imports: [RouterModule, DmExtMainHeaderComponent],
  selector: 'app-dm-ext',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col',
  },
})
export class AppComponent implements AfterViewInit {
  readonly messagingFacadeService = inject(DmExtMessagingFacadeService);
  loading = signal<boolean>(true);
  isOptionsPage = signal<boolean>(isOptionsPage());

  ngAfterViewInit(): void {
    this.loading.set(false);
    this.messagingFacadeService.sendGaEvent({ eventName: GaEventNames.UserSessionStarted });
  }
}

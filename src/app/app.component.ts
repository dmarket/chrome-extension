import { AfterViewInit, ChangeDetectionStrategy, Component, HostBinding, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CircularSpinnerComponent } from '@ext/shared/components';
import { HeaderComponent } from './header/header.component';

@Component({
  standalone: true,
  imports: [RouterModule, HeaderComponent, CircularSpinnerComponent],
  selector: 'ext-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit {
  @HostBinding('class') class = 'bg-neutral-950 block h-screen w-full min-w-96 min-h-60';
  loading = signal<boolean>(true);

  ngAfterViewInit(): void {
    this.loading.set(false);
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslocoDirective } from '@jsverse/transloco';
import { DmExtButtonComponent } from '@myth/dm-ext-ui-base';

@Component({
  standalone: true,
  selector: 'dm-ext-permissions-dialog',
  imports: [MatDialogModule, DmExtButtonComponent, TranslocoDirective],
  templateUrl: './dm-ext-permissions-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DmExtPermissionsDialogComponent {
  private dialogRef: MatDialogRef<DmExtPermissionsDialogComponent> = inject(MatDialogRef);

  close() {
    this.dialogRef.close(false);
  }

  grantPermissions() {
    this.dialogRef.close(true);
  }
}

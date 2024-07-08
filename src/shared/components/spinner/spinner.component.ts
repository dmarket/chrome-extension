import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
  standalone: true,
  selector: 'ext-circular-spinner',
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgStyle],
})
export class CircularSpinnerComponent {
  @Input() color = '#FFFFFF';
  @Input() size = 56;
  @Input() thickness = 8;
}

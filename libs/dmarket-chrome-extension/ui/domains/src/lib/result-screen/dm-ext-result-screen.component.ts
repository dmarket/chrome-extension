import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  input,
  TemplateRef,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { DmExtIconsEnum } from '@myth/dm-ext-ui-base';
import { CapitalizePipe } from '@myth/dm-ext-ui-pipes';

@Component({
  selector: 'dm-ext-result-screen',
  standalone: true,
  imports: [MatIcon, NgTemplateOutlet, CapitalizePipe],
  templateUrl: './dm-ext-result-screen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DmExtResultScreenComponent {
  submitError = input.required<string | null>();
  @ContentChild('errorTitleTemplate', { static: false })
  errorTitleTemplate: TemplateRef<unknown> | null = null;
  @ContentChild('errorTextTemplate', { static: false })
  errorTextTemplate: TemplateRef<unknown> | null = null;
  @ContentChild('successTitleTemplate', { static: false })
  successTitleTemplate: TemplateRef<unknown> | null = null;
  @ContentChild('successTextTemplate', { static: false })
  successTextTemplate: TemplateRef<unknown> | null = null;
  protected readonly svgIcons = DmExtIconsEnum;
}

import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { MatRipple } from '@angular/material/core';
import { RouterLink } from '@angular/router';
import { hostAttr, isExternalUrl } from '@myth/dm-ext-shared-utils';

export type ButtonSizes = 'sm' | 'md' | 'lg';
export type ButtonColorSchemes = 'primary' | 'transparent' | 'plain';
export type ButtonPositions = 'right' | 'left';
export type ButtonTypes = 'default' | 'link' | 'iconButton';

@Component({
  selector: 'dm-ext-button',
  standalone: true,
  imports: [NgClass, NgTemplateOutlet, MatRipple, RouterLink],
  templateUrl: './dm-ext-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DmExtButtonComponent {
  @Input() disabled = false;
  @Input() isMaxWidth = false;
  @Input() colorScheme: ButtonColorSchemes = 'primary';
  @Input() preventAnimation = false;
  @Input() target?: string;
  @Input() href: string | null = '';
  @Input() routerLink: string | null = null;
  @Input() fragment: string | undefined = undefined;
  @Input() size: ButtonSizes = 'lg';
  @Input() preventDefaultEvent = false;
  @Input() iconPos: ButtonPositions = 'right';
  @Output() clickEvent = new EventEmitter<MouseEvent>();
  @ContentChild('iconTemplate', { static: false }) iconTemplate: TemplateRef<unknown> | null = null;
  @ContentChild('labelTemplate', { static: false }) labelTemplate: TemplateRef<unknown> | null =
    null;
  type: ButtonTypes = hostAttr<ButtonTypes>('type', 'default');

  @HostBinding('class')
  protected get hostClasses(): string {
    return `relative ${this.isMaxWidth ? 'block' : 'flex'}`;
  }

  get ariaLabel(): string {
    return `${this.size} ${this.disabled ? 'disabled' : ''} ${this.isMaxWidth ? 'full width' : 'regular'} ${this.type}`;
  }

  get targetAttribute(): string {
    if (this.target) return this.target;
    if (!this.href) return '_self';
    return isExternalUrl(this.href) ? '_blank' : '_self';
  }

  protected get rippleColor(): string {
    return this.colorScheme === 'primary' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.1)';
  }

  buttonClick(event: MouseEvent): void {
    if (this.preventDefaultEvent) {
      event.preventDefault();
    }
    this.clickEvent.emit(event);
  }
}

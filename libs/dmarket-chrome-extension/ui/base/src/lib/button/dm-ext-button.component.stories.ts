import { provideHttpClient } from '@angular/common/http';
import { provideLocationMocks } from '@angular/common/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { provideRouter } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { translocoConfig } from '@myth/dm-ext-shared-utils';
import {
  Meta,
  StoryObj,
  applicationConfig,
  argsToTemplate,
  componentWrapperDecorator,
  moduleMetadata,
} from '@storybook/angular';
import { customMatIconsLoaderProviders } from '../icons';
import { DmExtButtonComponent } from './dm-ext-button.component';

const meta: Meta<DmExtButtonComponent> = {
  title: 'Dmarket Extension / Base Components / Button',
  component: DmExtButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    isMaxWidth: { control: 'boolean' },
    href: { control: 'text' },
    disabled: { control: 'boolean' },
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' },
    },
    colorScheme: {
      options: ['primary', 'transparent'],
      control: { type: 'select' },
    },
    type: {
      options: ['default', 'link', 'iconButton'],
      control: { type: 'radio' },
    },
    iconPos: {
      options: ['left', 'right'],
      control: { type: 'radio' },
    },
  },
  args: {
    isMaxWidth: false,
    disabled: false,
    type: 'default',
    iconPos: 'right',
    colorScheme: 'primary',
    size: 'md',
    href: '',
  },
  decorators: [
    moduleMetadata({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [MatIcon, TranslocoDirective],
    }),
    applicationConfig({
      providers: [
        provideHttpClient(),
        ...translocoConfig.providers,
        ...customMatIconsLoaderProviders,
        provideRouter([]),
        provideLocationMocks(),
      ],
    }),
    componentWrapperDecorator((story) => `<div style="width: 100%">${story}</div>`),
  ],
};
export default meta;
type Story = StoryObj<DmExtButtonComponent>;

export const link: Story = {
  render: (args) => ({
    template: `
      <dm-ext-button ${argsToTemplate(args)}>
        <ng-template #labelTemplate>
          <ng-container *transloco="let t">{{ t('Back to Homepage') }}</ng-container>
        </ng-template>
      </dm-ext-button>
    `,
    props: args,
  }),
  args: {
    type: 'link',
  },
};

export const button: Story = {
  render: (args) => ({
    template: `
      <dm-ext-button ${argsToTemplate(args)}>
        <ng-template #labelTemplate>
          <ng-container *transloco="let t">{{ t('Back to Homepage') }}</ng-container>
        </ng-template>
      </dm-ext-button>
    `,
    props: args,
  }),
  args: {
    type: 'default',
    iconPos: 'right',
  },
};

export const buttonWithIcon: Story = {
  render: (args) => ({
    template: `
      <dm-ext-button ${argsToTemplate(args)}>
        <ng-template #iconTemplate>
          <mat-icon svgIcon="icon-arrow-forward"></mat-icon>
        </ng-template>
        <ng-template #labelTemplate>
          <ng-container *transloco="let t">{{ t('Back to Homepage') }}</ng-container>
        </ng-template>
      </dm-ext-button>
    `,
    props: args,
  }),
};

export const iconButton: Story = {
  render: (args) => ({
    template: `
      <dm-ext-button ${argsToTemplate(args)}>
        <ng-template #iconTemplate>
          <mat-icon svgIcon="icon-report"></mat-icon>
        </ng-template>
      </dm-ext-button>
    `,
    props: args,
  }),
  args: {
    type: 'iconButton',
    iconPos: 'right',
  },
};

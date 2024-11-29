import { CommonModule } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { importProvidersFrom, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { customMatIconsLoaderProviders } from '@myth/dm-ext-ui-base';
import {
  applicationConfig,
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { DmExtResultScreenComponent } from './dm-ext-result-screen.component';

const meta: Meta<DmExtResultScreenComponent> = {
  title: 'Dmarket Extension / Domain Components / Result Screen',
  component: DmExtResultScreenComponent,
  argTypes: {
    submitError: {
      control: { type: 'text' },
    },
  },
  args: {
    submitError: null,
  },
  decorators: [
    moduleMetadata({
      schemas: [NO_ERRORS_SCHEMA],
      providers: [CommonModule],
    }),
    applicationConfig({
      providers: [
        ...customMatIconsLoaderProviders,
        provideHttpClient(withFetch(), withInterceptors([])),
        importProvidersFrom(MatIconModule),
      ],
    }),
  ],
};
export default meta;
type Story = StoryObj<DmExtResultScreenComponent>;

export const primary: Story = {
  render: (args) => ({
    template: `
      <dm-ext-result-screen ${argsToTemplate(args)}>
        <ng-template #errorTitleTemplate>Something went wrong...</ng-template>
        <ng-template #errorTextTemplate>Please try again later</ng-template>
        <ng-template #successTitleTemplate>Thanks, your report has been accepted</ng-template>
        <ng-template #successTextTemplate>
          Together, we are creating a safe environment
        </ng-template>
     </dm-ext-result-screen>
     `,
    props: args,
  }),
};

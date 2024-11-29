import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { dmExtSvgIcons } from './icons.config';
import { customMatIconsLoaderProviders } from './icons.providers';

const meta: Meta<MatIcon & { icons: string[] }> = {
  title: 'Dmarket Extension / Base Components / Icon Component',
  component: MatIcon,
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  decorators: [
    applicationConfig({
      providers: [...customMatIconsLoaderProviders, importProvidersFrom(HttpClientModule)],
    }),
  ],
};
export default meta;
type Story = StoryObj<MatIcon & { icons: string[] }>;

export const icons: Story = {
  render: (args) => ({
    template: `
      <div class="flex text-white gap-4">
      @for(icon of icons; track icon) {
        <mat-icon [svgIcon]="icon"></mat-icon>
      }
      </div>
    `,
    props: args,
  }),
  args: {
    icons: Object.keys(dmExtSvgIcons),
  },
};

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DmExtTabStatus } from '@myth/dm-ext-shared-constants';
import { imageProviders } from '@myth/dm-ext-ui-base';
import {
  Meta,
  StoryObj,
  argsToTemplate,
  componentWrapperDecorator,
  moduleMetadata,
} from '@storybook/angular';
import { DmExtStatusIconComponent } from './dm-ext-status-icon.component';

const meta: Meta<DmExtStatusIconComponent> = {
  title: 'Dmarket Extension / Domain Components / Status Icon',
  component: DmExtStatusIconComponent,
  argTypes: {
    status: {
      options: [
        DmExtTabStatus.Safe,
        DmExtTabStatus.Processing,
        DmExtTabStatus.Alert,
        DmExtTabStatus.Unknown,
        DmExtTabStatus.Error,
      ],
      control: { type: 'select' },
    },
  },
  args: {
    status: DmExtTabStatus.Safe,
  },
  decorators: [
    moduleMetadata({
      schemas: [NO_ERRORS_SCHEMA],
      providers: [...imageProviders],
    }),
    componentWrapperDecorator(
      (story) =>
        `<div class="flex flex-col w-[450px] h-[450px] items-center justify-center">${story}</div>`,
    ),
  ],
};
export default meta;
type Story = StoryObj<DmExtStatusIconComponent>;

export const primary: Story = {
  render: (args) => ({
    template: `
      <dm-ext-status-icon ${argsToTemplate(args)} />`,
    props: args,
  }),
};

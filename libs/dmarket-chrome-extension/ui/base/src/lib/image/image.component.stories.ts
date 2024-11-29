import { NO_ERRORS_SCHEMA } from '@angular/core';
import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ImageComponent } from './image.component';
import { imageProviders } from './index';

const externalLink =
  // eslint-disable-next-line
  'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20kPb5PrrukmRB-Ml0mNbR_Y3mjQeLpxo7Oy3tIteQJwc7aAnW_VK3wu27g8DtvsjLzSdksnIk4izYlha-0x8ebrZnguveFwtRKpxn8A/218x218';
const externaPathOptimizedlLink =
  // eslint-disable-next-line
  'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopbuyLgNv1fX3cDx9-tmkgImMmMjmNr_ummJW4NE_jr_Dod2m0ASw-0U_YW30JNKce1Q2ZFzSqAfrxe29hpS7tMnKwHM3sz5iuygN8K7X1Q';
// From .storybook/assets/img
const internalPathOptimizedLink = 'internal';
const internalLink = 'test-logo.svg';

const meta: Meta<ImageComponent> = {
  title: 'Dmarket Extension / Base Components / Image',
  component: ImageComponent,
  decorators: [
    moduleMetadata({
      schemas: [NO_ERRORS_SCHEMA],
      providers: [...imageProviders],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    type: {
      options: ['internal', 'internalPathOptimized', 'external', 'externalPathOptimized'],
      control: { type: 'radio' },
      description: 'Type depends on the location of source and nessesity of size optimization',
    },
    src: {
      options: [internalLink, internalPathOptimizedLink, externalLink, externaPathOptimizedlLink],
      control: { type: 'radio' },
      description: 'SRC depends on what type you wanna use',
    },
    alt: {
      control: { type: 'text' },
      description: '<b>Required:</b> Alt text for the image',
    },
    classes: {
      control: { type: 'text' },
      description: 'Classes for the image',
    },
    srcset: {
      control: { type: 'text' },
      description: 'Srcset for the image',
    },
    errorImage: {
      control: { type: 'text' },
      description: 'Placeholder on image error like 404',
    },
    width: {
      control: { type: 'text' },
      description: 'Width of the image',
    },
    height: { control: { type: 'text' }, description: 'Height of the image' },
    sizes: { control: { type: 'text' }, description: 'Sizes of the image' },
    priority: {
      control: { type: 'boolean' },
      description: 'Priority of loading image',
    },
    ariaLabel: {
      control: { type: 'text' },
      description: 'Aria label for the image',
    },
  },
  args: {
    alt: 'Alt text for the image',
    classes: 'object-contain object-center',
  },
};
export default meta;
type Story = StoryObj<ImageComponent>;

export const externalImage: Story = {
  render: (args) => ({
    template: `
    <div class="relative"><dm-ext-shared-image ${argsToTemplate(args)} width="218" height="218" /></div>
    <div class="text-white">On Error</div>
    <div class="relative">
      <dm-ext-shared-image src="error" width="218" height="218" type="${args.type}" errorImage="${args.errorImage}" />
    </div>
    `,
    props: args,
  }),
  args: {
    type: 'external',
    src: externalLink,
    errorImage: 'https://placehold.co/218',
  },
};

export const externalPathOptimized: Story = {
  render: (args) => ({
    template: `
    <dm-ext-shared-image ${argsToTemplate(args)} width="${args.width}" height="${args.height}"/>`,
    props: args,
  }),
  args: {
    type: 'externalPathOptimized',
    src: externaPathOptimizedlLink,
    width: '109',
    height: '82',
    srcset: '218w',
  },
};

export const internalPathOptimized: Story = {
  render: (args) => ({
    template: `
    <dm-ext-shared-image ${argsToTemplate(args)}  width="${args.width}" height="${args.height}" />`,
    props: args,
  }),
  args: {
    type: 'internalPathOptimized',
    src: internalPathOptimizedLink,
    srcset: '706w, 1440w, 2084w',
    sizes: '(max-width: 767px) 353px, (max-width: 991px) 720px, 2084px',
    priority: true,
    width: '600',
    height: '400',
  },
};

export const internal: Story = {
  render: (args) => ({
    template: `
    <dm-ext-shared-image ${argsToTemplate(args)}  width="${args.width}" height="${args.height}" />`,
    props: args,
  }),
  args: {
    type: 'internal',
    src: internalLink,
    width: '88',
    height: '20',
  },
};

import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatOption, MatSelect } from '@angular/material/select';
import { TranslocoDirective } from '@jsverse/transloco';
import { DmExtMessagingFacadeService } from '@myth/dm-ext-data-access-messaging';
import { maxLengthTrimmed, minLengthTrimmed } from '@myth/dm-ext-shared-utils';
import { DmExtButtonComponent, DmExtIconsEnum } from '@myth/dm-ext-ui-base';
import { DmExtResultScreenComponent } from '@myth/dm-ext-ui-domains';
import { DmExtLinkLocalizePipe } from '@myth/dm-ext-ui-pipes';

enum ContactFormFields {
  Topic = 'topic',
  Email = 'email',
  Message = 'message',
}

enum FormSteps {
  Step1 = 'step-1',
  Step2 = 'step-2',
}

interface ContactForm {
  [ContactFormFields.Topic]: FormControl<string>;
  [ContactFormFields.Email]: FormControl<string>;
  [ContactFormFields.Message]: FormControl<string>;
}

@Component({
  selector: 'dm-ext-contact-support',
  templateUrl: './dm-ext-contact-support.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatIcon,
    NgClass,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    TranslocoDirective,
    DmExtButtonComponent,
    DmExtLinkLocalizePipe,
    MatSelect,
    MatOption,
    NgTemplateOutlet,
    MatProgressSpinner,
    DmExtResultScreenComponent,
  ],
  host: {
    class: 'flex flex-col grow',
  },
})
export class DmExtContactSupportComponent {
  private readonly messagingFacadeService = inject(DmExtMessagingFacadeService);
  readonly processing = signal<boolean>(false);
  readonly submitError = signal<string | null>(null);
  readonly svgIcons = DmExtIconsEnum;
  readonly FormFields = ContactFormFields;
  readonly Steps = FormSteps;
  readonly constraints = {
    messageMinLength: 1,
    messageMaxLength: 100,
    topicMaxLength: 4096,
  };
  contactForm = new FormGroup<ContactForm>({
    [ContactFormFields.Email]: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        minLengthTrimmed(this.constraints.messageMinLength),
        Validators.email,
      ],
    }),
    [ContactFormFields.Topic]: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        minLengthTrimmed(this.constraints.messageMinLength),
        maxLengthTrimmed(this.constraints.messageMaxLength),
      ],
    }),
    [ContactFormFields.Message]: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        minLengthTrimmed(this.constraints.messageMinLength),
        maxLengthTrimmed(this.constraints.topicMaxLength),
      ],
    }),
  });
  step = signal<FormSteps>(FormSteps.Step1);
  topics = [
    'General Questions',
    'Report a Scam or Phishing Attempt',
    'Account Security and Privacy Concerns',
    'Report a Technical Issue or Bug',
    'Feedback or Feature Suggestions',
  ];

  get topicControl(): FormControl {
    return this.contactForm.get(ContactFormFields.Topic) as FormControl<string>;
  }

  get emailControl(): FormControl {
    return this.contactForm.get(ContactFormFields.Email) as FormControl<string>;
  }

  get messageControl(): FormControl {
    return this.contactForm.get(ContactFormFields.Message) as FormControl<string>;
  }

  async sendRequest() {
    if (this.contactForm.invalid) return;
    this.processing.set(true);
    const { success, result } = await this.messagingFacadeService.submitContactSupportRequest(
      this.contactForm.getRawValue(),
    );
    this.submitError.set(success ? null : <string>result);
    this.processing.set(false);
    this.step.set(FormSteps.Step2);
  }

  closeReport() {
    this.step.set(FormSteps.Step1);
  }
}

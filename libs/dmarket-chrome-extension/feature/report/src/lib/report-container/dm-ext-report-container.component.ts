import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
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
import { translate, TranslocoDirective } from '@jsverse/transloco';
import { DmExtMessagingFacadeService } from '@myth/dm-ext-data-access-messaging';
import {
  dmExtChromeServiceUrls,
  dmExtUrlPattern,
  GaEventNames,
} from '@myth/dm-ext-shared-constants';
import { getHostName, maxLengthTrimmed, minLengthTrimmed } from '@myth/dm-ext-shared-utils';
import { DmExtButtonComponent, DmExtIconsEnum } from '@myth/dm-ext-ui-base';
import { DmExtResultScreenComponent } from '@myth/dm-ext-ui-domains';

enum ReportFormFields {
  Url = 'url',
  Email = 'email',
  Channel = 'channel',
}

enum FormSteps {
  Step1 = 'step-1',
  Step2 = 'step-2',
  Step3 = 'step-3',
}

interface ReportForm {
  [ReportFormFields.Url]: FormControl<string>;
  [ReportFormFields.Email]: FormControl<string>;
  [ReportFormFields.Channel]: FormControl<string>;
}

@Component({
  selector: 'dm-ext-report-container',
  templateUrl: './dm-ext-report-container.component.html',
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
export class DmExtReportContainerComponent implements OnInit {
  private readonly messagingFacadeService = inject(DmExtMessagingFacadeService);
  readonly status = this.messagingFacadeService.status;
  readonly lastValidatedDomain = this.messagingFacadeService.lastValidatedDomain;
  readonly processing = signal<boolean>(false);
  readonly submitError = signal<string | null>(null);
  readonly svgIcons = DmExtIconsEnum;
  readonly FormFields = ReportFormFields;
  readonly Steps = FormSteps;
  readonly constraints = {
    messageMinLength: 1,
    urlMaxLength: 255,
  };
  reportForm = new FormGroup<ReportForm>({
    [ReportFormFields.Url]: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(dmExtUrlPattern),
        maxLengthTrimmed(this.constraints.urlMaxLength),
      ],
    }),
    [ReportFormFields.Email]: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email,
        minLengthTrimmed(this.constraints.messageMinLength),
      ],
    }),
    [ReportFormFields.Channel]: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  step = signal<FormSteps>(FormSteps.Step1);
  channels = [
    'Clicked on a link from a search engine (e.g., Google)',
    'Received a link from a friend or contact',
    'Followed a link from Facebook',
    'Followed a link from Twitter',
    'Clicked on an advertisement',
    'Typed the URL directly',
    'Redirected from another website',
  ];

  get urlControl(): FormControl {
    return this.reportForm.get(ReportFormFields.Url) as FormControl<string>;
  }

  get emailControl(): FormControl {
    return this.reportForm.get(ReportFormFields.Email) as FormControl<string>;
  }

  get channelControl(): FormControl {
    return this.reportForm.get(ReportFormFields.Channel) as FormControl<string>;
  }

  ngOnInit(): void {
    const lastDomain = this.lastValidatedDomain();
    if (lastDomain && !dmExtChromeServiceUrls.includes(lastDomain)) {
      this.urlControl.patchValue(lastDomain);
      this.urlControl.markAllAsTouched();
      this.reportForm.updateValueAndValidity();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    if (event.clipboardData) {
      const domain = getHostName(event.clipboardData.getData('text'));
      if (domain) {
        this.urlControl.patchValue(domain);
      }
    }
  }

  toggleReportDetails(): void {
    this.step.set(FormSteps.Step2);
  }

  async submitReport() {
    if (this.reportForm.invalid) return;
    this.processing.set(true);
    const { url, ...rest } = this.reportForm.getRawValue();
    const domain = getHostName(url);
    if (domain) {
      this.urlControl.patchValue(domain);
      const { success, result } = await this.messagingFacadeService.submitDomainReport({
        ...rest,
        domain,
      });
      this.messagingFacadeService.sendGaEvent({
        eventName: success
          ? GaEventNames.DomainCustomReported
          : GaEventNames.DomainCustomReportFailed,
      });
      this.submitError.set(success ? null : <string>result);
    } else {
      this.submitError.set(translate('Please enter a valid domain.'));
    }
    this.processing.set(false);
    this.step.set(FormSteps.Step3);
  }

  closeReport(): void {
    this.step.set(FormSteps.Step1);
  }
}

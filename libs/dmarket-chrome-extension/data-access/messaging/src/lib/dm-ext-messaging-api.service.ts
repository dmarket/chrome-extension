import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { dmExtApiUrl } from '@myth/dm-ext-shared-constants';
import { parseError } from '@myth/dm-ext-shared-utils';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DmExtMessagingApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = dmExtApiUrl;

  async submitDomainReport(body: {
    domain: string;
    email: string;
    channel: string;
  }): Promise<{ success: boolean; result: void | unknown }> {
    try {
      const result = await firstValueFrom<void>(
        this.http.post<void>(`${this.apiUrl}/report-scam-site`, body),
      );
      return { success: true, result };
    } catch (error) {
      return { success: false, result: parseError(error, 'Unknown error') };
    }
  }

  async submitContactSupportRequest(body: {
    topic: string;
    email: string;
    message: string;
  }): Promise<{ success: boolean; result: void | unknown }> {
    try {
      const result = await firstValueFrom<void>(
        this.http.post<void>(`${this.apiUrl}/support-form`, body),
      );
      return { success: true, result };
    } catch (error) {
      return { success: false, result: parseError(error, 'Unknown error') };
    }
  }
}

import { GaEventNames, timeConstants } from '@myth/dm-ext-shared-constants';
import browser from 'webextension-polyfill';

const gaEndpoint = 'https://www.google-analytics.com/mp/collect';
const gaDebugEndpoint = 'https://www.google-analytics.com/debug/mp/collect';
// Get via https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events?
// client_type=gtag#recommended_parameters_for_reports
const gaMeasurementId = 'G-NER4WDJQ1H';
const gaApiSecret = 'nuxJHaiTTu2bPlcCxzpNNQ';
const gaDefaultEngagementTimeMs = 100;
// Duration of inactivity in minutes after which a new session is created
const sessionExpirationInMin = 30;

interface SessionData {
  timestamp?: string;
  session_id: string;
}

interface EventParams extends Record<string, string | number | boolean | undefined> {
  timestamp?: string;
  session_id?: string;
  engagement_time_msec?: number;
  page_title?: string;
  page_location?: string;
  error?: string;
}

export class GaAnalytics {
  debug = false;

  constructor(debug = false) {
    this.debug = debug;
  }

  // Returns the client id, or creates a new one if one doesn't exist.
  // Store client id in local storage to keep the same client id as long as
  // the extension is installed.
  async getOrCreateClientId(): Promise<string> {
    let { clientId } = (await browser.storage.local.get('clientId')) as { clientId: string };
    if (!clientId) {
      // Generate a unique client ID, the actual value is not relevant
      clientId = self.crypto.randomUUID();
      await browser.storage.local.set({ clientId });
    }
    return clientId as string;
  }

  // Returns the current session id, or creates a new one if one doesn't exist or
  // the previous one has expired.
  async getOrCreateSessionId(): Promise<string> {
    // Use storage.session because it is only in memory
    const storedSession = (await browser.storage.session.get('sessionData')) as {
      sessionData: SessionData;
    };
    let sessionData: SessionData | null = storedSession.sessionData;
    const currentTimeInMs = Date.now();
    // Check if session exists and is still valid
    if (sessionData && sessionData.timestamp) {
      // Calculate how long ago the session was last updated
      const durationInMin =
        (currentTimeInMs - Number(sessionData.timestamp)) / (timeConstants.min * timeConstants.ms);
      // Check if the last update lays past the session expiration threshold
      if (durationInMin > sessionExpirationInMin) {
        // Clear old session id to start a new session
        sessionData = null;
      } else {
        // Update timestamp to keep session alive
        sessionData.timestamp = currentTimeInMs.toString();
        await browser.storage.session.set({ sessionData });
      }
    }
    if (!sessionData) {
      // Create and store a new session
      sessionData = {
        session_id: currentTimeInMs.toString(),
        timestamp: currentTimeInMs.toString(),
      };
      await browser.storage.session.set({ sessionData });
    }
    return sessionData.session_id;
  }

  // Fires an event with optional params. Event names must only include letters and underscores.
  async fireEvent(eventName: GaEventNames, params: EventParams = {}) {
    // Configure session id and engagement time if not present, for more details see:
    // https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events?
    // client_type=gtag#recommended_parameters_for_reports
    if (!params.session_id) {
      params.session_id = await this.getOrCreateSessionId();
    }
    if (!params.engagement_time_msec) {
      params.engagement_time_msec = gaDefaultEngagementTimeMs;
    }

    try {
      const response = await fetch(
        `${
          this.debug ? gaDebugEndpoint : gaEndpoint
        }?measurement_id=${gaMeasurementId}&api_secret=${gaApiSecret}`,
        {
          method: 'POST',
          body: JSON.stringify({
            client_id: await this.getOrCreateClientId(),
            events: [
              {
                name: eventName,
                params,
              },
            ],
          }),
        },
      );
      if (!this.debug) return;
      // eslint-disable-next-line no-console
      console.log(await response.text());
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Google Analytics request failed with an exception', e);
    }
  }

  // Fire an error event.
  async fireErrorEvent(error: any, additionalParams = {}) {
    // Note: 'error' is a reserved event name and cannot be used
    // see https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference?client_type=gtag#reserved_names
    return this.fireEvent(GaEventNames.ExtensionError, {
      ...error,
      ...additionalParams,
    });
  }
}

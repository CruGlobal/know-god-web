import { KgwAnalyticsComplexTypeEvents } from '../analytics/analytics-ct-events';
import { KgwContentComplexTypeText } from './content-ct-text';

export interface KgwContentComplexTypeButton {
  text?: KgwContentComplexTypeText;
  events?: KgwAnalyticsComplexTypeEvents;
  attributes: {
    type?: string;
    events?: string;
    url?: string;
    urlI18nId?: string;
    style?: string;
    color?: string;
    backgroundColor?: string;
    version?: number;
    restrictTo?: Array<string>;
  };
}

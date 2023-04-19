import { KgwAnalyticsComplexTypeEvents } from '../analytics/analytics-ct-events';
import { KgwContentComplexTypeText } from './content-ct-text';

export interface KgwContentComplexTypeLink {
  text?: KgwContentComplexTypeText;
  events?: KgwAnalyticsComplexTypeEvents;
  attributes: {
    events?: string;
  };
}

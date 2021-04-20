import { KgwAnalyticsComplexTypeAttribute } from "./analytics-ct-attribute";

export interface KgwAnalyticsComplexTypeEvent {
    attributes?: Array<KgwAnalyticsComplexTypeAttribute>;
    system?: string;
    action?: string;
    delay?: number;
    trigger?: string; 
}
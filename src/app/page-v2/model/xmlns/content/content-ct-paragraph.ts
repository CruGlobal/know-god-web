import { KgwContentElementItem } from './content-element';

export interface KgwContentComplexTypeParagraph {
    contentType: string;
    children: Array<KgwContentElementItem>;
    attributes: {
        version?: number;
        restrictTo?: Array<string>;
        fallback?: boolean;
    };
}

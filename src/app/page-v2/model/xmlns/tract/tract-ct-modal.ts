import { KgwContentComplexTypeParagraph } from '../content/content-ct-paragraph';
import { KgwContentComplexTypeTextchild } from '../content/content-ct-text-child';

export interface KgwTractComplexTypeModal {
    title?: KgwContentComplexTypeTextchild;
    content?: Array<KgwContentComplexTypeParagraph>;
    attributes: {
        listeners?: string;
        dismissListeners?: string;
    };
}

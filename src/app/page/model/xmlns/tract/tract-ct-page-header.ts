import { KgwContentComplexTypeTextchild } from '../content/content-ct-text-child';

export interface KgwTractComplexTypePageHeader {
  number?: number;
  title?: KgwContentComplexTypeTextchild;
  attributes: {
    backgroundColor?: string;
    tip?: string;
  };
}

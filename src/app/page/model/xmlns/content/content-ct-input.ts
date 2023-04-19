import { KgwContentComplexTypeTextchild } from './content-ct-text-child';

export interface KgwContentComplexTypeInput {
  label?: KgwContentComplexTypeTextchild;
  placeholder?: KgwContentComplexTypeTextchild;
  attributes: {
    name?: string;
    type?: string;
    required?: boolean;
    value?: string;
  };
}

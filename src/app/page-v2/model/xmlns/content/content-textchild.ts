import { KgwContentComplexTypeTextchild } from "./content-ct-text-child";

export class KgwContentTextchild {

    private _xmlNode: any;

    constructor(xmlNode: any) {
        this._xmlNode = xmlNode;
    }

    parse(): KgwContentComplexTypeTextchild {
        let item:KgwContentComplexTypeTextchild = {text: { attributes: {}, value: ''}};

        if (
            this._xmlNode.getElementsByTagName('content:text') &&
            this._xmlNode.getElementsByTagName('content:text').length > 0
          ) 
          {
            let tNode = this._xmlNode.getElementsByTagName('content:text')[0];

            if (tNode.getAttribute('i18n-id')) {
                item.text.attributes.i18n_id = tNode.getAttribute('i18n-id');
            }
            if (tNode.getAttribute('text-align')) {
                item.text.attributes.text_align = tNode.getAttribute('text-align');
            }
            if (tNode.getAttribute('text-color')) {
                item.text.attributes.text_color = tNode.getAttribute('text-color');
            }
            if (tNode.getAttribute('text-scale')) {
                item.text.attributes.text_scale = tNode.getAttribute('text-scale');
            }
            if (tNode.getAttribute('text-style')) {
                item.text.attributes.text_style = tNode.getAttribute('text-style');
            }

            if (tNode.textContent) {
                item.text.value = tNode.textContent.trim().replace(/(?:\r\n|\r|\n)/g, '<br>');
            }            
        }

        return item;
    }
}
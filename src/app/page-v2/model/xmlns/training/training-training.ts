import { KgwContentComplexTypeImage } from '../content/content-ct-image';
import { KgwContentElementItem } from '../content/content-element';
import { KgwTrainingComplexTypePage } from './training-ct-page';
import { KgwTrainingPage } from './training-page';

export class KgwTraining {
    private _xmlString: string;
    pages: Array<KgwTrainingComplexTypePage>;
    id?: string;

    constructor(xmlstring: string) {
        this._xmlString = xmlstring;
    }

    public parseXml(): void {
        this.pages = [];
        const parser = new DOMParser();
        const xml: any = parser.parseFromString(this._xmlString, 'application/xml');
        const tNode = xml.childNodes[0];
        if (tNode.nodeName === 'tip') {
            tNode.childNodes.forEach(
                pNode => {
                    if (pNode.nodeName === 'pages') {
                        for (let i = 0; i < pNode.childNodes.length; i++) {
                            const cNode = pNode.childNodes[i];
                            if (cNode.nodeName === 'page') {
                                const t: KgwTrainingPage = new KgwTrainingPage(cNode);
                                const page: KgwTrainingComplexTypePage = t.parse();
                                if (page) {
                                    this.pages.push(page);
                                }
                            }
                        }
                    }
                }
            );
        }
    }

    public getImageResources(): string[] {
        if (!this.pages || this.pages.length === 0) {
            return [];
        }

        const images = [] as string[];

        this.pages.forEach(
            page => {
                if (page && page.content && page.content.length) {
                    page.content.forEach(
                        child => {
                            const tItem: KgwContentElementItem = child as KgwContentElementItem;
                            if (tItem && tItem.type && tItem.type === 'image' && tItem.element) {
                                const tImage = tItem.element as KgwContentComplexTypeImage;
                                if (tImage && tImage.attributes && tImage.attributes.resource) {
                                    images.push(tImage.attributes.resource);
                                }
                            }
                        }
                    );
                }
            }
        );

        return images;
    }
}

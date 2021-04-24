import { KgwContentTextchild } from '../content/content-textchild';
import { KgwManifestCategory } from './manifest-ct-category';
import { KgwManifestComplexTypeManifest } from './manifest-ct-manifest';
import { KgwManifestPage } from './manifest-ct-page';
import { KgwManifestResource } from './manifest-ct-resource';
import { KgwManifestTip } from './manifest-ct-tip';

export class KgwManifest {
    private _xmlString: string;
    manifest: KgwManifestComplexTypeManifest;

    constructor(xmlstring: string) {
        this._xmlString = xmlstring;
        this.manifest = {attributes: {}};
    }

    public parseXml(): void {
        const parser = new DOMParser();
        const xml: any = parser.parseFromString(this._xmlString, 'application/xml');
        const tNode = xml.childNodes[0];

        if (tNode.getAttribute('tool')) {
          this.manifest.attributes['tool'] = tNode.getAttribute('tool');
        }
        if (tNode.getAttribute('locale')) {
          this.manifest.attributes['locale'] = tNode.getAttribute('locale');
        }
        if (tNode.getAttribute('type')) {
          this.manifest.attributes['type'] = tNode.getAttribute('type');
        }
        if (tNode.getAttribute('primary-color')) {
          this.manifest.attributes['primaryColor'] = tNode.getAttribute('primary-color');
        }
        if (tNode.getAttribute('primary-text-color')) {
          this.manifest.attributes['primaryTextColor'] = tNode.getAttribute('primary-text-color');
        }
        if (tNode.getAttribute('text-color')) {
          this.manifest.attributes['textColor'] = tNode.getAttribute('text-color');
        }
        if (tNode.getAttribute('background-color')) {
          this.manifest.attributes['backgroundColor'] = tNode.getAttribute('background-color');
        }
        if (tNode.getAttribute('background-image')) {
          this.manifest.attributes['backgroundImage'] = tNode.getAttribute('background-image');
        }
        if (tNode.getAttribute('background-image-align')) {
          this.manifest.attributes['backgroundImageAlign'] = tNode.getAttribute('background-image-align');
        }
        if (tNode.getAttribute('background-image-scale-type')) {
          this.manifest.attributes['backgroundImageScaleType'] = tNode.getAttribute('background-image-scale-type');
        }
        if (tNode.getAttribute('navbar-color')) {
          this.manifest.attributes['navbarColor'] = tNode.getAttribute('navbar-color');
        }
        if (tNode.getAttribute('navbar-control-color')) {
          this.manifest.attributes['navbarControlColor'] = tNode.getAttribute('navbar-control-color');
        }
        if (tNode.getAttribute('category-label-color')) {
          this.manifest.attributes['categoryLabelColor'] = tNode.getAttribute('category-label-color');
        }
        if (tNode.getAttribute('text-scale')) {
          this.manifest.attributes['textScale'] = parseFloat(tNode.getAttribute('text-scale'));
        }
        if (tNode.getAttribute('dismiss-listeners')) {
          this.manifest.attributes['dismissListeners'] = tNode.getAttribute('dismiss-listeners');
        }
        if (tNode.getAttribute('control-color')) {
          this.manifest.attributes['controlColor'] = tNode.getAttribute('control-color');
        }
        if (tNode.getAttribute('card-background-color')) {
          this.manifest.attributes['cardBackgroundColor'] = tNode.getAttribute('card-background-color');
        }

        for (let i = 0; i < tNode.childNodes.length; i++) {
          const cNode = tNode.childNodes[i];
          if ( cNode.nodeName === 'title') {
            const t: KgwContentTextchild = new KgwContentTextchild(cNode);
              this.manifest.title = t.parse();
          } else if ( cNode.nodeName === 'categories') {
            this.manifest.categories = [];
            if ( cNode.childNodes && cNode.childNodes.length > 0 ) {
              cNode.childNodes.forEach(
                node => {
                  const _category: KgwManifestCategory = new KgwManifestCategory(node);
                  this.manifest.categories.push(_category.parse());
                }
              );
            }
          } else if ( cNode.nodeName === 'pages') {
            this.manifest.pages = [];
            if ( cNode.childNodes && cNode.childNodes.length > 0 ) {
              cNode.childNodes.forEach(
                node => {
                  const _page: KgwManifestPage = new KgwManifestPage(node);
                  this.manifest.pages.push(_page.parse());
                }
              );
            }
          } else if ( cNode.nodeName === 'resources') {
            this.manifest.resources = [];
            if ( cNode.childNodes && cNode.childNodes.length > 0 ) {
              cNode.childNodes.forEach(
                node => {
                  const _resource: KgwManifestResource = new KgwManifestResource(node);
                  this.manifest.resources.push(_resource.parse());
                }
              );
            }
          } else if ( cNode.nodeName === 'tips') {
            this.manifest.tips = [];
            if ( cNode.childNodes && cNode.childNodes.length > 0 ) {
              cNode.childNodes.forEach(
                node => {
                  const _tip: KgwManifestTip = new KgwManifestTip(node);
                  this.manifest.tips.push(_tip.parse());
                }
              );
            }
          }
        }
    }
}

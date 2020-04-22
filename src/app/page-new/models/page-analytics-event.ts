export class PageAnalyticsEvents {
  content: IPageAnalyticsEventsContent;
  private _xmlNode: any;

  constructor(pXmlNode: any) {
    this._xmlNode = pXmlNode;
    this.parseNode();
  }
  private parseNode(): void {
    const tEventNodes = this._xmlNode.getElementsByTagName('analytics:event');
    if (tEventNodes && tEventNodes.length > 0) {
      for (let i = 0; i < tEventNodes.length; i++) {
        const tNode = tEventNodes[i];
        if (tNode.getAttribute('action') && tNode.getAttribute('system')) {
          if (this.content === undefined) {
            this.content = { events: [] };
          }

          let _tEvent: IPageAnalyticsEvent = {
            system: tNode.getAttribute('system'),
            action: tNode.getAttribute('action'),
            delay: 0
          };
          if (tNode.getAttribute('delay')) {
            _tEvent.delay = parseInt(tNode.getAttribute('delay'), 10);
          }
          if (tNode.getAttribute('trigger')) {
            _tEvent.trigger = tNode.getAttribute('trigger');
          }

          let _tAttributeNodes = tNode.getElementsByTagName(
            'analytics:attribute'
          );
          if (_tAttributeNodes && _tAttributeNodes.length > 0) {
            for (let j = 0; j < _tAttributeNodes.length; j++) {
              let _tAttributeNode = _tAttributeNodes[j];
              if (
                _tAttributeNode.getAttribute('key') &&
                _tAttributeNode.getAttribute('value')
              ) {
                if (_tEvent.attribute === undefined) {
                  _tEvent.attribute = [];
                }
                _tEvent.attribute.push({
                  key: _tAttributeNode.getAttribute('key'),
                  value: _tAttributeNode.getAttribute('value')
                });
              }
            }
          }
        }
      }
    }
  }
}

export interface IPageAnalyticsEventsContent {
  events?: IPageAnalyticsEvent[];
}

export interface IPageAnalyticsEvent {
  system: any;
  action: string;
  delay: number;
  trigger?: string;
  attribute?: IPageAnalyticsEventAttribute[];
}

export interface IPageAnalyticsEventAttribute {
  key: string;
  value: string;
}

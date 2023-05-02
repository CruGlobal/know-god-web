export class KgwTraining {
  private _xmlString: string;
  pages: Array<any>;
  id?: string;

  constructor(xmlstring: string) {
    this._xmlString = xmlstring;
  }
}

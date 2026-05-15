const EventEmitter = require('events');

class AngularPipeLexer extends EventEmitter {
  constructor(options = {}) {
    super();
    this.keys = [];
    this.functions = options.functions || ['i18next'];
  }

  extract(content) {
    const pipeNames = this.functions.join('|');
    const pattern = new RegExp(
      `['"]([^'"\\\\]+)['"]\\s*\\|\\s*(?:${pipeNames})\\b`,
      'g'
    );
    const keys = [];
    let match;
    while ((match = pattern.exec(content)) !== null) {
      keys.push({ key: match[1] });
    }
    return keys;
  }
}

module.exports = {
  indentation: 4,
  locales: ['en'],
  output: 'src/assets/locales/$LOCALE/$NAMESPACE.json',
  input: ['src/**/*.{ts,html}'],
  failOnWarnings: true,
  verbose: true,
  sort: true,
  namespaceSeparator: false,
  keySeparator: false,
  defaultValue: (locale, namespace, key) => key,
  lexers: {
    html: [AngularPipeLexer]
  }
};

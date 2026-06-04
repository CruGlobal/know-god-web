# KnowGod.com embedable web app

This is an Angular 17 project created with TypeScript.

## Embed

```html
<div id="knowGodEmbed" data-book="kgp-us" data-lang="en"></div>
<script src="https://knowgod.com/embed.js"></script>
```

## Environments

- Production: https://knowgod.com/en
- Staging: https://stage.knowgod.com/en
- Development: https://dev.knowgod.com/en
- Local: http://localhost:4200/en

## Development

### Getting Started

First, make sure that you have a suitable version of Node.js. This project uses node v20.17.0. To check your node version, run `node --version`. If you don't have node v20.17.0 installed or a suitable version, the recommended way to install it is with [asdf](https://asdf-vm.com/), a development tool version manager.

You will also need to ensure you are using yarn version `4.7.0`.

```bash
# Install asdf and the node plugin
brew install asdf
asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git

# Integrate it with your shell
# ZSH shell integration is shown here, but for installation instructions for other shells, go to https://asdf-vm.com/guide/getting-started.html#_3-install-asdf
echo -e "\n. $(brew --prefix asdf)/libexec/asdf.sh" >> ${ZDOTDIR:-~}/.zshrc

# IMPORTANT: Close that terminal tab/window and open another one to apply the changes to your shell configuration file

# Install the version of node defined in this project's .tool-versions file
asdf install nodejs

# Check that the node version is now 20.17.0
node --version
```

#### Install & Run

Once you're on the correct node version, install the dependencies.

```bash
yarn
```

Run the development server:

```bash
yarn start
```

Run `start:dev` if you want to grab data from the staging DB.

Open [`http://localhost:4200`](http://localhost:4200) with your browser to view the site.

### Deploy

- Push to `staging` to auto-deploy to stage.knowgod.com
- Push to `main` to auto-deploy to knowgod.com

## Browser Support

Browser and device usage based on GA4 28-day active users for knowgod.com / GodTools (Apr 8 – May 5, 2026).

_Last updated: 2026-05-05; review annually._

**Targeted browsers** (`.browserslistrc`: `> 0.5%, last 2 versions, Firefox ESR, not dead`): the last 2 versions of Chrome, Edge, Firefox (and Firefox ESR), Safari (macOS & iOS), and other evergreen browsers above 0.5% global usage. Internet Explorer is not supported.

**By browser**

| Browser          | Share |
| :--------------- | :---- |
| Android Webview  | 50.5% |
| Chrome           | 36.2% |
| Safari           | 8.0%  |
| Samsung Internet | 2.5%  |
| Edge             | 1.1%  |
| Other            | <1%   |

**By device**

| Device  | Share |
| :------ | :---- |
| Mobile  | 86.5% |
| Desktop | 13.2% |
| Tablet  | 0.4%  |

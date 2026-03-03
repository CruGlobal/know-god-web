# KnowGod.com embedable web app

This is an Angular 17 project created with TypeScript.

## Embed

Add the following snippet to any HTML page to embed a KnowGod.com gospel presentation:

```html
<div id="knowGodEmbed" data-book="kgp-us" data-lang="en" data-ministry="your-ministry-name"></div>
<script src="https://knowgod.com/embed.js"></script>
```

### Data Attributes

| Attribute | Required | Description |
|---|---|---|
| `data-book` | Yes | The book/resource identifier (e.g. `kgp-us`, `satisfied`) |
| `data-lang` | Yes | Language code (e.g. `en`, `es`, `fr`) |
| `data-ministry` | No | Your ministry identifier. Used for analytics to track which ministries are embedding content. |

The script creates an iframe pointing to `https://knowgod.com/#/{lang}/{book}?embedded=true`. When `data-ministry` is provided, a `&ministry={value}` parameter is appended to the URL so the analytics service can attribute embeds to specific ministries.

### Testing the Embed Locally

A test page is available at `embed/test.html` to verify the embed script works correctly. Start the dev server and open the test page:

```bash
yarn start
# then open http://localhost:4200/embed/test.html
```

The test page uses `window.location.origin` to dynamically point the iframe at the current host, so it works in any environment without needing the `{appDomain}` placeholder that CI/CD replaces in the production `embed.js`.

You can change the `data-book`, `data-lang`, and `data-ministry` values and click **Reload Embed** to test different configurations. The log panel at the bottom shows the generated iframe URL and any `postMessage` height updates received from the embedded content.

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

## Documentation

Additional documentation can be found in the `docs/` directory.

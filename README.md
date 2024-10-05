
## Requirements

- Hugo Version 0.109.0 (extended) or higher
- Go language 1.18 or higher (require for hugo modules)
- Node version v18.x or later and npm 8.x or later.

## Usage

#### Running Locally

You can run your hugo site locally with the following steps:

##### 0. Download requirements

```bash
brew install hugo
sudo apt install golang-go
sudo apt install nodejs npm
```

##### 1. Generate node dependency configuration

Now run the following command to generate node dependency configuration. This will create the a `package.json` file in you repo.

```bash
hugo mod npm pack
```

##### 2. Install dependencies

Install the node dependencies using following command:


```bash
npm install
```

##### 3. Run your site

Now, run you site locally using following command.

```bash
hugo server -w
```

## Shortcodes

Here, are some handy shortcodes you can use with this theme.

- [Alert](https://toha-guides.netlify.app/posts/shortcodes/#alert)
- [Image](https://toha-guides.netlify.app/posts/shortcodes/#image)
- [Split](https://toha-guides.netlify.app/posts/shortcodes/#split)
- [Vertical Space](https://toha-guides.netlify.app/posts/shortcodes/#vertical-space)
- [Video](https://toha-guides.netlify.app/posts/shortcodes/#video)
- [Mermaid](https://hugo-toha.github.io/posts/shortcodes/#mermaid)

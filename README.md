# Visits

Profile views, plus followers and following on the larger cards.

An SVG for a GitHub profile. Place the URL in a README, on a site, or anywhere an image is allowed.

## Contents

- [Usage](#usage)
- [Themes](#themes)
- [Sizes](#sizes)
- [Parameters](#parameters)
- [Examples](#examples)
- [Generate files](#generate-files)
- [Run locally](#run-locally)
- [Deploy](#deploy)
- [Configuration](#configuration)
- [Contributing](#contributing)

## Usage

```text
https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran
```

```md
![visits](https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran)
```

Leave `theme` and `size` off for the classic regular card. It has a hairline border and a small corner. An unknown username, theme, or size still returns an SVG, so the image slot in a README stays intact.

## Themes

| Theme | Background | Mark |
| --- | --- | --- |
| `classic` | Pure Black `#000000` | white |
| `classic-r` | Pure Black `#000000` | N-Red `#C8102E` |
| `white` | Pure White `#FFFFFF` | black |
| `white-r` | Pure White `#FFFFFF` | N-Red `#C8102E` |
| `light` | N-Grey `#DCD7D2` | N-Red `#C8102E` |
| `red` | Pure Black `#000000` | N-Red `#C8102E` |
| `blue` | Pure White `#FFFFFF` | N-Blue `#002F6C` |
| `yellow` | Pure Black `#000000` | N-Yellow `#FFC700` |

The title is a dot grid. Labels are monospace. On `classic-r` and `white-r` the corner mark is N-Red. The badge keeps its split.

## Sizes

| Size | Dimensions | Contents |
| --- | --- | --- |
| `badge` | inline | “Profile views” and the count. |
| `mini` | 220×148 | The count and the start date. |
| `compact` | 495×180 | Views and followers. |
| `regular` | 408×195 | Views, followers, and following. Default. |
| `wide` | 896×220 | The same three counts, with the login at the top right. |

The files in `dist/` use the theme name, then the size: `classic-regular.svg`.

## Parameters

| Parameter | Required | Default | Purpose |
| --- | --- | --- | --- |
| `username` | yes |  | GitHub login. `user` is the same parameter. |
| `theme` | no | `classic` | One of the themes above. |
| `size` | no | `regular` | One of the sizes above. |
| `border` | no | `1` | `0` removes the border and uses the rounder corner. |

`badge` is the short inline count. Leave `size` off for the regular card.

## Examples

Previews use `itsrealkaran`.

### classic

#### badge

Use this when you want the short inline count.

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=classic&size=badge`

![visits classic badge](dist/itsrealkaran/classic-badge.svg)

#### mini

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=classic&size=mini`

![visits classic mini](dist/itsrealkaran/classic-mini.svg)

#### compact

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=classic&size=compact`

![visits classic compact](dist/itsrealkaran/classic-compact.svg)

#### regular

This is the default. You can leave `theme` and `size` off and get this card.

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=classic&size=regular`

![visits classic regular](dist/itsrealkaran/classic-regular.svg)

#### wide

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=classic&size=wide`

![visits classic wide](dist/itsrealkaran/classic-wide.svg)

### classic-r

#### badge

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=classic-r&size=badge`

![visits classic-r badge](dist/itsrealkaran/classic-r-badge.svg)

#### mini

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=classic-r&size=mini`

![visits classic-r mini](dist/itsrealkaran/classic-r-mini.svg)

#### compact

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=classic-r&size=compact`

![visits classic-r compact](dist/itsrealkaran/classic-r-compact.svg)

#### regular

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=classic-r&size=regular`

![visits classic-r regular](dist/itsrealkaran/classic-r-regular.svg)

#### wide

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=classic-r&size=wide`

![visits classic-r wide](dist/itsrealkaran/classic-r-wide.svg)

### white

#### badge

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=white&size=badge`

![visits white badge](dist/itsrealkaran/white-badge.svg)

#### mini

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=white&size=mini`

![visits white mini](dist/itsrealkaran/white-mini.svg)

#### compact

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=white&size=compact`

![visits white compact](dist/itsrealkaran/white-compact.svg)

#### regular

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=white&size=regular`

![visits white regular](dist/itsrealkaran/white-regular.svg)

#### wide

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=white&size=wide`

![visits white wide](dist/itsrealkaran/white-wide.svg)

### white-r

#### badge

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=white-r&size=badge`

![visits white-r badge](dist/itsrealkaran/white-r-badge.svg)

#### mini

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=white-r&size=mini`

![visits white-r mini](dist/itsrealkaran/white-r-mini.svg)

#### compact

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=white-r&size=compact`

![visits white-r compact](dist/itsrealkaran/white-r-compact.svg)

#### regular

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=white-r&size=regular`

![visits white-r regular](dist/itsrealkaran/white-r-regular.svg)

#### wide

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=white-r&size=wide`

![visits white-r wide](dist/itsrealkaran/white-r-wide.svg)

### light

#### badge

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=light&size=badge`

![visits light badge](dist/itsrealkaran/light-badge.svg)

#### mini

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=light&size=mini`

![visits light mini](dist/itsrealkaran/light-mini.svg)

#### compact

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=light&size=compact`

![visits light compact](dist/itsrealkaran/light-compact.svg)

#### regular

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=light&size=regular`

![visits light regular](dist/itsrealkaran/light-regular.svg)

#### wide

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=light&size=wide`

![visits light wide](dist/itsrealkaran/light-wide.svg)

### red

#### badge

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=red&size=badge`

![visits red badge](dist/itsrealkaran/red-badge.svg)

#### mini

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=red&size=mini`

![visits red mini](dist/itsrealkaran/red-mini.svg)

#### compact

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=red&size=compact`

![visits red compact](dist/itsrealkaran/red-compact.svg)

#### regular

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=red&size=regular`

![visits red regular](dist/itsrealkaran/red-regular.svg)

#### wide

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=red&size=wide`

![visits red wide](dist/itsrealkaran/red-wide.svg)

### blue

#### badge

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=blue&size=badge`

![visits blue badge](dist/itsrealkaran/blue-badge.svg)

#### mini

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=blue&size=mini`

![visits blue mini](dist/itsrealkaran/blue-mini.svg)

#### compact

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=blue&size=compact`

![visits blue compact](dist/itsrealkaran/blue-compact.svg)

#### regular

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=blue&size=regular`

![visits blue regular](dist/itsrealkaran/blue-regular.svg)

#### wide

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=blue&size=wide`

![visits blue wide](dist/itsrealkaran/blue-wide.svg)

### yellow

#### badge

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=yellow&size=badge`

![visits yellow badge](dist/itsrealkaran/yellow-badge.svg)

#### mini

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=yellow&size=mini`

![visits yellow mini](dist/itsrealkaran/yellow-mini.svg)

#### compact

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=yellow&size=compact`

![visits yellow compact](dist/itsrealkaran/yellow-compact.svg)

#### regular

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=yellow&size=regular`

![visits yellow regular](dist/itsrealkaran/yellow-regular.svg)

#### wide

`https://github.com/itsrealkaran/nothing-github-visits?username=itsrealkaran&theme=yellow&size=wide`

![visits yellow wide](dist/itsrealkaran/yellow-wide.svg)

## Generate files

Write the SVG files into the repo when you want a fixed picture instead of a live URL.

```bash
python3 render.py itsrealkaran
```

Python 3 is enough. There is no package to install. Files land in `dist/<login>/`. Public numbers use `gh` when it is signed in on that machine, or `GH_TOKEN` / `GITHUB_TOKEN`.

## Run locally

The Python container and the Node server use the same path and the same query.

### Python container

```bash
docker build -t visits .
docker run --env GH_TOKEN --env PORT=8080 -p 8080:8080 visits
```

If the token is in a local `.env` file, pass that file instead:

```bash
docker run --env-file .env --env PORT=8080 -p 8080:8080 visits
```

The container runs `serve.py`. Open `http://127.0.0.1:8080/visits?username=itsrealkaran`.

The image does not include the `gh` command. Set `GH_TOKEN` when you start it. Without a token, GitHub allows about 60 requests an hour.

### Node

```bash
node server.js
```

The server listens on port `8080`. It reads `GH_TOKEN` from the environment, or from a `.env` file in this folder. `python3 render.py` remains the command that writes `dist/`.

Vercel and Netlify can host `server.js`. Set `GH_TOKEN` on the project. `vercel.json` is included. A free function has a short time limit. Use the Python container when a request needs longer than that limit.

## Deploy

Fork this repo for your own host. Your copy stays awake if a shared deploy sleeps, your traffic stays off a shared GitHub limit, and you can add a token for your own counts.

1. Fork the repo.
2. Deploy the Dockerfile on Fly, Railway, Render, Cloud Run, or a virtual machine. Or deploy `server.js` on Vercel or Netlify.
3. Set the variables below as secrets. Do not commit them.
4. Open `https://github.com/itsrealkaran/nothing-github-visits?username=yourname`.

Use that address in the image URL. The query stays the same.

## Configuration

| Variable | Required | Purpose |
| --- | --- | --- |
| `GH_TOKEN` | for a public server | GitHub token. `GITHUB_TOKEN` is the same variable. |
| `PORT` | no | Listen port. Default `8080`. |
| `CARD_CACHE_SECONDS` | no | How long a finished SVG is reused. Default `60`, so a profile view count does not sit for an hour. |

### Create a token

1. On GitHub, open Settings, then Developer settings, then Personal access tokens, then Tokens (classic).
2. Generate a new token.
3. Public cards need no extra scopes. The token raises the server limit from about 60 requests an hour to 5,000.
4. Set the value as `GH_TOKEN` on the host. Do not put it in the image URL, this README, or git.

## Contributing

This folder is the card: the drawing, the GitHub fetch, and both servers.

1. Fork the repo and edit `render.py`, or the files beside it when the change is the data or the colours.
2. Draw a sample with `python3 render.py yourname` and open `dist/yourname/`.
3. The live routes use that same drawing.
4. Do not commit a token, a `.env` file, or a private repository name.
5. Open a pull request and name the theme and size you checked.

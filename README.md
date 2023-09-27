# dzfg - Download Zipball From GitHub

## How to use

The idea of this package, is to make downloading / extracting / installing a GitHub repo's latest release a breeze. Both in the terminal, and programmatically  if you are into that kind of thing...

### Terminal Usage

#### Simple usage...

`npx dzfg <new-folder> <github-repo>`

For example, if you wanted to "clone" (download the zipball, and extract it) the repo [sails-react-bootstrap-webpack](https://github.com/neonexus/sails-react-bootstrap-webpack), just do something like:

```shell
npx dzfg my-new-site neonexus/sails-react-bootstrap-webpack
```

#### A little more advanced...

You can disable the `npm install` after extraction:
`npx dzfg <new-folder> <github-repo> <no-npm?>`

You can also provide a specific version to download / extract: `npx dzfg <new-folder> <github-repo> <version?> <no-npm?>`

This will download `v4.2.0`, and will skip the `npm install` step:
```shell
npx dzfg my-new-site neonexus/sails-react-bootstrap-webpack v4.2.0 no-npm
```

### Programmatic Usage

Using `.then()`:

```javascript
const dzfg = require('dzfg');

dzfg.downloadAndExtract('destination-folder', 'username/my-repo').then(() => {});

// OR

dzfg.downloadAndExtract({
    repo: 'username/my-repo',
    destinationFolder: 'my-clone'
}).then(() => {});
```

Using `await`:
```javascript
const dzfg = require('dzfg');

await dzfg.downloadAndExtract('destination-folder', 'username/my-repo');

// OR

await dzfg.downloadAndExtract({
    repo: 'username/my-repo',
    destinationFolder: 'my-clone'
});
```

Advanced usage:

```javascript
const dzfg = require('dzfg');

// Parameters are: destination-folder, repo, version, skipNpmInstall
await dzfg.downloadAndExtract('destination-folder', 'username/my-repo', 'v1.0.1', true);

// OR
await dzfg.downloadAndExtract({
    repo: 'username/my-repo',
    version: 'v1.0.1',
    skipInstall: true,
    destinationFolder: 'my-clone'
});
```

## This works for ALMOST any GitHub repo...

As long as the repository is using GitHub's releases feature correctly, this script will work.

If a call to `https://api.github.com/repos/{repo-name-here}/releases/latest` returns a `name` and `zipball_url` properties, then the script will download the zipball from `zipball_url`.

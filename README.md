# dzfg - Download Zipball From GitHub

[![npm](https://img.shields.io/npm/dm/dzfg?logo=npm&style=plastic)](https://www.npmjs.com/package/dzfg) [![License](https://img.shields.io/badge/license-GPL--3.0-orange?style=plastic)](https://github.com/neonexus/dzfg/blob/release/LICENSE)

The idea of this package, is to make downloading / extracting / installing a GitHub repo's latest release a breeze (without creating a new repo, or using Git for that matter). Both in the terminal, and programmatically, if you are into that kind of thing...

`npx dzfg <github-username/repo>`

## This works for ALMOST any GitHub repo...

As long as the repository is using [GitHub's releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases) feature, this script will work.

If a call to `https://api.github.com/repos/{username/repo}/releases/latest` returns a `tag_name` and `zipball_url`, then the script will download the zipball from `zipball_url`.

Additionally, if the repo contains a `package.json` after extraction, `npm install` will be run automatically, unless disabled. See [advanced usage](#a-little-more-advanced) for more.

## Table of Contents

* [Terminal Usage](#terminal-usage)
  * [Simple Usage](#simple-usage)
  * [A Little More Advanced](#a-little-more-advanced)
* [Programmatic Usage](#programmatic-usage)
  * [Advanced Usage](#advanced-usage)
  * [Getting Version Info for a Repo](#getting-version-info-for-a-repo)
  * [Don't Forget to Handle Errors...](#dont-forget-to-handle-errors)

## Terminal Usage

### Simple Usage

`npx dzfg <github-repo>`

OR

`npx dzfg <github-repo> <new-folder-name>`

For example, if you wanted to "clone" (download the zipball, and extract it) the repo [sails-react-bootstrap-webpack](https://github.com/neonexus/sails-react-bootstrap-webpack), just do something like:

```shell
npx dzfg neonexus/sails-react-bootstrap-webpack
```

This will download / extract / `npm install` the repo into a new folder `sails-react-bootstrap-webpack`. To change where the files get extracted to, add a second parameter to the command:

```shell
npx dzfg neonexus/sails-react-bootstrap-webpack my-new-site
````

This will extract into `my-new-site`, instead of the repo name.

### A Little More Advanced

If the repo contains a `package.json` in the root, but you don't want to `npm install` after extraction, just add `no-npm`:

`npx dzfg <github-repo> <no-npm?>`

**OR**

`npx dzfg <github-repo> <new-folder> <no-npm?>`

You can also provide a specific version to download / extract:

`npx dzfg <github-repo> <new-folder> <version?> <no-npm?>`

**NOTE:** When supplying a version, you **MUST** supply a folder name.

This will download `v4.2.3`, into the folder `my-new-site`, and will skip the `npm install` step:
```shell
npx dzfg neonexus/sails-react-bootstrap-webpack my-new-site v4.2.3 no-npm
```

## Programmatic Usage

Using `.then()`:

```javascript
const dzfg = require('dzfg');

dzfg.downloadAndExtract('username/my-repo', 'new-folder').then((downloadInfo) => {});

// OR

dzfg.downloadAndExtract({
    repo: 'username/my-repo',
    destinationFolder: 'my-clone'
}).then((downloadInfo) => {});
```

Using `await`:
```javascript
const dzfg = require('dzfg');

const downloadInfo = await dzfg.downloadAndExtract('username/my-repo', 'new-folder');

// OR

const downloadInfo = await dzfg.downloadAndExtract({
    repo: 'username/my-repo',
    destinationFolder: 'my-clone'
});
```

`downloadInfo` will look something like:

```json5
{
    version: 'v1.0.1',
    downloadTime: '714.82 ms',
    extractionTime: '55.17 ms',
    installationTime: '2.75 s',
    totalTime: '3.61 s',
    zipballSize: '45.11 KiB',
    extractedSize: '146.73 KiB',
    installedSize: '19.45 MiB'
}
```

### Advanced usage

```javascript
const dzfg = require('dzfg');

// Parameters are: destination-folder, repo, version, skipNpmInstall
const downloadInfo = await dzfg.downloadAndExtract('username/my-repo', 'new-folder', 'v1.0.1', true);

// OR
const downloadInfo = await dzfg.downloadAndExtract({
    repo: 'username/my-repo',
    version: 'v1.0.1',
    skipInstall: true,
    destinationFolder: 'my-clone'
});
```

### Getting Version Info for a Repo

```javascript
const dzfg = require('dzfg');

const latestVersionInfo = await dzfg.getVersionInfo('username/my-repo');

// OR

dzfg.getVersionInfo('username/my-repo').then((latestVersionInfo) => {
    // Do stuff with the info...
});
```

`latestVersionInfo` will look something like:

```json5
{
    name: 'v1.0.1 (2023-10-01)',
    description: 'The version description body. This will likely contain markdown.',
    version: 'v1.0.1',
    isDraft: false,
    isPrerelease: false,
    createdAt: '2023-10-01T04:19:00Z',
    publishedAt: '2023-10-01T04:19:00Z',

    // `userSite` is the HTML URL for human use:
    userSite: 'https://github.com/{username/repo}/releases/tag/v1.0.1',

    // `zipball` is the URL dzfg will use internally to download the repo:
    zipball: 'https://api.github.com/repos/{username/repo}/zipball/v1.0.1'
}
```

Get info for a specific version:

```javascript
const dzfg = require('dzfg');

const latestVersionInfo = await dzfg.getVersionInfo('username/my-repo', 'v1.0.1');
```

### Don't Forget to Handle Errors...

```javascript
const dzfg = require('dzfg');

dzfg.downloadAndExtract('username/my-repo', 'new-folder')
    .then((successMessage) => {})
    .catch((e) => {});

dzfg.getVersionInfo('username/my-repo')
    .then((latestVersionInfo) => {})
    .catch((e) => {});

// OR

try {
    const downloadInfo = await dzfg.downloadAndExtract('username/my-repo', 'new-folder');
} catch (e) {
    // Display the error...
}

try {
    const latestVersionInfo = await dzfg.getVersionInfo('username/my-repo');
} catch (e) {
    // Display the error...
}
```

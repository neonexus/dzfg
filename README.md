# dzfg - Download Zipball From GitHub



## How to use

The idea of this package, is to make downloading / extracting / installing a GitHub repo's latest release a breeze (without creating a new repo, or Git for that matter). Both in the terminal, and programmatically, if you are into that kind of thing...

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

You can also provide a specific version to download / extract:

`npx dzfg <new-folder> <github-repo> <version?> <no-npm?>`

This will download `v4.2.0`, and will skip the `npm install` step:
```shell
npx dzfg my-new-site neonexus/sails-react-bootstrap-webpack v4.2.0 no-npm
```

### Programmatic Usage

Using `.then()`:

```javascript
const dzfg = require('dzfg');

dzfg.downloadAndExtract('new-folder', 'username/my-repo').then(() => {});

// OR

dzfg.downloadAndExtract({
    repo: 'username/my-repo',
    destinationFolder: 'my-clone'
}).then(() => {});
```

Using `await`:
```javascript
const dzfg = require('dzfg');

await dzfg.downloadAndExtract('new-folder', 'username/my-repo');

// OR

await dzfg.downloadAndExtract({
    repo: 'username/my-repo',
    destinationFolder: 'my-clone'
});
```

#### Advanced usage:

```javascript
const dzfg = require('dzfg');

// Parameters are: destination-folder, repo, version, skipNpmInstall
await dzfg.downloadAndExtract('new-folder', 'username/my-repo', 'v1.0.1', true);

// OR
await dzfg.downloadAndExtract({
    repo: 'username/my-repo',
    version: 'v1.0.1',
    skipInstall: true,
    destinationFolder: 'my-clone'
});
```

#### Getting version info for a repo:

```javascript
const dzfg = require('dzfg');

const latestVersionInfo = await dzfg.getVersionAndUrls('username/my-repo');

// OR

dzfg.getVersionAndUrls('username/my-repo').then((latestVersionInfo) => {
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

const latestVersionInfo = await dzfg.getVersionAndUrls('username/my-repo', 'v1.0.1');
```

#### Don't forget to handle errors...

```javascript
const dzfg = require('dzfg');

dzfg.downloadAndExtract('new-folder', 'username/my-repo')
    .then((successMessage) => {})
    .catch((e) => {});

dzfg.getVersionAndUrls('username/my-repo')
    .then((latestVersionInfo) => {})
    .catch((e) => {});

// OR

try {
    const successMessage = await dzfg.downloadAndExtract('new-folder', 'username/my-repo');
} catch (e) {
    // Display the error...
}

try {
    const latestVersionInfo = await dzfg.getVersionAndUrls('username/my-repo');
} catch (e) {
    // Display the error...
}
```

## This works for ALMOST any GitHub repo...

As long as the repository is using GitHub's releases feature correctly, this script will work.

If a call to `https://api.github.com/repos/{username/repo}/releases/latest` returns a `tag_name` and `zipball_url`, then the script will download the zipball from `zipball_url`.

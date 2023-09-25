# dzfg

Download Zipball From GitHub

## How to use

The idea of this package, is to make downloading / extracting a GitHub repo's latest release a breeze.

```shell
npx dzfg <new-folder> <github-repo>
```

For example, if I wanted to "clone" (download the zipball, and extract it) the repo [sails-react-bootstrap-webpack](https://github.com/neonexus/sails-react-bootstrap-webpack), just do something like:

```shell
npx dzfg my-new-site neonexus/sails-react-bootstrap-webpack
```

## This works for ALMOST any GitHub repo...

As long as the repository is using GitHub's releases feature correctly, this script will work.

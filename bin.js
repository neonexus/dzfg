#!/usr/bin/env node

const dzfg = require('./lib');

const destinationFolder = process.argv[2];
const repo = process.argv[3];
let version = process.argv[4];
const skipInstall = (process.argv[5] === 'no-npm' || version === 'no-npm');

if (version === 'no-npm') {
    version = null;
}

function badStart(dest = '<new-folder>') {
    console.error('Usage: npx dzfg ' + dest + ' <github-repo>');
    console.error('Where <github-repo> should be in the format "username/my-awesome-repo".');
    process.exit(1);
}

if (!destinationFolder || destinationFolder === '') {
    return badStart();
}

if (!repo || repo === '') {
    return badStart(destinationFolder);
}

dzfg.downloadAndExtract(destinationFolder, repo, version, skipInstall).then((downloadedVersion) => {
    let wasLatest = '';

    if (!version || version === '') {
        wasLatest = 'Latest release of ';
    }

    console.log('');
    console.log(wasLatest + '"' + repo + '" (' + downloadedVersion + ') downloaded and extracted to "' + destinationFolder + '" successfully!');
    console.log('');
}).catch((e) => {
    console.error(e);
});

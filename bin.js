#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');
const unzip = require('extract-zip');
const {spawn} = require('child_process'); // Use spawn instead of execSync

const nameForTheZipFile = 'latest-release-dzfg.zip';
const extractionPointName = 'temp-extraction-dzfg';

const destinationFolder = process.argv[2];
const repo = process.argv[3];

function badStart(dest = '<new-folder>'){
    console.error('Usage: npx dzfg ' + dest + ' <github-repo>');
    console.error('Where <github-repo> should be in the format "username/my-awesome-repo".');
    process.exit(1);
}

if (!destinationFolder || destinationFolder === '') {
    badStart();
}

if (!repo || repo === '') {
    badStart(destinationFolder);
}

const options = {
    hostname: 'api.github.com',
    path: '/repos/' + repo + '/releases/latest',
    headers: {
        'User-Agent': 'npx dzfg'
    }
};

// Lookup the latest release information
https.get(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const release = JSON.parse(data);
        const zipUrl = 'https://codeload.github.com/' + repo + '/zip/refs/tags/' + release.name;

        const zipFilePath = path.join(process.cwd(), nameForTheZipFile);
        const extractionPoint = path.join(process.cwd(), extractionPointName);

        const zipFile = fs.createWriteStream(zipFilePath);

        // Download the latest release zip file
        https.get(zipUrl, (res) => {
            res.pipe(zipFile);

            zipFile.on('finish', () => {
                zipFile.close();

                let dirToBeMoved;

                unzip(zipFilePath, {
                    dir: extractionPoint,
                    onEntry: (entry) => {
                        if (!dirToBeMoved) {
                            // This is the folder that gets extracted inside the extraction-point folder.
                            // Something like: my-repo-of-awesome-4.2.2
                            dirToBeMoved = path.join(extractionPoint, entry.fileName);
                        }
                    }
                }).then(() => {
                    // Move our extracted folder to its final destination.
                    fs.renameSync(dirToBeMoved, path.join(process.cwd(), destinationFolder));

                    // Delete the downloaded zip file.
                    fs.unlinkSync(zipFilePath);

                    // Delete the extraction point.
                    fs.rmdirSync(extractionPoint);

                    console.log('Latest release (' + release.name + ') downloaded and extracted to "' + destinationFolder + '" successfully!');

                    console.log('Attempting to install dependencies...');

                    // Use spawn to run 'npm install'
                    const npmInstall = spawn('npm', ['install'], {cwd: destinationFolder, stdio: 'inherit'});

                    npmInstall.on('error', (err) => {
                        console.error(`Error: ${err.message}`);
                    });

                    npmInstall.on('close', (code) => {
                        if (code === 0) {
                            console.log('npm install completed successfully.');
                        } else {
                            console.error(`npm install failed with code ${code}`);
                        }

                        console.log('All done!');
                    });
                });
            });
        });
    });
}).on('error', (err) => {
    console.error(`Error: ${err.message}`);
});

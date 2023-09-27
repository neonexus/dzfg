const https = require('https');
const path = require('path');
const fs = require('fs');
const unzip = require('extract-zip');
const {spawn} = require('child_process');
const currentVersion = require('./package.json').version;

const zipFilePath = path.join(process.cwd(), 'latest-release-dzfg.zip');
const extractionPoint = path.join(process.cwd(), 'temp-extraction-dzfg');

const reqOptions = {
    headers: {
        'User-Agent': 'npx dzfg (v' + currentVersion + ')'
    }
};

// Private functions
const lib = {
    downloadZipball: (zipballUrl) => new Promise((resolve, reject) => {
        if (!zipballUrl || zipballUrl === '') {
            return reject('Zipball URL is required.');
        }

        const zipFile = fs.createWriteStream(zipFilePath);

        function downloadIt(currentUrl) {
            https.get(currentUrl, reqOptions, (res) => {
                if (res.statusCode === 302) {
                    return downloadIt(res.headers.location);
                } else if (res.statusCode !== 200) {
                    return reject('Bad status code when downloading zipball: ' + res.statusCode);
                }

                res.pipe(zipFile);

                zipFile.on('finish', () => {
                    zipFile.close();

                    return resolve();
                });
            });
        }

        downloadIt(zipballUrl);
    }),

    extractZipball: (destinationFolder) => new Promise((resolve, reject) => {
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
            try {
                fs.renameSync(dirToBeMoved, path.join(process.cwd(), destinationFolder));
            } catch (e) {
                return reject(e);
            }

            lib.__cleanup();

            return resolve();
        }).catch((e) => {
            lib.__cleanup();

            return reject(e);
        });
    }),

    runNpmInstall: (destinationFolder) => new Promise((resolve, reject) => {
        const npmInstall = spawn('npm', ['install'], {cwd: destinationFolder, stdio: 'inherit'});

        npmInstall.on('error', (err) => {
            return reject(err);
        });

        npmInstall.on('close', (code) => {
            if (code === 0) {
                return resolve();
            }

            return reject('npm install failed with code: ' + code);
        });
    }),

    __cleanup: () => {
        // Delete the downloaded zip file.
        fs.unlinkSync(zipFilePath);

        // Delete the extraction point.
        fs.rmdirSync(extractionPoint);
    }
};

// Public functions
const dzfg = {
    /**
     * @typedef optionsObj
     * @property {string} destinationFolder - The place to extract the repo into. Relative to the current working directory.
     * @property {string} repo - The GitHub repo to download / clone. Should be in the form: repo/my-awesome-repo
     * @property {string} [version=latest] - The release version to download. Blank / empty / falsy or 'latest' will force a lookup of the latest version.
     * @property {boolean} [skipInstall=false] - Whether to skip `npm install` or not.
     */
    /**
     * Download and Extract the zipball from a GitHub repo. Defaults to the latest release.
     *
     * @param {string|optionsObj} destinationFolder - The place to extract the repo into. Relative to the current working directory.
     * @param {string} repo - The GitHub repo to download / clone. Should be in the form: repo/my-awesome-repo
     * @param {string} [version=latest] - The release version to download. Blank / empty / falsy or 'latest' will force a lookup of the latest version.
     * @param {boolean} [skipInstall=false] - Whether to skip `npm install` or not.
     *
     * @returns {Promise<string>} The version that was downloaded and extracted.
     */
    downloadAndExtract: (destinationFolder, repo, version = 'latest', skipInstall = false) => new Promise(async (resolve, reject) => {
        if (typeof destinationFolder === 'object') {
            if (!destinationFolder.repo || destinationFolder.repo === '' || !destinationFolder.destinationFolder || destinationFolder.destinationFolder === '') {
                return reject('When calling `dzfg.downloadZipballFromGitHub(options)`, `options.repo` and `options.destinationFolder` are required!');
            }

            repo = destinationFolder.repo;
            version = destinationFolder.version || null;
            skipInstall = destinationFolder.skipInstall;
            destinationFolder = destinationFolder.destinationFolder;
        }

        const release = await dzfg.getVersionAndZipballUrl(repo, version).catch((e) => {
            return reject(e);
        });

        if (release) {
            lib.downloadZipball(release.zipball).then(() => {
                lib.extractZipball(destinationFolder).then(async () => {
                    if (!skipInstall && fs.existsSync(path.join(process.cwd(), destinationFolder, 'package.json'))) {
                        await lib.runNpmInstall(destinationFolder).catch((e) => {});
                    }

                    return resolve(release.version);
                }).catch((e) => {
                    return reject(e);
                });
            }).catch((e) => {
                return reject(e);
            });
        }
    }),

    /**
     * @typedef versionAndZipUrl
     * @property {string} version - The version returned from the API.
     * @property {string} zipball - The URL for the zipball.
     */
    /**
     * Get Version and Zipball URL
     *
     * @param {string} repo - The GitHub repo to get info for.
     * @param {string} [version=latest] - The version to get the zipball URL for.
     *
     * @returns {Promise<versionAndZipUrl>}
     */
    getVersionAndZipballUrl: (repo, version = 'latest') => new Promise((resolve, reject) => {
        if (!version || version === '') {
            version = 'latest';
        }

        if (version !== 'latest') {
            version = 'tags/' + version; // Why GitHub, why?...
        }

        https.get('https://api.github.com/repos/' + repo + '/releases/' + version, reqOptions, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const release = JSON.parse(data);

                if (release.message === 'Not Found' || !release.name || release.name === '' || !release.zipball_url || release.zipball_url === '') {
                    console.log(release);
                    return reject('The repo "' + repo + '" does not appear to be using GitHub releases, does not exist, or the version requested does not exist.');
                }

                return resolve({
                    version: release.name,
                    zipball: release.zipball_url
                });
            });
        }).on('error', (err) => {
            return reject(err);
        });
    })
};

module.exports = dzfg;

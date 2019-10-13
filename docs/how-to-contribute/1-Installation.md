Installation Instructions
=========================

Clone the repository and run:

```shell
npm install
node_modules/.bin/gulp build
```

Then duplicate the `web/dev-local.html` file into `web/dev.html` (non versionned).

Run the server:

```shell
node_modules/.bin/http-server
```

Go to:
http://localhost:8080/web/dev.html

Gulp Tasks
----------

- Build: `node_modules/.bin/gulp build`
- Watch for changes, and automatically build: `node_modules/.bin/gulp watch`
- Create new distribution files: `node_modules/.bin/gulp cleanDist && node_modules/.bin/gulp build && node_modules/.bin/gulp dist && node_modules/.bin/gulp production`
- Add new entries of 'en.ts' to the other locale files: `node_modules/.bin/gulp addMissingEntries`
- Add new entries of 'en.ts' to the other locale files : `gulp i18nAddMissingEntries`


Continue With
-------------

[Coding conventions](2-Coding-conventions.md)

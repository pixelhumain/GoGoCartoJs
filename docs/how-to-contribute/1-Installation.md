Installation instructions
=======================

Simply clone the repository and run
```
npm install
gulp build
```
Then duplicate the web/dev-local.html file into web/dev.html (non versionned), and go to
http://localhost/GoGoCartoJs/web/dev.html

Gulp tasks
----------

- Build : `gulp build`
- Watch for changes, and automatically build : `gulp watch`
- Create new distribution files : `gulp cleanDist && gulp build && gulp dist && gulp production`


Continue with
----
[Coding conventions](2-Coding-conventions.md)


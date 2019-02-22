# casinocoin-libjs library bundle

```bash
# install all package dependencies
$ lerna bootstrap

# -- libjs library --
$ npm run libjs:dev
$ npm run libjs:build

# -- libjs test --
$ npm run libjs:test # mocha only
$ npm run libjs:test-ci
$ npm run libjs:test-coverage # with istanbul report coverage

# clean all packages
$ lerna clean
```
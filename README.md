# casinocoin-libjs library bundle

The CasinoCoin Javascript artifacts have been re-organized into a monorepo leveraging [Lerna](https://github.com/lerna/lerna). This provides the following benefits:

* Single coherent physical location of library artifacts
* Scoped namespace: @casinocoin
* Logical categorization under the @casinocoin namespace, for example:
  * @casinocoin/libjs
  * @casinocoin/libjs-transactionparser
* Synchronized or independent versioning based on business need and patches/fixes

## Package TOC

* [@casinocoin/libjs](/packages/libjs/README.md)

## Key CLI Commands

The following commands can be executed from the root directory, eliminating the need to `cd` into sub-directories and run commands.

```bash
# install root dependencies
$ npm i

# install all package dependencies
$ lerna bootstrap

# -- libjs library --
# Start development environemnt for @casinocoin/libjs
$ npm run libjs:dev

# Build @casinocoin/libjs package
$ npm run libjs:build
$ npm run libjs:pack # generates tarball in root tgz directory
$ npm run libjs:test # mocha

# Pack @casinocoin/libjs.
$ npm run libjs:pack

# clean all packages
$ lerna clean
```

For more information, please see [Lerna](https://github.com/lerna/lerna).

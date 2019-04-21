# Casinocoin Javascript Asset Bundle

CasinoCoin JavaScript assets have been organized into a monorepo leveraging [Lerna](https://github.com/lerna/lerna). This affords partners and contributors a single coherent location to build on the world's leading open source, blockchain-backed digital currency designed specifically for the regulated gaming industry.

## Package TOC

* [@casinocoin/libjs](/packages/libjs/README.md)

## Key CLI Commands

The following commands can be executed from the root directory, eliminating the need to `cd` into sub-directories and run commands.

```bash
# install root dependencies
$ npm i

# -- lerna --
# install all package dependencies
$ lerna bootstrap

# clean all package dependencies
$ lerna clean

# -- libjs library --
# starts development environment for @casinocoin/libjs
$ npm run libjs:dev

# builds @casinocoin/libjs package
$ npm run libjs:build

# generates tarball in root tgz directory (strictly for testing)
$ npm run libjs:pack

# mocha-based test suite (WIP)
$ npm run libjs:test
```

## Additional Resources

* [License](LICENSE)
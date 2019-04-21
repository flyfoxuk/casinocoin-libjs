# Casinocoin Javascript Asset Bundle

CasinoCoin JavaScript assets have been organized into a monorepo leveraging [Lerna](https://github.com/lerna/lerna). This affords partners and contributors a single location to build software solutions on the world's leading open source, blockchain-backed digital currency designed specifically for the regulated gaming industry.

## Assets

| package                  | description                                                                                                                                                               | dependencies                                                                            |
| ---                      | ---                                                                                                                                                                       | ---                                                                                     |
| [`@casinocoin/libjs`](./packages/libjs)      | A JavaScript API for interacting with the casinocoind server using Node.js or browser clients.                                                        | none                                                                                    |

## Quick Start

```bash
# install root dependencies
$ npm i

# install dependencies for all packages
$ lerna bootstrap

# clean all package dependencies
$ lerna clean
```

The following package-specific commands can be executed from the root directory, eliminating the need to `cd` into sub-directories and run commands.

### @casinocoin/libjs

```bash
# starts Webpack development console and watches packages/libjs/src directory
$ npm run libjs:dev

# builds @casinocoin/libjs package
$ npm run libjs:build

# generates tarball in root tgz directory (strictly for testing)
$ npm run libjs:pack

# mocha-based test suite
$ npm run libjs:test
```

## Related Documents

+ [License](LICENSE)
+ [ChangeLog](CHANGELOG.md)

## More Information

+ [Casinocoin Dev Portal](https://casinocoin.org/build/)
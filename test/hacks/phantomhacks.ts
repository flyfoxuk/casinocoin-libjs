// this one will be directly run in browser

(() => {
  const phantomTest = /PhantomJS/;
  if (phantomTest.test(navigator.userAgent)) {
    // mocha-phantomjs-core has wrong shim for Function.bind, so we
    // will replace it with correct one
    // this bind polyfill copied from MDN documentation
    Function.prototype.bind = (oThis) => {
      if (typeof this !== "function") {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError(
          "Function.prototype.bind - what is trying to be bound is not callable",
        );
      }

      const aArgs = Array.prototype.slice.call(arguments, 1);
      const fToBind = this;
      /* tslint:disable-next-line:no-empty */
      const FNOP = () => {};
      const fBound = () => {
        return fToBind.apply(this instanceof FNOP ? this : oThis,
          aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      if (this.prototype) {
        // native functions don't have a prototype
        FNOP.prototype = this.prototype;
      }
      // new FNOP();
      fBound.prototype = FNOP();

      return fBound;
    };
  }
})();

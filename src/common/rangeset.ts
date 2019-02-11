import * as _ from "lodash";
import * as assert from "assert";

const ranges = Symbol();

type Interval = [number, number];

function mergeIntervals(intervals: Interval[]): Interval[] {
  const stack: Interval[] = [[-Infinity, -Infinity]];
  _.sortBy(intervals, (x) => x[0]).forEach((interval) => {
    const lastInterval: [number, number]|undefined = stack.pop();
    if (lastInterval) {
      if (interval[0] <= lastInterval[1] + 1) {
        stack.push([lastInterval[0], Math.max(interval[1], lastInterval[1])]);
      } else {
        stack.push(lastInterval);
        stack.push(interval);
      }
    }
  });
  return stack.slice(1);
}

class RangeSet {
  constructor() {
    this.reset();
  }

  public reset() {
    this[ranges] = [];
  }

  public serialize() {
    return this[ranges].map((range) =>
      range[0].toString() + "-" + range[1].toString()).join(",");
  }

  public addRange(start: number, end: number) {
    assert(start <= end, "invalid range");
    this[ranges] = mergeIntervals(this[ranges].concat([[start, end]]));
  }

  public addValue(value: number) {
    this.addRange(value, value);
  }

  public parseAndAddRanges(rangesString: string) {
    const rangeStrings = rangesString.split(",");
    _.forEach(rangeStrings, (rangeString) => {
      const range = rangeString.split("-").map(Number);
      this.addRange(range[0], range.length === 1 ? range[0] : range[1]);
    });
  }

  public containsRange(start: number, end: number) {
    return _.some(this[ranges], (range) => range[0] <= start && range[1] >= end);
  }

  public containsValue(value: number) {
    return this.containsRange(value, value);
  }
}

export default RangeSet;

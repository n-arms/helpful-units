export class Unit {
  constructor(parts, quantity=1) {
    if (!(parts instanceof Object)) throw new Error("Unit constructor was called with " + parts);
    this.parts = parts;
    this.quantity = quantity;
  }

  static parse(input, basis=metric) {
    const unit = new Unit({}, 1);
    let afterSlash = false;

    const words = input.split(" ");
    
    for (let word of words) {
      word = word.trim().toLowerCase();
      if (word === "/" || word === "per") {
        afterSlash = true;
      } else if (word !== "") {
        if (word[word.length - 1] === "s" && word.length > 1) {
          word = word.slice(0, -1);
        }
        if (!(basis.hasBaseUnit(word))) {
          throw new UnknownUnitError(word); 
        }
        const baseUnit = new Unit(Object.fromEntries([[word, 1]], 1));
        if (afterSlash) {
          unit.divide(baseUnit);
        } else {
          unit.multiply(baseUnit);
        }
      }
    }

    return unit;
  }

  toString() {
    let positive = [];
    for (const part in this.parts) {
      if (this.parts[part] > 0) {
        for (let i = 0; i < this.parts[part]; ++i) {
          positive.push(part);
        }
      }
    }
    let negative = [];
    for (const part in this.parts) {
      if (this.parts[part] < 0) {
        for (let i = 0; i < -this.parts[part]; ++i) {
          negative.push(part);
        }
      }
    }

    const positiveString = positive.length === 0 ? "1" : positive.join(" ");
    const negativeString = negative.length === 0 ? "" : " / " + negative.join(" ");

    return positiveString + negativeString;
  }

  sameDimension(other) {
    for (const key of Object.keys(this.parts)) {
      if (this.parts[key] !== other.parts[key]) return false;
    }
    return Object.keys(this.parts).length === Object.keys(other.parts).length;
  }

  isEqual(other) {
    return this.sameDimension(other) && Math.abs(this.quantity - other.quantity) < 0.00001;
  }

  multiply(other) {
    for (const key of Object.keys(other.parts)) {
      if (!(key in this.parts)) {
        this.parts[key] = other.parts[key];
      } else {
        this.parts[key] += other.parts[key];
      }
    }

    this.quantity *= other.quantity;
  }

  divide(other) {
    for (const key of Object.keys(other.parts)) {
      if (!(key in this.parts)) {
        this.parts[key] = -other.parts[key];
      } else {
        this.parts[key] -= other.parts[key];
      }
    }

    this.quantity /= other.quantity;
  }
}

export class Basis {
  // const imperial = new Basis([{metric: "meter", unit: "feet", factor: 0.3048}])
  constructor(units) {
    this.fromMetricBase = Object.fromEntries(
      units.map(({metric, unit, factor}) => [
        metric, 
        new Unit(Object.fromEntries([[unit, 1]]), factor)
      ])
    );
    this.toMetricBase = Object.fromEntries(
      units.map(({metric, unit, factor}) => [
        unit, 
        new Unit(Object.fromEntries([[metric, 1]]), 1/factor)
      ])
    );
    this.units = units;
  }

  hasBaseUnit(baseUnit) {
    return baseUnit in this.toMetricBase;
  }

  fromMetric(unit) {
    const result = new Unit({}, 1);

    for (const base of Object.keys(unit.parts)) {
      const power = unit.parts[base];
      if (power > 0) {
        for (let i = 0; i < power; ++i) {
          result.multiply(this.fromMetricBase[base]);
        }
      } else {
        for (let i = 0; i < power; ++i) {
          result.divide(this.fromMetricBase[base]);
        }
      }
    }

    return result;
  }

  toMetric(unit) {
    const result = new Unit({}, 1);

    for (const base of Object.keys(unit.parts)) {
      const power = unit.parts[base];
      if (power > 0) {
        for (let i = 0; i < power; ++i) {
          result.multiply(this.toMetricBase[base]);
        }
      } else {
        for (let i = 0; i < power; ++i) {
          result.divide(this.toMetricBase[base]);
        }
      }
    }

    return result;
  }
}

export const metric = new Basis([
  {unit: "meter", metric: "meter", factor: 1},
  {unit: "gram", metric: "gram", factor: 1},
  {unit: "second", metric: "second", factor: 1},
]);

export const imperial = new Basis([
  {unit: "feet", metric: "meter", factor: 0.3048},
  {unit: "pound", metric: "gram", factor: 453.59237},
  {unit: "second", metric: "second", factor: 1},
]);

export class UnknownUnitError extends Error {
  constructor(unit) {
    super("Unknown unit " + unit);
    this.name = "UnknownUnitError"
  }
}
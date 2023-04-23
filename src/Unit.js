const known = new Set([
  "meter",
  "second",
  "gram"
]);

export class Unit {
  constructor(parts, quantity) {
    console.log("constructing unit with parts " + typeof parts);
    this.parts = parts;
    this.quantity = quantity;
  }

  static parse(input) {
    let parts = {};
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
        if (!known.has(word)) {
          throw new UnknownUnitError(word); 
        }
        if (!(word in parts)) {
          parts[word] = 0;
        }
        parts[word] += afterSlash ? -1 : 1;
      }
    }

    return new Unit(parts, 1);
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

    return positiveString + negativeString
  }

  isEqual(other) {
    for (const key of Object.keys(this.parts)) {
      if (this.parts[key] !== other.parts[key]) return false;
    }
    if (Object.keys(this.parts).length !== Object.keys(other.parts).length) return false;
    return this.quantity === other.quantity;
  }
}

export class UnknownUnitError extends Error {
  constructor(unit) {
    super("Unknown unit " + unit);
    this.name = "UnknownUnitError"
  }
}
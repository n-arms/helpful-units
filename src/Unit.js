const known = new Set([
  "meter",
  "second",
  "gram"
]);

export class Unit {
  constructor(parts) {
    this.parts = parts;
  }

  static parse(input) {
    let parts = {};
    let afterSlash = false;
    
    for (let word of input.split(" ")) {
      word = word.trim().toLowerCase();
      if (word === "/" || word === "per") {
        afterSlash = true;
      } else if (word !== "") {
        if (word[-1] === "s" && word.length > 1) {
          word = word.slice(0, -1);
        }
        if (!known.has(word)) {
          throw "Unknown Unit " + word; 
        }
        if (!(word in parts)) {
          parts[word] = 0;
        }
        parts[word] += afterSlash ? -1 : 1;
      }
    }

    return new Unit(parts);
  }

  toString() {
    return JSON.stringify(this.parts);
  }
}
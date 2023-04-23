/* eslint-disable no-restricted-globals */

import { Unit, imperial } from "./Unit.js";

function randomBaseUnit() {
  const index = Math.floor(Math.random() * imperial.units.length);
  return imperial.units[index].unit;
}

function randomCompositeUnit() {
  const unitOldBasis = new Unit({}, 1);
  const unitNewBasis = new Unit({}, 1);

  for (let i = 0; i < Math.floor(1 + Math.random() * 10); i++) {
    const unit = Unit.parse(randomBaseUnit(), imperial);
    const unitPositive = Math.random() > 0.5;
    if (unitPositive) {
      unitOldBasis.multiply(imperial.toMetric(unit));
      unitNewBasis.multiply(unit);
    } else {
      unitOldBasis.divide(imperial.toMetric(unit));
      unitNewBasis.divide(unit);
    }
  }

  return {unitOldBasis, unitNewBasis};
}

function generateEquivUnit(targetUnit) {
  for (let i = 0; i < 1000; ++i) {
    const {unitOldBasis, unitNewBasis} = randomCompositeUnit();
    console.log("generated unit " + unitOldBasis.toString());

    if (targetUnit.sameDimension(unitOldBasis)) return unitNewBasis;
  }
  return new Unit({}, 1);
}

self.onmessage = (event) => {
  const given = new Unit(event.data.parts, event.data.quantity);
  const generated = generateEquivUnit(given);
  console.log("worker received: " + JSON.stringify(given));
  console.log("and generated: " + JSON.stringify(generated));

  self.postMessage({
    basedOn: given,
    generated
  });
}
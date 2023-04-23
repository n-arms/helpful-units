/* eslint-disable no-restricted-globals */

import { Unit, UnknownUnitError } from "./Unit.js";

self.onmessage = (event) => {
  console.log("worker received: " + JSON.stringify(event.data));

  self.postMessage({
    basedOn: event.data,
    generated: event.data
  });
}
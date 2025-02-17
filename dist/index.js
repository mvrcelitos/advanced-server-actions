"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  createServerAction: () => createServerAction,
  createServerProcedure: () => createServerProcedure
});
module.exports = __toCommonJS(index_exports);

// src/main.ts
var ServerProcedure = class {
  constructor(internals) {
    this.$internals = internals;
  }
  handler(fn) {
    this.$internals.procedures?.push(fn);
    return this;
  }
  createServerAction() {
    return new ServerAction({
      input: void 0,
      output: void 0,
      context: this.$internals.context,
      procedures: this.$internals.procedures
    });
  }
};
var ServerAction = class {
  constructor(internals) {
    this.$internals = internals;
  }
  input(fn) {
    this.$internals.input = fn;
    return this;
  }
  handler(fn) {
    const internals = this.$internals;
    return async function(input) {
      let ctx = void 0;
      try {
        for (const procedure of internals.procedures) {
          ctx = await procedure({ ctx });
        }
        await internals.onStart?.({ ctx });
        const data = internals?.input instanceof Function ? await internals.input?.(input, { ctx }) : void 0;
        const response = await fn({ ctx, input: data });
        await internals.onSuccess?.({ ctx });
        return [response, null];
      } catch (error) {
        await internals.onError?.({ ctx, error });
        return [null, error instanceof Error ? error : new Error("Internal error", { cause: error })];
      } finally {
        await internals.onComplete?.({ ctx });
      }
    };
  }
  // Event handlers
  onStart(fn) {
    this.$internals.onStart = fn;
    return this;
  }
  onSuccess(fn) {
    this.$internals.onSuccess = fn;
    return this;
  }
  onComplete(fn) {
    this.$internals.onComplete = fn;
    return this;
  }
  onError(fn) {
    this.$internals.onError = fn;
    return this;
  }
  onInputParseError(fn) {
    this.$internals.onInputParseError = fn;
    return this;
  }
};
function createServerProcedure() {
  return new ServerProcedure({ procedures: [], context: void 0 });
}
function createServerAction() {
  return new ServerAction({
    input: void 0,
    output: void 0,
    context: void 0,
    procedures: []
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createServerAction,
  createServerProcedure
});
//# sourceMappingURL=index.js.map
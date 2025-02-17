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
export {
  createServerAction,
  createServerProcedure
};
//# sourceMappingURL=index.mjs.map
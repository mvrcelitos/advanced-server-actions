import { ActionInternals, IServerAction, ProcedureInternals } from "./types";

class ServerProcedure<TInternals extends ProcedureInternals> {
  private declare $internals: TInternals;

  constructor(internals: TInternals) {
    this.$internals = internals;
  }

  public handler<TOutput>(
    fn: ({ ctx }: { ctx: TInternals["context"] }) => Promise<TOutput> | TOutput,
  ) {
    this.$internals.procedures?.push(fn);
    return this as ServerProcedure<{
      context: TOutput;
      procedures: TInternals["procedures"];
    }>;
    // return new ServerProcedure<{ context: TOutput; procedures: TInternals["procedures"] }>({
    //   ...this.$internals,
    //   context: this.$internals.context as TOutput,
    // });
  }

  public createServerAction() {
    return new ServerAction({
      input: undefined,
      output: undefined,
      context: this.$internals.context as TInternals["context"],
      procedures: this.$internals.procedures,
    });
  }
}

class ServerAction<TInternals extends ActionInternals>
  implements IServerAction<TInternals>
{
  private declare $internals: TInternals;

  constructor(internals: TInternals) {
    this.$internals = internals;
  }

  public input<TInput = any, TOutput = unknown>(
    fn: (
      input: TInput,
      args: { ctx: TInternals["context"] },
    ) => Promise<TOutput> | TOutput,
  ) {
    this.$internals.input = fn;
    return this as ServerAction<
      Omit<TInternals, "input"> & {
        input: (
          input: TInput,
          args: { ctx: TInternals["context"] },
        ) => Promise<TOutput> | TOutput;
      }
    >;
  }

  public handler<TOutput = unknown>(
    fn: ({
      ctx,
      input,
    }: {
      ctx: TInternals["context"];
      input: TInternals["input"] extends Function
        ? Awaited<ReturnType<TInternals["input"]>>
        : undefined;
    }) => Promise<TOutput> | TOutput,
  ) {
    const internals = this.$internals;

    type Input = TInternals["input"] extends Function
      ? Parameters<TInternals["input"]>[0] extends undefined
        ? void
        : Parameters<TInternals["input"]>[0]
      : void;
    type Output = TInternals["input"] extends Function
      ? Awaited<ReturnType<TInternals["input"]>>
      : undefined;

    return async function (
      input: Input,
    ): Promise<[TOutput, null] | [null, Error]> {
      let ctx: unknown = undefined;

      try {
        // Run all the procedures
        for (const procedure of internals.procedures) {
          ctx = await procedure({ ctx });
        }

        await internals.onStart?.({ ctx });

        // Parse the data
        const data = (
          internals?.input instanceof Function
            ? await internals.input?.(input, { ctx })
            : undefined
        ) as Output;

        // The function passed by the user to be the handled
        const response = await fn({ ctx, input: data });

        await internals.onSuccess?.({ ctx });
        return [response, null];
      } catch (error) {
        await internals.onError?.({ ctx, error });
        return [
          null,
          error instanceof Error
            ? error
            : new Error("Internal error", { cause: error }),
        ];
      } finally {
        await internals.onComplete?.({ ctx });
      }
    };
  }

  // Event handlers
  public onStart(fn: ActionInternals["onStart"]) {
    this.$internals.onStart = fn;
    return this as ServerAction<
      Omit<TInternals, "onStart"> & { onStart: typeof fn }
    >;
  }

  public onSuccess(fn: ActionInternals["onSuccess"]) {
    this.$internals.onSuccess = fn;
    return this as ServerAction<
      Omit<TInternals, "onSuccess"> & { onSuccess: typeof fn }
    >;
  }

  public onComplete(fn: ActionInternals["onComplete"]) {
    this.$internals.onComplete = fn;
    return this as ServerAction<
      Omit<TInternals, "onComplete"> & { onComplete: typeof fn }
    >;
  }

  public onError(fn: ActionInternals["onError"]) {
    this.$internals.onError = fn;
    return this as ServerAction<
      Omit<TInternals, "onError"> & { onError: typeof fn }
    >;
  }

  public onInputParseError(fn: ActionInternals["onInputParseError"]) {
    this.$internals.onInputParseError = fn;
    return this as ServerAction<
      Omit<TInternals, "onInputParseError"> & { onInputParseError: typeof fn }
    >;
  }
}

export function createServerProcedure() {
  return new ServerProcedure({ procedures: [], context: undefined });
}

export function createServerAction() {
  return new ServerAction({
    input: undefined,
    output: undefined,
    context: undefined,
    procedures: [],
  });
}

const createServerFunctions = {
  createServerAction,
  createServerProcedure,
};

export default createServerFunctions;

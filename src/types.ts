type Procedure<TContext> = ({ ctx }: { ctx: TContext }) => Promise<unknown> | unknown;

export interface ProcedureInternals<TContext = unknown> {
  context: TContext;
  procedures: Procedure<TContext>[];
}

export interface ActionInternals<TContext = unknown> {
  context: TContext;
  procedures: Procedure<TContext>[];
  input?: (input: any, args: { ctx: TContext }) => Promise<unknown> | unknown;
  output?: unknown;
  onInputParseError?: ({ ctx, error }: { ctx: TContext; error: Error | unknown }) => Promise<unknown> | unknown;
  onOutputParseError?: ({ ctx, error }: { ctx: TContext; error: Error | unknown }) => Promise<unknown> | unknown;
  onError?: ({ ctx, error }: { ctx: TContext; error: Error | unknown }) => Promise<unknown> | unknown;
  onStart?: ({ ctx }: { ctx: TContext }) => Promise<unknown> | unknown;
  onComplete?: ({ ctx }: { ctx: TContext }) => Promise<unknown> | unknown;
  onSuccess?: ({ ctx }: { ctx: TContext }) => Promise<unknown> | unknown;
}

export interface IServerAction<TInternals extends ActionInternals> {
  input: <TInput = undefined, TOutput = unknown>(
    fn: (input: TInput, args: { ctx: TInternals["context"] }) => Promise<TOutput> | TOutput,
  ) => unknown;

  handler: <TOutput = unknown>(
    fn: ({
      ctx,
      input,
    }: {
      ctx: TInternals["context"];
      input: TInternals["input"] extends Function ? Awaited<ReturnType<TInternals["input"]>> : undefined;
    }) => Promise<TOutput> | TOutput,
  ) => (
    input: TInternals["input"] extends Function
      ? Parameters<TInternals["input"]>[0] extends undefined
        ? void
        : Parameters<TInternals["input"]>[0]
      : void,
  ) => Promise<[TOutput, null] | [null, Error]>;

  onError?: (fn: TInternals["onError"]) => unknown;
  onInputParseError?: (fn: TInternals["onInputParseError"]) => unknown;
  onOutputParseError?: (fn: TInternals["onOutputParseError"]) => unknown;

  onStart: (fn: TInternals["onStart"]) => unknown;
  onSuccess: (fn: TInternals["onSuccess"]) => unknown;
  onComplete: (fn: TInternals["onComplete"]) => unknown;
}

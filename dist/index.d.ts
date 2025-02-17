type Procedure<TContext> = ({ ctx }: {
    ctx: TContext;
}) => Promise<unknown> | unknown;
interface ProcedureInternals<TContext = unknown> {
    context: TContext;
    procedures: Procedure<TContext>[];
}
interface ActionInternals<TContext = unknown> {
    context: TContext;
    procedures: Procedure<TContext>[];
    input?: (input: any, args: {
        ctx: TContext;
    }) => Promise<unknown> | unknown;
    output?: unknown;
    onInputParseError?: ({ ctx, error }: {
        ctx: TContext;
        error: Error | unknown;
    }) => Promise<unknown> | unknown;
    onOutputParseError?: ({ ctx, error }: {
        ctx: TContext;
        error: Error | unknown;
    }) => Promise<unknown> | unknown;
    onError?: ({ ctx, error }: {
        ctx: TContext;
        error: Error | unknown;
    }) => Promise<unknown> | unknown;
    onStart?: ({ ctx }: {
        ctx: TContext;
    }) => Promise<unknown> | unknown;
    onComplete?: ({ ctx }: {
        ctx: TContext;
    }) => Promise<unknown> | unknown;
    onSuccess?: ({ ctx }: {
        ctx: TContext;
    }) => Promise<unknown> | unknown;
}
interface IServerAction<TInternals extends ActionInternals> {
    input: <TInput = undefined, TOutput = unknown>(fn: (input: TInput, args: {
        ctx: TInternals["context"];
    }) => Promise<TOutput> | TOutput) => unknown;
    handler: <TOutput = unknown>(fn: ({ ctx, input, }: {
        ctx: TInternals["context"];
        input: TInternals["input"] extends Function ? Awaited<ReturnType<TInternals["input"]>> : undefined;
    }) => Promise<TOutput> | TOutput) => (input: TInternals["input"] extends Function ? Parameters<TInternals["input"]>[0] extends undefined ? void : Parameters<TInternals["input"]>[0] : void) => Promise<[TOutput, null] | [null, Error]>;
    onError?: (fn: TInternals["onError"]) => unknown;
    onInputParseError?: (fn: TInternals["onInputParseError"]) => unknown;
    onOutputParseError?: (fn: TInternals["onOutputParseError"]) => unknown;
    onStart: (fn: TInternals["onStart"]) => unknown;
    onSuccess: (fn: TInternals["onSuccess"]) => unknown;
    onComplete: (fn: TInternals["onComplete"]) => unknown;
}

declare class ServerProcedure<TInternals extends ProcedureInternals> {
    private $internals;
    constructor(internals: TInternals);
    handler<TOutput>(fn: ({ ctx }: {
        ctx: TInternals["context"];
    }) => Promise<TOutput> | TOutput): ServerProcedure<{
        context: TOutput;
        procedures: TInternals["procedures"];
    }>;
    createServerAction(): ServerAction<{
        input: undefined;
        output: undefined;
        context: TInternals["context"];
        procedures: (({ ctx }: {
            ctx: unknown;
        }) => Promise<unknown> | unknown)[];
    }>;
}
declare class ServerAction<TInternals extends ActionInternals> implements IServerAction<TInternals> {
    private $internals;
    constructor(internals: TInternals);
    input<TInput = any, TOutput = unknown>(fn: (input: TInput, args: {
        ctx: TInternals["context"];
    }) => Promise<TOutput> | TOutput): ServerAction<Omit<TInternals, "input"> & {
        input: (input: TInput, args: {
            ctx: TInternals["context"];
        }) => Promise<TOutput> | TOutput;
    }>;
    handler<TOutput = unknown>(fn: ({ ctx, input, }: {
        ctx: TInternals["context"];
        input: TInternals["input"] extends Function ? Awaited<ReturnType<TInternals["input"]>> : undefined;
    }) => Promise<TOutput> | TOutput): (input: TInternals["input"] extends Function ? Parameters<TInternals["input"]>[0] extends undefined ? void : Parameters<TInternals["input"]>[0] : void) => Promise<[TOutput, null] | [null, Error]>;
    onStart(fn: ActionInternals["onStart"]): ServerAction<Omit<TInternals, "onStart"> & {
        onStart: typeof fn;
    }>;
    onSuccess(fn: ActionInternals["onSuccess"]): ServerAction<Omit<TInternals, "onSuccess"> & {
        onSuccess: typeof fn;
    }>;
    onComplete(fn: ActionInternals["onComplete"]): ServerAction<Omit<TInternals, "onComplete"> & {
        onComplete: typeof fn;
    }>;
    onError(fn: ActionInternals["onError"]): ServerAction<Omit<TInternals, "onError"> & {
        onError: typeof fn;
    }>;
    onInputParseError(fn: ActionInternals["onInputParseError"]): ServerAction<Omit<TInternals, "onInputParseError"> & {
        onInputParseError: typeof fn;
    }>;
}
declare function createServerProcedure(): ServerProcedure<{
    procedures: never[];
    context: undefined;
}>;
declare function createServerAction(): ServerAction<{
    input: undefined;
    output: undefined;
    context: undefined;
    procedures: never[];
}>;

export { type ActionInternals, type IServerAction, type ProcedureInternals, createServerAction, createServerProcedure };

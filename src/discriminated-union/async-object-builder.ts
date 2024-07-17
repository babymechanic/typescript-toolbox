import { AddProp } from '../type-manipulation';
import { InvalidConfigurationError } from '../errors/invalid-configuration-error';

type Failure = {
    type: 'failure';
    details: unknown;
}

type Success<T> = {
    type: 'success';
    value: T;
};

export type CreateResult<TOutPut> = Success<TOutPut> | Failure;
export type BuilderFunc<TInput, TOutPut> = (buildDeps: TInput) => Promise<CreateResult<TOutPut>>;
type BuilderConfig<TInput, TOutput> = {
    builder: BuilderFunc<TInput, TOutput>;
    dispose?: (output: TOutput) => void;
};

type ExtractObject<T> = {
    [K in keyof T]:
    T[K] extends BuilderConfig<unknown, infer TOutput> ? TOutput : never;
}

type AggregateFailure<TKey extends PropertyKey> = Failure & {
    prop: TKey
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BuildConfig = { [K in PropertyKey]: BuilderConfig<any, any> }

const safeDispose = (disposers: (() => void)[]): unknown[] => {
    return disposers.reverse().reduce<unknown[]>((acc, disposer) => {
        try {
            disposer()
        } catch (e) {
            console.error(e);
            acc.push(e);
        }
        return acc;
    }, []);
};

export type ObjectBuilderOptions = {
    dispose: (disposers: (() => void)[]) => unknown[];
}

const _asyncObjectBuilder = <
    TBuildConfiguration extends BuildConfig = Record<string, never>
>(
    buildConfig: TBuildConfiguration,
    propBuildOrder: (keyof TBuildConfiguration)[],
    options: ObjectBuilderOptions
) => {
    type SuccessfullyBuiltObject = ExtractObject<TBuildConfiguration>;
    type AggregateResult =
        AggregateFailure<keyof TBuildConfiguration>
        | (Success<SuccessfullyBuiltObject> & { dispose: () => unknown[]; });

    return {
        with: <
            TProp extends PropertyKey,
            TBuilderConfig extends BuilderConfig<Omit<SuccessfullyBuiltObject, TProp>, unknown>
        >(prop: TProp, config: TBuilderConfig) => {
            if (propBuildOrder.includes(prop)) {
                throw new InvalidConfigurationError(`'${ prop.toString() }' prop was defined twice`)
            }
            type UpdatedConfig = AddProp<TBuildConfiguration, TProp, TBuilderConfig>
            const updatedConfig = {
                ...buildConfig,
                [prop]: config
            } as UpdatedConfig;
            return _asyncObjectBuilder(updatedConfig, [...propBuildOrder, prop] as (keyof UpdatedConfig)[], options)
        },

        build: async (): Promise<AggregateResult> => {
            const acc: Partial<SuccessfullyBuiltObject> = {};
            const disposers: (() => void)[] = [];
            for (const prop of propBuildOrder) {
                const { builder, dispose } = buildConfig[prop];
                try {
                    const result = await builder(acc);
                    if (result.type === 'success') {
                        acc[prop] = result.value as SuccessfullyBuiltObject[typeof prop];
                        if (dispose != null) {
                            disposers.push(() => dispose(result.value));
                        }
                    } else {
                        options.dispose(disposers);
                        return { ...result, prop };
                    }
                } catch (e) {
                    options.dispose(disposers);
                    return {
                        type: 'failure',
                        prop,
                        details: e
                    }
                }
            }
            return {
                type: 'success',
                value: acc as SuccessfullyBuiltObject,
                dispose: () => options.dispose(disposers)
            }
        }
    }
};

export const asyncObjectBuilder = (options: ObjectBuilderOptions = { dispose: safeDispose }) =>
    _asyncObjectBuilder({}, [], options);

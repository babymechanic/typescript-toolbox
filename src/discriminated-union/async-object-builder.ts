import { AddProp } from '../type-manipulation';
import { InvalidConfigurationError } from '../errors/invalid-configuration-error';

type Failure = {
    type: 'failure';
    error: unknown;
}

type Success<T> = {
    type: 'success';
    value: T
};

export type CreateResult<TOutPut> = Success<TOutPut> | Failure;
export type BuilderFunc<TInput, TOutPut> = (buildDeps: TInput) => Promise<CreateResult<TOutPut>>;

type ExtractObject<T> = {
    [K in keyof T]:
    T[K] extends BuilderFunc<unknown, infer TOutput> ? TOutput : never;
}

type AggregateFailure<TKey extends PropertyKey> = Failure & {
    prop: TKey
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BuildConfig = { [K in PropertyKey]: BuilderFunc<any, any> }


const asyncObjectBuilder = <TBuildConfiguration extends BuildConfig = Record<string, never>>(buildConfig: TBuildConfiguration, propBuildOrder: (keyof TBuildConfiguration)[]) => {
    type SuccessfullyBuiltObject = ExtractObject<TBuildConfiguration>;
    type AggregateResult =
        AggregateFailure<keyof TBuildConfiguration>
        | Success<SuccessfullyBuiltObject>;

    return {
        with: <TProp extends PropertyKey, TFunc extends BuilderFunc<Omit<SuccessfullyBuiltObject, TProp>, unknown>>(prop: TProp, func: TFunc) => {
            if (propBuildOrder.includes(prop)) {
                throw new InvalidConfigurationError(`'${ prop.toString() }' prop was defined twice`)
            }
            type UpdateConfig = AddProp<TBuildConfiguration, TProp, TFunc>
            const updatedConfig = {
                ...buildConfig,
                [prop]: func
            } as UpdateConfig;
            return asyncObjectBuilder(updatedConfig, [...propBuildOrder, prop] as (keyof UpdateConfig)[])
        },

        build: async (): Promise<AggregateResult> => {
            const acc: Partial<SuccessfullyBuiltObject> = {};
            for (const prop of propBuildOrder) {
                const builder = buildConfig[prop];
                const result = await builder(acc);
                if (result.type === 'success') {
                    acc[prop] = result.value as SuccessfullyBuiltObject[typeof prop];
                } else {
                    return { ...result, prop };
                }
            }
            return {
                type: 'success',
                value: acc as SuccessfullyBuiltObject
            }
        }
    }
};

export const createAsyncObjectBuilder = () => asyncObjectBuilder({}, []);

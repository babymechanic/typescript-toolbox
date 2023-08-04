type Callable<TInput, TOutput> = (input: TInput) => Promise<TOutput>;
type DUnion<TDiscriminator extends string> = {[K: string]: unknown} & {[K in TDiscriminator]: unknown;};

export const createChainRunner = <
    TDiscriminator extends string,
    TEscapeType extends DUnion<TDiscriminator>,
    TOutputAcc = undefined
>(
    discriminatorProp: string,
    isEscape: (val: DUnion<TDiscriminator>) => val is TEscapeType,
    callChain: ReadonlyArray<Callable<any, any>> = [() => Promise.resolve(undefined)]) => {
    return {
        next<T extends Callable<TOutputAcc, DUnion<TDiscriminator>>>(callable: T) {
            return createChainRunner<
                TDiscriminator,
                TEscapeType,
                Exclude<Awaited<ReturnType<T>>, TEscapeType>
            >(discriminatorProp, isEscape, [...callChain, callable])
        },
        async run(): Promise<TEscapeType | TOutputAcc> {
            let acc: any = undefined;
            for(let index=0; index< callChain.length; index++) {
                acc = await callChain[index](acc);
                if(isEscape(acc)) {
                    return acc;
                }
            }
            return acc;
        }
    }
}

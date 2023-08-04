export const propsAreNotNull = <
    TObj extends object,
    TKeys extends ReadonlyArray<keyof TObj>
>(value: TObj, keys: TKeys): value is (TObj & {[K in TKeys[number]]-?: NonNullable<TObj[K]>})=> {
    if (value == null) {
        return false;
    }
    return keys.every((key) => value[key] != null);
};

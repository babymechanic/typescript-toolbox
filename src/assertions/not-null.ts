const notNull = <T>(value?: T, message?: string) => {
    if (value == null) {
        throw new Error(message || 'Should not be null');
    }
    return value as Exclude<T, undefined>;
};

export { propsAreNotNull } from './props-not-null';

export type IsAny<T> = 0 extends (1 & T) ? true : false;

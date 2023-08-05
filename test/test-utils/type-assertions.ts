export type Expect<T extends true> = T;
export type Equal<T, U> = (<X>() => X extends T ? 1 : 2) extends (<Y>() => Y extends U ? 1 : 2) ? true : false;


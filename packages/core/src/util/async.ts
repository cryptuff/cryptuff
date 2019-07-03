export function sleep(ms: number) {
  return new Promise((res, rej) => setTimeout(res, ms));
}

export function getDeferredPromise<TResolve, TReject = any>(): {
  promise: Promise<TResolve>;
  resolve: (value?: TResolve) => void;
  reject: (payload?: TReject) => void;
} {
  let resolve!: (value?: TResolve) => void;
  let reject!: (payload?: TReject) => void;
  const promise = new Promise<TResolve>((r, rj) => {
    resolve = r;
    reject = rj;
  });
  return { promise, resolve, reject };
}

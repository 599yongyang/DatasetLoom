export function compose(...middlewares: Function[]) {
    return (handler: any) => {
        return middlewares.reduceRight((acc, middleware) => {
            return middleware(acc);
        }, handler);
    };
}

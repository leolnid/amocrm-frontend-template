//@ts-ignore
class BaseSingleton<T> {
    //@ts-ignore
    protected static _instance: T | undefined;

    protected constructor() {}

    //@ts-ignore
    public static instance<T extends new (...args: any[]) => InstanceType<T>>(...args: ConstructorParameters<T>): InstanceType<T> {
        if (!this._instance) {
            //@ts-ignore
            this._instance = new this(...args) as InstanceType<T>;
        }
        return this._instance as InstanceType<T>;
    }

    //@ts-ignore
    public static get I(): T {
        return this.instance();
    }
}

export {
    BaseSingleton
}
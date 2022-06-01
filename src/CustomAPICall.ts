export const CUSTOM_API_METHODS = {
    post: 1,
    get: 2
};

export class CustomAPICall {
    private method: Number;
    private name: String;
    private callback: Function;

    constructor(method: Number, name: String, callback: Function) {
        if (method > 0 && method < 3) {
            this.method = method;
        } else {
            throw "Method must be between 1 and 2.";
        }

        this.name = name;
        this.callback = callback;
    }

    get_method():Number {
        return this.method;
    }

    get_name():String {
        return this.name;
    }

    get_callback():Function {
        return this.callback;
    }


}
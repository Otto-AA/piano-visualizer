export interface AsyncFormat {
    func: (cb?) => any;
    returnValue?: any;
}

export class JsfAsyncFormats {
    private asyncFormats: AsyncFormat[] = [];

    public registerAsSync(func: () => any): () => any {
        this.asyncFormats.push({ func });
        const index = this.asyncFormats.length - 1;

        return () => this.getReturnValue(index);
    }

    public resolveAll(): Promise<any[]> {
        return Promise.all(this.asyncFormats.map(this.saveValueFromAsyncFormat));
    }

    private async saveValueFromAsyncFormat(asyncFormat: AsyncFormat) {
        asyncFormat.returnValue = await promisify(asyncFormat.func);
    }

    private getReturnValue(index) {
        return this.asyncFormats[index].returnValue;
    }
}


function promisify<T>(func: (cb?) => T): Promise<T> {
    if (func.length === 0) {
        return Promise.resolve(func());
    }
    else if (func.length === 1) {
        return new Promise((resolve, reject) => {
            const callback = (err, val) => err ? reject(err) : resolve(val);
            func(callback);
        });
    }
    else {
        throw new Error('Error while promisifying a function. It had more than one parameter');
    }
}

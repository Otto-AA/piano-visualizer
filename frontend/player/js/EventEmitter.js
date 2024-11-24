export class EventEmitter {
    /**
     * Create event emitter for specific event types
     * 
     * @param {string[]} eventTypes names of the events that can be emitted
     */
    constructor(eventTypes) {
        this._events = {}
        eventTypes.forEach(type => this._events[type] = [])
    }

    on(type, listener) {
        if (!(type in this._events))
            throw new Error(`Tried to add listener to event type ${type} but this is not supported`)
        this._events[type].push(listener)
    }

    onNext(type, listener) {
        const listenerWithRemove = (...args) => {
            listener(...args)
            this.removeListener(type, listener)
        }
        this.on(type, listenerWithRemove)
    }

    removeListener(type, listener) {
        if (!(type in this._events))
            throw new Error(`Tried to remove listener but event type ${type} does not exist`)
        this._events[type] = this._events[type].filter(c => c !== listener)
    }

    emit(type, ...args) {
        if (!(type in this._events))
            throw new Error(`Tried to emit event ${type} but this type does not exist`)
        this._events[type].forEach(callback => callback(...args))
    }
}
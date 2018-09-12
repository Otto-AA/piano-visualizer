class EventHandler {
    constructor(eventTypes) {
        this.eventTypes = eventTypes;

        this.listenerGroups = {};
        this.eventTypes.forEach(type => this.listenerGroups[type] = {});

        this.listenerIdCounter = 0;
    }

    addListener(type, listener) {
        if (this.eventTypes.indexOf(type) === -1)
            throw new Error(`Invalid listener type: ${type}`);

        const id = this._getNewListenerId();
        this.listenerGroups[type][id] = listener;
    }

    removeListener(id) {
        Object.entries(this.listenerGroups)
            .forEach(([type, listenerGroup]) => {
                if (id in listenerGroup)
                    delete listenerGroup[id];
            });
    }

    _triggerEvent(type, data) {
        Object.keys(this.listenerGroups[type])
            .forEach(id => this.listenerGroups[type][id](data));
    }

    _getNewListenerId() {
        this.listenerIdCounter += 1;
        return this.listenerIdCounter;
    }
}

export default EventHandler;
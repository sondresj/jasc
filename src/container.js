const { Tree } = require('./tree')

module.exports = class Container {
    constructor(){
        this._tree = new Tree()
        this._current = null
    }

    /**
     * Tell the container to serve a service with the given name
     * @param {string} name Name of the service the container should serve
     * @param {function} cb A function that receives the container as it's only argument. 
     * @returns {Container} the container itself, so that you may chain multiple servings
     */
    serve(name, cb){
        if(!name || typeof name !== 'string')
            throw new Error(`Argument: 'name' must be a defined string`)
        if(!cb || typeof cb !== 'function')
            throw new Error(`Argument: 'cb' must be a defined function`)

        Object.defineProperty(this, name, {
            get: () => {
                const tree = this._tree

                if(tree.has(name)){
                    const node = tree.get(name)
                    if(node.value === undefined){
                        tree.dump()
                        throw new Error(`Circular dependency detected while resolving ${name}`)
                    }

                    if(this._current && !node.parents.has(this._current))
                        node.parents.add(this._current)

                    return node.value
                }

                const parent = this._current
                const node = this._current = tree.add(name, undefined, parent)
                const instance = cb(this)
                this._current = parent

                return node.value = instance === undefined ? null : instance // No undefined please.. 
            },
            configurable: true,
            enumerable: true
        })

        return this
    }

    /**
     * Dumps the loaded services to the console.
     */
    dump(){
        this._tree.dump()
    }
}

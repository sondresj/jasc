const Tree = require('./tree')

module.exports = class Container {
    constructor(){
        this._tree = new Tree()
    }

    /**
     * Tell the container to serve a service with the given name
     * @param {string} name Name of the service the container should serve
     * @param {function} cb A function that receives the container as it's only argument. 
     * @returns {Container} the container itself, so that you may chain multiple servings
     */
    serve(name, cb){
        if(!name || typeof name !== 'string')
            throw new Error(`Argument: 'name' must be a string`)
        if(!cb || typeof cb !== 'function')
            throw new Error(`Argument: 'cb' must be a function`)

        Object.defineProperty(this, name, {
            get: () => {
                const tree = this._tree

                if(tree.hasOwnProperty(name)){
                    const node = tree[name]
                    if(node.value === undefined){
                        tree.dump()
                        throw new Error(`Circular dependency detected while resolving ${name}`)
                    }
                    else 
                        return node.value
                }
                
                const node = tree.push(name)
                const instance = node.value = cb(this)
                tree.pop()
                
                if(instance === undefined)
                    throw new Error(`The return value from the factory function for ${name} cannot be undefined`)

                return instance
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

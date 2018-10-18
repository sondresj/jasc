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
        Object.defineProperty(this, name, {
            get: () => {
                const tree = this._tree

                if(tree.current && tree.current.traverseParents(node => node.key === name)){
                    tree.dump()
                    throw new Error(`Circular dependency detected while resolving ${name}`)
                }                

                if(tree.hasOwnProperty(name))
                    return tree[name].value
                
                const node = tree.push(name)
                const instance = node.value = cb(this)
                tree.pop()
                
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

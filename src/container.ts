import { Tree, Node } from './tree'

export default class Container {
    _tree: Tree
    _current: Node | null
    
    [name: string]: any

    constructor() {
        this._tree = new Tree()
        this._current = null
    }

    /**
     * Define a service for the container to serve.
     * The service will be defined as a property on the service, and will be lazily constructed. 
     * The construction of the service takes place the first time it is resolved (accessed).
     * If a circular dependency is detected, an Error is thrown. 
     * @param {string} name Name of the service the container should serve
     * @param {(ioc: Container)} cb Factory function for your service
     * @returns {Container} The container
     * @throws {TypeError} if name is null, undefined or not a string, or if cb is null, undefined or not a function
     */
    serve<T>(name: string, cb: (container: Container) => T): Container {
        if (!name || typeof name !== 'string')
            throw new TypeError(`Argument: 'name' must be a defined string`)
        if (!cb || typeof cb !== 'function')
            throw new TypeError(`Argument: 'cb' must be a defined function`)

        Object.defineProperty(this, name, {
            get: (): T | null => {
                const tree = this._tree

                if (tree.has(name)) {
                    const node = tree.get(name)

                    // the _current property is the parent to the service currently being resolved
                    // if _current is not null then we're loading a dependency that has not yet been loaded
                    if (this._current) {
                        node.parents.add(this._current)
                        this._current.children.add(node)
                    }

                    // cb has not yet returned, so we're in a resolve stack where we have looped back on ourselves (since tree.has(name) is true)
                    if (node.value === undefined) {
                        const parents = [name]
                        node.traverseParents(p => { 
                            if(p.key === node.key)
                                return true
                            parents.push(p.key)
                        })
                        console.warn(`Detected circular dependency: ${name} -> ${parents.reverse().join(' -> ')}`)
                        throw new Error(`Circular dependency detected while resolving ${name}`)
                    }

                    // the service we're resolving has been initialized previously. 
                    return node.value as T
                }

                const parent = this._current
                const node = this._current = tree.add(name, undefined, parent)
                const instance = cb(this)
                if(instance === undefined)
                    throw new Error('cb returned undefined')
                this._current = parent

                return node.value = instance
            },
            configurable: false,
            enumerable: true
        })

        return this
    }

    /**
     * Define a service for the container to serve.
     * The service will be defined as a property on the service, and will be lazily constructed. 
     * The construction of the service takes place the first time it is resolved (accessed).
     * If a circular dependency is detected, an Error is thrown. 
     * @param {string} name Name of the service the container should serve
     * @param {(ioc: Container)} cb Factory function for your service
     * @returns {Container} The container
     * @throws {TypeError} if name is null, undefined or not a string, or if cb is null, undefined or not a function
     */
    service<T>(name: string, cb: (container: Container) => T): Container {
        return this.serve(name, cb)
    }

    /**
     * Dumps the loaded services to the console.
     */
    dump(): void {
        this._tree.dump()
    }
}
import { Tree, Node, createTree } from './tree'

type Omit<T,K> = Pick<T, Exclude<keyof T, K>>

export type ContainerEnhancer<Services, Dependencies> = {
    (container: Container<Services, Dependencies>): Readonly<Services>
}

export default class Container<P = {[name: string]: unknown}, Dependencies = {}>{
    private _tree: Tree
    private _current: Node | null

    constructor() {
        this._tree = createTree()
        this._current = null
    }

    /**
     * TODO
     * @param enhancer 
     */
    use<S, C extends this>(enhancer: ContainerEnhancer<S, Dependencies>): Readonly<C & S>{
        return enhancer(this as any) as any
    }

    /**
     * Define a service for the container to serve.
     * The service will be defined as a property on the service, and will be lazily constructed. 
     * The construction of the service takes place the first time it is resolved (read).
     * If a circular dependency is detected, an Error is thrown. 
     * @param  name Name of the service
     * @param value The service
     * @returns The container
     * @throws {TypeError} if name is null, undefined or not a string, or if factory is null, undefined or not a function
     */
    serve<T extends P[K], K extends keyof Omit<P, keyof this>, C extends this>(name: K, value: T): Readonly<C & Pick<P, K>>;
    
    /**
     * Define a service for the container to serve.
     * The service will be defined as a property on the service, and will be lazily constructed. 
     * The construction of the service takes place the first time it is resolved (read).
     * If a circular dependency is detected, an Error is thrown. 
     * @param  name Name of the service
     * @param factory The service factory
     * @returns The container
     * @throws {TypeError} if name is null, undefined or not a string, or if factory is null, undefined or not a function
     */
    serve<T extends P[K], K extends keyof Omit<P, keyof this>, C extends this>(name: K, factory: (container: Readonly<Omit<P & Dependencies, K>>) => T): Readonly<C & Pick<P, K>>;
    serve<T extends P[K], K extends keyof Omit<P, keyof this>, C extends this>(name: K, valueOrFactory: T | ((container: Readonly<Omit<P & Dependencies, K>>) => T)): Readonly<C & Pick<P, K>> {
        if (!name || typeof name !== 'string')
            throw new TypeError(`'name' must be defined`)
        if (!valueOrFactory)
            throw new TypeError(`'factory' must be defined`)

        Object.defineProperty(this, name, {
            get: (): T => {
                const tree = this._tree

                if (tree.has(name)) {
                    const node = tree.get(name)

                    // the _current property is the parent to the service currently being resolved
                    // if _current is not null then we're loading a dependency that has not yet been loaded
                    if (this._current) {
                        node.parents.add(this._current)
                        this._current.children.add(node)
                    }

                    // factory has not yet returned, so we're in a resolve stack where we have looped back on ourselves (since tree.has(name) is true)
                    if (node.value === undefined) {
                        const parents = [name as string]
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
                const node = this._current = tree.add<T>(name, parent)
                const instance = valueOrFactory instanceof Function
                    ? valueOrFactory(this as any)
                    : valueOrFactory
                if(instance === undefined)
                    throw new Error('factory returned undefined')
                this._current = parent

                return node.value = instance
            },
            configurable: false,
            enumerable: true
        })

        return this as any
    }

    /**
     * Dumps the loaded services to the console.
     */
    dump(): this {
        this._tree.dump()
        return this
    }
}
import { Tree, Node, createTree } from './tree'

/**
 * A provider function is a function that takes a container where your dependencies are defined (at some point), and must return the services that you provide. 
 * @template Services The services the provider should provide
 * @template Dependencies The dependencies the provider needs to define the `Services`
 */
export type ContainerProvider<Services, Dependencies = {}> = {
    (container: Container<Services, Dependencies>): Readonly<Services>
}

/**
 * 
 * @template P The services the container should hold
 * @template Dependencies **DO NOT SET!* This template is only used internally for `ContainerProvider<Services, Dependencies>`'s 
 */
export default class Container<P = {[name: string]: unknown}, Dependencies = P>{
    private _tree: Tree = createTree()
    private _current: Node | null = null

    /**
     * Use a provider function that provides some of services defined in the template `<P>`
     * @param provider see `ContainerProvider`
     */
    use<S, C extends this>(provider: ContainerProvider<S, Dependencies>): Readonly<C & S>{
        return provider(this as any) as any
    }
    
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
    serve<T extends P[K], K extends keyof Omit<P, keyof this>, C extends this>(name: K, factory: (container: Readonly<Omit<P & Dependencies, K>>) => T): Readonly<C & Pick<P, K>> {
        if (!name || typeof name !== 'string')
            throw new TypeError(`'name' must be defined`)
        if (!factory)
            throw new TypeError(`'factory' must be defined`)

        Object.defineProperty(this, name, {
            get: (): T => {
                const tree = this._tree

                if (tree.has(name)) {
                    const node = tree.get<T>(name)

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
                    return node.value
                }

                const parent = this._current
                const node = this._current = tree.add<T>(name, parent)
                const instance = factory(this as any)
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
type TraverserCallback = (node: Node, depth?: number) => boolean | void

const _traverseChildren = (cb: TraverserCallback, node: Node, depth: number = 0): boolean => {
    const res = cb(node, depth)
    return typeof res === 'boolean' && res 
        || [...node.children].some(n => _traverseChildren(cb, n, depth + 1))
}

const _traverseParents = (cb: TraverserCallback, node: Node): boolean => {
    const res = cb(node)
    return typeof res === 'boolean' && res 
        || [...node.parents].some(p => _traverseParents(cb, p))
}

export interface Node<T = unknown> {
    key: string
    value?: T
    parents: Set<Node>
    children: Set<Node>
    traverseChildren: (cb: TraverserCallback, depth?: number) => boolean
    traverseParents: (cb: TraverserCallback) => boolean
}

export const createNode = <T = unknown>(key: string, parents: Array<Node>, value?: T): Node<T> => {
    const node = {
        key, value, parents: new Set(parents), children: new Set(),
        traverseChildren: function(this: Node<T>, cb: TraverserCallback, depth: number = 0) { return _traverseChildren(cb, this, depth)},
        traverseParents: function(this: Node<T>, cb: TraverserCallback){ return [...this.parents].some(parent => _traverseParents(cb, parent))}
    } as Node<T>
    parents.forEach(parent => parent.children.add(node))
    return node
}

export interface Tree {
    add: <T>(key: string, parent: Node | Node[] | null, value?: T) => Node<T>
    get: <T = unknown>(key: string) => Node<T>
    has: (key: string) => boolean
    getRoots: () => Node[] 
    traverseRoots: (cb: TraverserCallback) => boolean
    dump: () => Tree
}

export const createTree = (): Tree => {
    const nodes: {[key: string]: Node} = {}

    return {
        get: <T = unknown>(key: string): Node<T> => nodes[key] as Node<T>,
        has: (key: string): boolean => nodes.hasOwnProperty(key),
        getRoots: (): Array<Node> => Object.values(nodes).filter((node: Node) => node.parents.size === 0),
        add: function<T>(this: Tree, key: string, parent: Node | Node[] | null, value?: T): Node<T> {
            if(this.has(key))
                throw new Error(`Can't redefine property ${key}`)
            parent = parent || []
            const parents = Array.isArray(parent) ? parent : [parent]
            return nodes[key] = createNode(key, parents, value)
        },
        traverseRoots: function(this: Tree, cb: TraverserCallback): boolean { 
            return this
                .getRoots()
                .some(root => root.traverseChildren(cb)) 
        },
        dump: function(this: Tree): Tree {
            this.traverseRoots((node, depth) => {
                if(depth === 0){
                    console.log(`┌ ${node.key}    √ᴿᴼᴼᵀ`)
                    return
                }

                console.log(`├${'─'.repeat(depth! > 1 ? depth!-2 : 0)}${depth! > 1 ? '└' : ''}${node.children.size > 0 ? '┬' : '─'} ${node.key}`)
            })
            return this
        }
    }
}

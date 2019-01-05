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

export class Node {
    key: string
    value: any
    parents: Set<Node>
    children: Set<Node>

    constructor(key: string, value: any, parents: Node[]){
        this.key = key
        this.value = value
        this.parents = new Set(parents)
        this.children = new Set()
        
        this.parents.forEach(parent => parent.children.add(this))
    }

    traverseChildren(cb: TraverserCallback, depth = 0): boolean {
        return _traverseChildren(cb, this, depth)
    }

    traverseParents(cb: TraverserCallback): boolean {
        return [...this.parents].some(p => _traverseParents(cb, p))
    }
}

export class Tree {
    _nodes: {[key: string]: Node}

    constructor(){
        this._nodes = {}
    }

    /**
     * Creates and adds a node to the tree.
     * @param {string} key 
     * @param {any} value
     * @param {Node} parent If null or undefined, this node will be treated as a root
     * @returns {Node} the created node
     */
    add(key: string, value: any, parent: Node | Node[] | null): Node {
        if(this.has(key))
            throw new Error(`Can't redefine property ${name}`)
        parent = parent || []
        const parents = Array.isArray(parent) ? parent : [parent]
        return this._nodes[key] = new Node(key, value, parents)
    }

    get(key: string): Node {
        return this._nodes[key]
    }

    has(key: string): boolean {
        return this._nodes.hasOwnProperty(key)
    }

    getRoots(): Node[] {
        return (Object as any)
            .values(this._nodes)
            .filter(node => node.parents.size === 0)
    }

    /**
     * Depth-first traversal of all roots
     * @param {function} cb function to be called on each node. receives value and depth
     */
    traverseRoots(cb: TraverserCallback): boolean {
        return this.getRoots().some(root => root.traverseChildren(cb))
    }

    dump(): Tree{        
        this.traverseRoots((node, depth) => {
            // ┐ ┌ └ ┘ ├ ┬ ┼ ┴ ┤│ ─

            // ┌ A    √ᴿᴼᴼᵀ
            // ├┬ B  
            // ├└┬ C
            // ├─└─ F
            // ├─ D
            // ├─ E
            
            if(depth === 0){
                console.log(`┌ ${node.key}    √ᴿᴼᴼᵀ`)
                return
            }

            console.log(`├${'─'.repeat(depth! > 1 ? depth!-2 : 0)}${depth! > 1 ? '└' : ''}${node.children.size > 0 ? '┬' : '─'} ${node.key}`)
        })
        return this
    }
}
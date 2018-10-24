const _traverseChildren = (cb, node, depth = 0) => {
    const res = cb(node, depth)
    return typeof res === 'boolean' && res 
        || [...node.children].some(n => _traverseChildren(cb, n, depth + 1))
}

const _traverseParents = (cb, node) => {
    const res = cb(node)
    return typeof res === 'boolean' && res 
        || [...node.parents].some(p => _traverseParents(cb, p))
}

class Node{
    constructor(key, value, parents){
        this.key = key
        this.value = value
        this.parents = new Set(parents)
        this.children = new Set()
        
        this.parents.forEach(parent => parent.children.add(this))
    }

    traverseChildren(cb, depth = 0){
        return _traverseChildren(cb, this, depth)
    }

    traverseParents(cb){
        return [...this.parents].some(p => _traverseParents(cb, p))
    }
}

class Tree {
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
    add(key, value, parent){
        if(this.has(key))
            throw new Error(`Can't redefine property ${name}`)
        parent = parent || []
        const parents = Array.isArray(parent) ? parent : [parent]
        return this._nodes[key] = new Node(key, value, parents)
    }

    get(key){
        return this._nodes[key]
    }

    has(key){
        return this._nodes.hasOwnProperty(key)
    }

    getRoots(){
        return Object
            .keys(this._nodes)
            .map(key => this._nodes[key])
            .filter(node => node.parents.size === 0)
    }

    /**
     * Depth-first traversal of all roots
     * @param {function} cb function to be called on each node. receives value and depth
     */
    traverseRoots(cb){
        return this.getRoots().some(root => root.traverseChildren(cb))
    }

    dump(){        
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

            console.log(`├${'─'.repeat(depth > 1 ? depth-2 : 0)}${depth > 1 ? '└' : ''}${node.children.size > 0 ? '┬' : '─'} ${node.key}`)
        })
        return this
    }
}

module.exports.Tree = Tree
module.exports.Node = Node
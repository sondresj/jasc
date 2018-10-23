const _traverseChildren = (cb, node, depth = 0) => {
    const res = cb(node, depth)
    return typeof res === 'boolean' && res || node.children
            .some(n => _traverseChildren(cb, n, depth + 1))
}

const _traverseParents = (cb, node) => {
    if(!node) 
        return false

    const res = cb(node)
    return typeof res === 'boolean' && res || _traverseParents(cb, node.parent)
}

class Node{
    constructor(key, value, parent){
        this.key = key
        this.value = value
        this.parent = parent
        this.children = []
        if(parent)
            parent.children.push(this)
    }

    traverseChildren(cb, depth = 0){
        return _traverseChildren(cb, this, depth)
    }

    traverseParents(cb){
        return _traverseParents(cb, this)
    }
}

const _defProp = (obj, name, value) => {
    if(obj.hasOwnProperty(name))
        throw new Error(`Can't redefine property ${name}`)

    Object.defineProperty(obj, name, {
        get: () => value,
        configurable: true,
        enumerable: true
    })
}

class Tree {
    constructor(){
        this.roots = []
    }

    /**
     * Creates and adds a node to the tree.
     * @param {string} key 
     * @param {any} value
     * @param {Node} parent If null or undefined, this node will be treated as a root
     * @returns {Node} the created node
     */
    add(key, value, parent){
        const node = new Node(key, value, parent)
        _defProp(this, key, node)
        if(!parent)
            this.roots.push(node)
        return node
    }

    /**
     * Depth-first traversal of all roots
     * @param {function} cb function to be called on each node. receives value and depth
     */
    traverseRoots(cb){
        return this.roots.some(root => root.traverseChildren(cb))
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

            console.log(`├${'─'.repeat(depth > 1 ? depth-2 : 0)}${depth > 1 ? '└' : ''}${node.children.length > 0 ? '┬' : '─'} ${node.key}`)
        })
        return this
    }
}

module.exports.Tree = Tree
module.exports.Node = Node
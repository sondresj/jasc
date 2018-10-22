const _traverseChildren = (cb, node, depth = 0) => {
    const res = cb(node, depth)
    const stop = typeof res === 'boolean' && res
    return stop || node.children
            .map(n => _traverseChildren(cb, n, depth + 1))
            .reduce((prev, cur) => cur ? cur : prev, false)
}

const _traverseParents = (cb, node) => {
    if(!node) 
        return false

    const res = cb(node)
    const stop = typeof res === 'boolean' && res
    return stop || _traverseParents(cb, node.parent)
}

class Node{
    constructor(key, value, parent){
        this.key = key
        this.value = value
        this.parent = parent
        this.children = []
    }

    traverseChildren(cb, depth = 0){
        return _traverseChildren(cb, this, depth)
    }

    traverseParents(cb){
        return _traverseParents(cb, this)
    }
}

const _defProp = (obj, name, valueFunc) => {
    if(obj.hasOwnProperty(name))
        throw new Error(`Can't redefine property ${name}`)

    const getter = typeof valueFunc !== 'function' 
        ? () => valueFunc
        : valueFunc

    Object.defineProperty(obj, name, {
        get: getter,
        configurable: true,
        enumerable: true
    })
}

module.exports = class Tree {
    constructor(){
        this.roots = []
        this._stack = []
    }

    get current(){
        return this._stack.length > 0 
            ? this._stack[this._stack.length - 1] 
            : null
    }

    push(key, value = key){
        const { current } = this
        const node = new Node(key, value, current)
        _defProp(this, key, node)

        if(!current)
            this.roots.push(node)
        else
            current.children.push(node)
        
        this._stack.push(node)
        return node
    }

    pop(){
        return this._stack.pop()
    }

    /**
     * Depth-first traversal of all roots
     * @param {function} cb function to be called on each node. receives value and depth
     */
    traverseRoots(cb){
        return this.roots
            .map(root => root.traverseChildren(cb))
            .reduce((prev, cur) => cur ? cur : prev, false)
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
const Container = require('./container').default

describe('Container', () => {
    it('Serves served services', () => {
        const c = new Container()

        c.serve('A', () => 'a')
        expect(c.A).toBeTruthy()
    })

    it('Resolves dependencies', () => {
        const c = new Container()
        c.serve('A', () => 'a')
         .serve('B', c => 'b' + c.A)
         .serve('C', c => 'c' + c.B)

        expect(c.C).toBe('cba')
    })

    it('Always returns the same ref', () => {
        const c = new Container()
        c.serve('X', () => ({foo: 1}))

        const x1 = c.X
        const x2 = c.X

        expect(x1).toBe(x2)
    })

    it('Lazily loads services', () => {
        const c = new Container()
        let loadedA = false
        
        c.serve('a', () => {
            loadedA = true
            return 'a'
        })

        expect(loadedA).toBeFalsy()
        const {a} = c
        expect(loadedA).toBeTruthy()
    })

    it('Detects circular dependencies', () => {
        const c = new Container()
        
        c.serve('A', c => c.C ? 'a': undefined)
         .serve('B', c => c.A ? 'b': undefined)
         .serve('C', c => c.B ? 'c': undefined)
    
        expect(() => c.C).toThrowError(/Circular dependency/)
    })

    it('Detects self-dependency', () => {
        const c = new Container()

        c.serve('A', c => c.A)

        expect(() => c.A).toThrowError(/Circular dependency/)
    })

    it('Is Jimmy-proof', () => {
        const c = new Container()

        expect(() => c.serve(1)).toThrowError(/'name'/)
        expect(() => c.serve('a')).toThrowError(/'cb'/)
    })

    it('Does not allow undefined services', () =>{
        const c = new Container()
        c.serve('a', () => {})

        expect(() => c.a).toThrowError()
    })

    // Integration tests with Tree (not sure how much I like the need to do this, but meh..)

    it('Constructs nodes with correct parents', () => {
        const container = new Container()
        container
            .serve('a', c => 'a' + c.b + c.c)
            .serve('b', c => 'b')
            .serve('c', c => 'c')

        const a = container.a
        expect([...container._tree.get('a').children].map(child => child.key)).toEqual(['b','c'])
    })

    it('Constructs independet trees', () => {
        const container = new Container()
        container
            .serve('a', c => 'a' + c.b)
            .serve('b', c => 'b')
            .serve('c', c => 'c' + c.d)
            .serve('d', c => 'd')

        const {a,c} = container
        expect(container._tree.getRoots().map(root => root.key)).toEqual(['a','c'])
    })

    it('Constructs overlapping trees', () => {
        const container = new Container()
        container
            .serve('a', c => 'a' + c.c)         // a   b   dependencies point downwards 
            .serve('b', c => 'b' + c.c)         //  \ /
            .serve('c', c => 'c' + c.d + c.e)   //   c
            .serve('d', c => 'd')               //  / \
            .serve('e', c => 'e')               // d   e

        const {a,b} = container
        const roots = container._tree.getRoots()
        const cNode = container._tree.get('c')

        expect(roots.map(r => r.key)).toEqual(['a', 'b'])
        expect(cNode.parents.size).toBe(2)
        expect(cNode.children.size).toBe(2)
    })

    it('Connects nodes when resolving a subtree of a tree before the tree', () => {
        const container = new Container()
        container
            .serve('a', () => 'a')
            .serve('b', c => c.a + 'b')
            .serve('c', c => c.b + 'c')

        const b = container.b
        const c = container.c

        const roots = container._tree.getRoots()
        const bNode = container._tree.get('b')
        expect(roots.length).toBe(1)
        expect(roots[0].key).toBe('c')
        expect(roots[0].children.size).toBe(1)
        expect(roots[0].children.has(bNode)).toBeTruthy()
    })

    it('Doesnt return a new instance of itself when serving a service', () => {
        const container = new Container()
        const configured = container.serve('foo', () => 'bar')
        expect(container).toBe(configured)
    })
})
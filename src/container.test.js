const Container = require('./container')

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

        expect(() => c.serve(1)).toThrowError(/Argument: 'name'/)
        expect(() => c.serve('a')).toThrowError(/Argument: 'cb'/)
    })

    it('Does not allow undefined services', () =>{
        const c = new Container()
        c.serve('a', () => {})

        expect(c.a).toBeDefined()
    })

    it('Constructs nodes with correct parents', () => {
        const container = new Container()
        container
            .serve('a', c => 'a' + c.b + c.c)
            .serve('b', c => 'b')
            .serve('c', c => 'c')

        const a = container.a
        expect(container._tree.a.children.map(child => child.key)).toEqual(['b','c'])
    })

    it('Constructs independet trees', () => {
        const container = new Container()
        container
            .serve('a', c => 'a' + c.b)
            .serve('b', c => 'b')
            .serve('c', c => 'c' + c.d)
            .serve('d', c => 'd')

        const {a,c} = container
        expect(container._tree.roots.map(root => root.key)).toEqual(['a','c'])
    })
})
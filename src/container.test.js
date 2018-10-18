//import Container from './container'

const Container = require('./container')

describe('Container', () => {
    it('Serves served services', () => {
        const c = new Container()

        c.serve('A', () => 'a')
        expect(c.A).toBeTruthy()
    })

    it('Resolves dependencies', () => {
        const c = new Container()
        c.serve('A', () => 'a').serve('BA', c => 'b' + c.A)

        expect(c.BA).toBe('ba')
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
})
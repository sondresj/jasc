const Tree = require('./tree').Tree

describe('Tree', () => {
    it('Grows', () => {
        const tree = new Tree()
        const a = tree.add('a', 'a')
        tree.add('b', 'b', a)

        const roots = tree.getRoots()
        expect(roots.length).toBe(1)
        expect(roots[0].value).toBe('a')
        expect(roots[0].children.size).toBe(1)
    })

    it('Can grow multiple roots', () => {
        const tree = new Tree()
        tree.add('a', 'a')
        tree.add('b', 'b')

        const roots = tree.getRoots()
        expect(roots.length).toBe(2)
        expect(roots[0].value).toBe('a')
        expect(roots[1].value).toBe('b')
    })

    it('Can fuse roots', () => {
        const tree = new Tree()
        
        const a = tree.add('a', 'a')
        const b = tree.add('b', 'b')
        const c = tree.add('c', 'c', [a, b])
        const d = tree.add('d', 'd', c)
        const e = tree.add('e', 'e', c)
    })

    it('Can reach root from leaf', () => {
        const tree = new Tree()
        const a = tree.add('a', 'a')
        const b = tree.add('b', 'b', a)
        tree.add('c', 'c', b)
        
        expect(tree.get('c').parents.has(b))
        expect(tree.get('b').parents.has(a))
    })

    it('Can traverse roots', () => {
        const tree = new Tree()

        const a = tree.add('a', 'a')
        const b = tree.add('b', 'b', a)
        tree.add('c', 'c', b)

        const d = tree.add('d', 'd')
        const e = tree.add('e', 'e', d)
        tree.add('f', 'f', e)
        tree.add('g', 'g', e)

        const h = tree.add('h', 'h')
        tree.add('i', 'i', h)

        let traversedValues = []
        tree.traverseRoots(node => traversedValues.push(node.value))
        //tree.dump()
        expect(traversedValues).toEqual(['a','b','c','d','e','f','g','h','i'])
    })

    it('Can traverse roots with predicate', () => {
        const tree = new Tree();
        const a = tree.add('a', 'a')
        tree.add('b', 'b', a)
        tree.add('c', 'c')

        expect(tree.traverseRoots(n => n.key === 'd')).toBeFalsy()
        expect(tree.traverseRoots(n => n.key === 'c')).toBeTruthy()
    })

    it('Can stop travesing when predicate matches', () => {
        const tree = new Tree();
        let av = false, bv = false, cv = false, dv = false // v for visited
        const a = tree.add('a', () => { av = true; return 'a' })
        const b = tree.add('b', () => { bv = true; return 'b' }, a)
        tree.add('c', () => { cv = true; return 'c' }, b)
        tree.add('d', () => { dv = true; return 'd' })

        tree.traverseRoots(n => n.value() === 'b')
        expect(av && bv).toBeTruthy()
        expect(cv && dv).toBeFalsy()
    })

    it('Can traverse parents', () => {
        const tree = new Tree()
        const a = tree.add('a', 'a')            // a   b dependencies point downwards
        const b = tree.add('b', 'b')            //  \ /
        const c = tree.add('c', 'c', [a, b])    //   c
        const d = tree.add('d', 'd', c)         //  / \
        const e = tree.add('e', 'e', c)         // d   e

        const parents = []
        e.traverseParents(p => parents.push(p.key))

        expect(parents).toEqual(['c','a','b'])
    })

    it('Can prevent redefining nodes', () => {
        const tree = new Tree()

        tree.add('a')

        expect(() => tree.add('a')).toThrowError(/Can't redefine/)
    })

    it('Returns new node values', () => {
        const tree = new Tree()

        const node = tree.add('a')
        node.value = 'b'
        expect(tree.get('a').value).toBe('b')
    })
})
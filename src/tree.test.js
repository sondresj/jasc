const createTree = require('./tree').createTree

describe('Tree', () => {
    it('Grows', () => {
        const tree = createTree()
        const a = tree.add('a', null, 'a')
        tree.add('b', a, 'b')

        const roots = tree.getRoots()
        expect(roots.length).toBe(1)
        expect(roots[0].value).toBe('a')
        expect(roots[0].children.size).toBe(1)
    })

    it('Can grow multiple roots', () => {
        const tree = createTree()
        tree.add('a', null, 'a')
        tree.add('b', null, 'b')

        const roots = tree.getRoots()
        expect(roots.length).toBe(2)
        expect(roots[0].value).toBe('a')
        expect(roots[1].value).toBe('b')
    })

    it('Can fuse roots', () => {
        const tree = createTree()
        
        const a = tree.add('a', null, 'a')
        const b = tree.add('b', null, 'b')
        const c = tree.add('c', [a, b], 'c')
        const d = tree.add('d', c, 'd')
        const e = tree.add('e', c, 'e')
    })

    it('Can reach root from leaf', () => {
        const tree = createTree()
        const a = tree.add('a', null, 'a')
        const b = tree.add('b', a, 'b')
        tree.add('c', b, 'c')
        
        expect(tree.get('c').parents.has(b))
        expect(tree.get('b').parents.has(a))
    })

    it('Can traverse roots', () => {
        const tree = createTree()

        const a = tree.add('a', null, 'a')
        const b = tree.add('b', a, 'b')
        tree.add('c', b, 'c')

        const d = tree.add('d', null, 'd')
        const e = tree.add('e', d, 'e')
        tree.add('f', e, 'f')
        tree.add('g', e, 'g')

        const h = tree.add('h', null, 'h')
        tree.add('i', h, 'i')

        let traversedValues = []
        tree.traverseRoots(node => traversedValues.push(node.value))
        //tree.dump()
        expect(traversedValues).toEqual(['a','b','c','d','e','f','g','h','i'])
    })

    it('Can traverse roots with predicate', () => {
        const tree = createTree();
        const a = tree.add('a', null, 'a')
        tree.add('b', a, 'b')
        tree.add('c', null, 'c')

        expect(tree.traverseRoots(n => n.key === 'd')).toBeFalsy()
        expect(tree.traverseRoots(n => n.key === 'c')).toBeTruthy()
    })

    it('Can stop travesing when predicate matches', () => {
        const tree = createTree();
        let av = false, bv = false, cv = false, dv = false // v for visited
        const a = tree.add('a', null, () => { av = true; return 'a' })
        const b = tree.add('b', a, () => { bv = true; return 'b' })
        tree.add('c', b, () => { cv = true; return 'c' })
        tree.add('d', null, () => { dv = true; return 'd' })

        tree.traverseRoots(n => n.value() === 'b')
        expect(av && bv).toBeTruthy()
        expect(cv && dv).toBeFalsy()
    })

    it('Can traverse parents', () => {
        const tree = createTree()
        const a = tree.add('a', null, 'a')      // a   b dependencies point downwards
        const b = tree.add('b', null, 'b')      //  \ /
        const c = tree.add('c', [a, b], 'c')    //   c
        const d = tree.add('d', c, 'd')         //  / \
        const e = tree.add('e', c, 'e')         // d   e

        const parents = []
        e.traverseParents(p => parents.push(p.key))

        expect(parents).toEqual(['c','a','b'])
    })

    it('Can prevent redefining nodes', () => {
        const tree = createTree()

        tree.add('a')

        expect(() => tree.add('a')).toThrowError(/Can't redefine/)
    })

    it('Returns new node values', () => {
        const tree = createTree()

        const node = tree.add('a')
        node.value = 'b'
        expect(tree.get('a').value).toBe('b')
    })
})
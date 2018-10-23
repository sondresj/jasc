const { Tree } = require('./tree')

describe('Tree', () => {
    it('Grows', () => {
        const tree = new Tree()
        const a = tree.add('a', 'a')
        tree.add('b', 'b', a)

        expect(tree.roots.length).toBe(1)
        expect(tree.roots[0].value).toBe('a')
        expect(tree.roots[0].children.length).toBe(1)
    })

    it('Can grow multiple roots', () => {
        const tree = new Tree()
        tree.add('a', 'a')
        tree.add('b', 'b')

        expect(tree.roots.length).toBe(2)
        expect(tree.roots[0].value).toBe('a')
        expect(tree.roots[1].value).toBe('b')
    })

    it('Can reach root from leaf', () => {
        const tree = new Tree()
        const a = tree.add('a', 'a')
        const b = tree.add('b', 'b', a)
        tree.add('c', 'c', b)
        
        expect(tree.c.parent.parent.value).toBe('a')
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
        tree.dump()
        expect(traversedValues).toEqual(['a','b','c','d','e','f','g','h','i'])
    })

    it('Can traverse roots with predicate', () => {
        const tree = new Tree();
        const a = tree.add('a', 'a')
        tree.add('b', 'b', a)
        // tree.pop()
        // tree.pop()
        // tree.pop()
        tree.add('c', 'c')

        expect(tree.traverseRoots(n => n.key === 'd')).toBeFalsy()
        expect(tree.traverseRoots(n => n.key === 'c')).toBeTruthy()
    })

    it('Can traverse parents', () => {
        const tree = new Tree()
        const a = tree.add('a', 'a')
        const b = tree.add('b', 'b', a)
        const c = tree.add('c', 'c', b)
        const d = tree.add('d', 'a', c)

        expect(d.traverseParents(n => n.key === 'a')).toBeTruthy()
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
        expect(tree.a.value).toBe('b')
    })
})
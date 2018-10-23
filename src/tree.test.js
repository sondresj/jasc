//import Tree from './tree'
const Tree = require('./tree')

describe('Tree', () => {
    it('Grows', () => {
        const tree = new Tree()
        tree.push('a', 'a')
        tree.push('b', 'b')

        expect(tree.roots.length).toBe(1)
        expect(tree.roots[0].value).toBe('a')
        expect(tree.roots[0].children.length).toBe(1)
    })

    it('Can grow multiple roots', () => {
        const tree = new Tree()
        tree.push('a', 'a')
        tree.pop()
        tree.push('b', 'b')

        expect(tree.roots.length).toBe(2)
        expect(tree.roots[0].value).toBe('a')
        expect(tree.roots[1].value).toBe('b')
    })

    it('Can reach root from leaf', () => {
        const tree = new Tree()
        tree.push('a', 'a')
        tree.push('b', 'b')
        tree.push('c', 'c')
        
        expect(tree.c.parent.parent.value).toBe('a')
    })

    it('Can traverse roots', () => {
        const tree = new Tree()
        tree.push('a', 'a')
        tree.push('b', 'b')
        tree.pop()
        tree.push('c', 'c')
        tree.pop()
        tree.pop()
        tree.push('d', 'd')
        tree.push('e', 'e')
        tree.push('f', 'f')
        tree.push('g', 'g')
        tree.push('h', 'h')
        tree.pop()
        tree.push('i', 'i')
        let traversedValues = []
        tree.traverseRoots(node => traversedValues.push(node.value))
        tree.dump()
        expect(traversedValues).toEqual(['a','b','c','d','e','f','g','h','i'])
    })

    it('Can traverse roots with predicate', () => {
        const tree = new Tree();
        tree.push('a', 'a')
        tree.push('b', 'b')
        tree.pop()
        tree.pop()
        tree.pop()
        tree.push('c', 'c')

        expect(tree.traverseRoots(n => n.key === 'd')).toBeFalsy()
        expect(tree.traverseRoots(n => n.key === 'c')).toBeTruthy()
    })

    it('Can traverse parents', () => {
        const tree = new Tree()
        tree.push('a', 'a')
        tree.push('b', 'b')
        tree.push('c', 'c')
        const d = tree.push('d', 'a')

        expect(d.traverseParents(n => n.key === 'a')).toBeTruthy()
    })

    it('Can prevent redefining nodes', () => {
        const tree = new Tree()

        tree.push('a')

        expect(() => tree.push('a')).toThrowError(/Can't redefine/)
    })

    it('Returns new node values', () => {
        const tree = new Tree()

        const node = tree.push('a')
        node.value = 'b'
        expect(tree.a.value).toBe('b')
    })
})
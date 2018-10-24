//const fs = require('fs')
const Container = require('../src/container')
const MjtContainer = require('./mjt_container')

const bench = (name, closure, samples = 10) => {
    console.log(`Benchmarking ${name} with ${samples} samples`)
    // execute closure once to warm up (first run is always very slow for some reason)
    closure()

    let times = []
    for (let i = 0; i < samples; i++) {
        const t1 = process.hrtime.bigint()
        closure()
        const res = new Number(process.hrtime.bigint() - t1)
        times.push(res)
    }
    times = times.sort((a, b) => a - b)
    const avg = times.reduce((p, n) => p + n) / samples
    const avg80 = times
        .slice(samples / 10, samples - samples / 10)
        .reduce((p, n) => p + n)
        / (samples - 2 * samples / 10)

    console.log(`Results: `)
    console.log(`\t avg:     ${avg} ns (${avg / 1000000} ms)`)
    console.log(`\t avg80%:  ${avg80} ns (${avg80 / 1000000} ms)`)
    console.log(`\t median:  ${times[samples / 2]} (${times[samples / 2] / 1000000} ms)`)
    console.log(`\t min:     ${times[0]} (${times[0] / 1000000} ms)`)
    console.log(`\t max:     ${times[times.length - 1]} (${times[times.length - 1] / 1000000} ms)`)
    return {
        name,
        times,
        avgMs: avg / 1000000,
        avg80Ms: avg80 / 1000000,
    }
}

const generetateNames = length => {
    const chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    const res = []
    
    function generate(current) {
        if (current.length == length)
            res.push(current)
        else for (const i in chars)
            generate(current + chars[i])
    }
        
    generate('')
    return res   
}

const names = generetateNames(2)
console.log(`Generated ${names.length} services\n`)

bench('Jasc container - Giant dependency chain', () => {
    const container = new Container()
    for (let i = 0; i < names.length; i++) {
        const name = names[i]
        if (i === 0)
            container.serve(name, () => name)
        else
            container.serve(name, c => name + c[names[i - 1]])
    }

    const resolved = container[names[names.length - 1]] //triggers the construction of the whole shabang
})

bench('Mjt Container - Giant dependency chain', () => {
    const container = new MjtContainer()
    for (let i = 0; i < names.length; i++) {
        const name = names[i]
        if (i === 0)
            container.service(name, () => name)
        else
            container.service(name, c => name + c[names[i - 1]])
    }

    const resolved = container[names[names.length - 1]] //triggers the construction of the whole shabang
})

console.log('\n\n')

bench('Jasc Container - Giant with 1 service depending on all services', () => {
    const container = new Container()
    const lastIdx = names.length - 1
    for (let i = 0; i < names.length; i++) {
        const name = names[i]
        if (i === lastIdx)
            container.serve(name, c => name + names.slice(0, names.length - 2).map(n => c[n]).join(''))
        else
            container.serve(name, () => name)
    }

    const resolved = container[names[names.length - 1]] //triggers the construction of the whole shabang
})

bench('Mjt Container - Giant with 1 service depending on all services', () => {
    const container = new MjtContainer()
    const lastIdx = names.length - 1
    for (let i = 0; i < names.length; i++) {
        const name = names[i]
        if (i === lastIdx)
            container.service(name, c => name + names.slice(0, names.length - 2).map(n => c[n]).join(''))
        else
            container.service(name, () => name)
    }

    const resolved = container[names[names.length - 1]] //triggers the construction of the whole shabang
})

console.log('\n\n')

bench('Jasc Container - Creating container, register and resolve service wih 1 dependency a bunch of times', () => {
    for(let i = 0; i < 1000; i++){
        const container = new Container()
        const a = container.serve('A', c => 'a' + c.B).serve('B', () => 'b').A
    }
})

bench('Mjt Container - Creating container, register and resolve service wih 1 dependency a bunch of times', () => {
    for(let i = 0; i < 1000; i++){
        const container = new MjtContainer()
        const a = container.service('A', c => 'a' + c.B).service('B', () => 'b').A
    }
})

// fs.writeFileSync('../.bench/jasc.txt', JSON.stringify(jasc))
// fs.writeFileSync('../.bench/mjtc.txt', JSON.stringify(mjtc))
const unique = strs => [...new Set(strs)]

module.exports.Container = class Container{
    constructor(){
        this.services = {}
        this.isLoading = {}
        this.loadStack = []
        this.deps = {}
    }

    service(name, cb){
        Object.defineProperty(this, name, {
            get: () =>{
                if(this.isLoading[name]){
                    console.log('Services loaded: ', this.loadStack)
                    throw new Error(`Circular dependency: ${name}`)
                }

                if(this.loadStack.length > 0){
                    const existingDeps = this.loadStack[this.loadStack.length - 1].deps
                    this.loadStack[this.loadStack.length - 1].deps = unique([...existingDeps, name])
                }

                if(!this.services.hasOwnProperty(name)){
                    const currentLoading = {name, deps: []}
                    this.deps[name] = currentLoading
                    this.loadStack.push(currentLoading)

                    this.isLoading[name] = true
                    this.services[name] = cb(this)
                    this.isLoading[name] = false

                    this.loadStack.pop()
                }

                return this.services[name]
            },
            configurable: true,
            enumerable: true
        })

        return this
    }

    buildTrees(){
        const depNames = Object.keys(this.deps)

        const depsOfSomeoneElse = unique(depNames.flatMap(dep => this.deps[dep].deps))
        const isDepOfSomeoneElse = depToCheck => depsOfSomeoneElse.find(dep => dep === depToCheck) !== undefined

        const rootDeps = depNames.filter(name => !isDepOfSomeoneElse(name))
        const isRootDep = dep => rootDeps.find(rootDep => dep === rootDep) !== undefined

        const getTree = name => ({
            name,
            isRoot: isRootDep(name),
            trees: this.deps[name].deps.map(getTree)
        })

        return depNames.map(getTree).filter(tree => tree.isRoot)
    }
}


module.exports.VanillaContainer = class VanillaContainer {
    constructor(){
        this.services = {}
    }

    service(name, cb){
        Object.defineProperty(this, name, {
            get: () =>{
            
                if(!this.services.hasOwnProperty(name)){
                    this.services[name] = cb(this)
                }

                return this.services[name]
            },
            configurable: true,
            enumerable: true
        })

        return this
    }
}
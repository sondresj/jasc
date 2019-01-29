# Jasc Another Service Container

[![NPM Version](https://img.shields.io/npm/v/jasc.svg?style=flat)](https://www.npmjs.com/package/jasc)
[![CircleCI](https://circleci.com/gh/sondresj/jasc.svg?style=svg)](https://circleci.com/gh/sondresj/jasc)

## Features
* Circular Dependency detection
* Lazy loading of services
    * the Service callback function is called once when the service is resolved
* Services are served as properties on the container

## Installation

> npm i jasc

## Usage

Basic usage
```
import Container from 'jasc'

const container = new Container()
container.serve('greet', () => name => {
    console.log(`Hello ${name}!`)
})

container.greet('Michael Jackson') // Hello Michael Jackson!
```

Dependencies 
```
const container = new Container()

container
    .serve('store', () => createStore(rootReducer)) // the function will be invoked when the service is resolved, deferring the factory
    .serve('actionTypes', {      // when the service does not have any dependencies, the function is optional.
        INCREMENT: 'INCREMENT',
        DECREMENT: 'DECREMENT',
    })
    .serve('Actions', ({store, actionTypes}) => ({
        increment: () => store.dispatch({type: actionTypes.INCREMENT}),
        decrement: () => store.dispatch({type: actionTypes.DECREMENT}),
    }))
    .serve('Counter', c => Counter(c.Actions)) // Counter is a higher order component, eg: export default (actions) => class Counter extends React.Component {....
```

## TypeScript

With typescript, it is recommended that you define an interface for all the services the container should serve, and use this when creating the container. In this example, the following is in a file (e.g. 'configure.ts'). In here, everything should be configured and set up, and the container as the Services interface should be returned:
```
import { Store, createStore, applyMiddleware } from 'redux'
import Container from Jasc

import { createApp } from '../app.tsx'
import { Actions, IActions, reducer, IState } from '../actions.ts'

interface Services {
    store: Store<IState>
    actions: IActions
    App: Redux.ComponentType
}

export default (): Services => {
    const container = new Container<Services>() // The container now expectes you to serve 'store', 'actions', and 'app' with correct types. 
    return container
        .serve('store', () => createStore(reducer))
        .serve('actions', ({store}) => new Actions(store.dispatch))
        .serve('App', ({actions}) => createApp(actions))   // the return-value of this last serve call is the fully configured container. if you fail to serve all services defined in the Services interface, TS will complain. 
}
```

### One gotcha with TS 
```
interface Services {
    a: number
    b: number
}
const container = new Container<Services>()
const configured = container.serve('a', () => 1).serve('b', ioc => ioc.a + 1)

console.log(container as any === configured) // true, it's the same instance.
container.a    // TS error, the type of container is just Container<Services>, it does not inherit the props from Services
configured.a   // TS ok, the type of configured is the Container<Services> unioned with each service served. 
```
The 'Container' is not a union with the 'Services', but the return-type of a 'serve' call is a union of the 'Container' and a property for the service being served. A chain of serve-calls is therefore needed to build the complete type containing all the services. 

This is intentional, and you should not circumvent this by casting the container as the container unioned with the services! If you do, you will loose the typescript checks verifying that you've served all the services that you have defined and that the services' types are correct.
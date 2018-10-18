# Just Another Service Container

## Features
* Circular Dependency detection
* Lazy loading of services
    * the Service callback is called once when the service is resolved
* Services are served as properties on the container

## Usage

Basic usage
```
import Container from 'jasc'

const container = new Container()
container.serve('greet', c => name => {
    console.log(`Hello ${name}!`)
})

container.greet('Michael Jackson')
```

Dependencies 
```
const container = new Container()
const store = createStore(rootReducer)
container
    .serve('store', () => store)
    .serve('actionTypes', () => ({
        INCREMENT: 'INCREMENT',
        DECREMENT: 'DECREMENT',
    }))
    .serve('Actions, c => ({
        increment: () => c.store.dispatch({type: c.actionTypes.INCREMENT}),
        decrement: () => c.store.dispatch({type: c.actionTypes.DECREMENT}),
    }))
    .serve('Counter', c => Counter(c.Actions)) // Counter is a higher order component, eg: export default (actions) => class Counter extends React.Component {....
```
//@flow
import Convolvr from '../../world/world'
import Component from '../../model/component'

export default class StateSystem {

    world: Convolvr

    constructor ( world: Convolvr ) {
        this.world = world
    }

    init ( component: Component ) { 
        
        let attr = component.attrs.state

        //TODO: implement

        return {
            set: ( key: string, value: any ) => {
                this.set( component, key, value )
            },
            get: ( key: string) => {
                return this.get( component, key )
            }
        }
    }

    set ( component: Component, key: string, value: any ) {
        component.state[ key ] = value
    }

    get ( component: Component, key: string ): any {
        return component.state[ key ]
    }

}
import Convolvr from "../../world/world";
import Component from "../../model/component";

export default class ProjectileSystem {
    private world: Convolvr;
    
    constructor (world: Convolvr) {
        this.world = world
    }

    init(component: Component) { 

        let attr = component.attrs.projectile

        return {
            
        }

    }
}


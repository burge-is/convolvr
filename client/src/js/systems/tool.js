export default class ToolSystem {
    constructor (world) {
        this.world = world
    }
    // hook into user.toolbox interfaces (primaryAction, etc.. )
    init (component) { 
        let prop = component.props.tool,
            state = {}

        return state
    }
}


export default class BrowserSystem {

    constructor ( world: Convolvr ) {

        this.world = world

    }

    init ( component: Component ) { 
        
        let attr = component.attrs.browser

        switch ( attr.type ) {

            case "files":

            break
            case "directories":


            case "text":

            break
            case "html":

            break
            case "images":

            break
            case "video":

            break
            case "audio":

            break
            case "entities":

            break
            case "components":

            break
            case "attrs":

            break
            case "users":

            break
            case "worlds":

            break
            case "places":

            break
        }

        return {
            navigate: ( url ) => {
                this.navigate( component, url )
            },
            upOneLevel: ( url ) => {
                this.upOneLevel( component )
            },
            back: ( url ) => {
                this.back( component )
            },
            forward: ( url ) => {
                this.forward( component )
            },
            refresh: ( url ) => {
                this.refresh( component )
            },
            type: attr.type
        }
    }

    upOneLevel ( component ) {

    }

    navigate ( component, url ) {

    }

    back ( component ) {

    }

    forward ( component ) {


    }
    
    refresh ( component ) {


    }

    // implement
}
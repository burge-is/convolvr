import Tool from '../../../../world/tool'
import Entity from '../../../../core/entity'
import { GRID_SIZE, GLOBAL_SPACE } from '../../../../config'

export default class WorldTool extends Tool {

  constructor ( data, world, toolbox ) {

    super ( data, world, toolbox )

    let cameraPos = world.three.camera.position,
        coords = GLOBAL_SPACE

      this.mesh = null
      this.name = "World Tool"
      this.options = {

      }

      this.entity = new Entity(-1, [
          {
            attrs: {
              geometry: {
                shape: "box",
                size: [ 0.1, 0.1, 0.4 ]
              },
              material: {
                name: "metal"
              },
              tool: {
                panel: {
                  title: "Worlds",
                  color: 0x07ff07,
                  content: {
                    attrs: {
                      metaFactory: { // generates factory for each item in dataSource
                        type: "world", // entity, attr, place, world, user, file, directory
                        //attrName: "geometry",
                        dataSource: this.world.systems.assets.worlds
                      }
                    }
                  }
                }
              }
            },
            components: [
              this.initLabel( false, "Worlds")
            ]
          }
        ], [0,0,0], [0,0,0,1], coords)

    }

    primaryAction ( telemetry ) {
      
    }

    secondaryAction ( telemetry, value ) {
    
    }
    
    configure ( config ) {
      
      if ( typeof config == 'object' && Object.keys(config).length > 0 ) {
        let newWorld = [ config.userName, config.name ]
        if ( !!newWorld[ 0 ] && !!newWorld[ 1 ] ) { // not navigating to built in ui / page

            three.world.reload ( newWorld[ 0 ], newWorld[ 1 ], "", [ 0, 0, 0 ], true ) // load new world (that's been switched to via browser history)
        }
      }
        // make this use the item as a portal for now
        // this.options = Object.assign( {}, config.data )
        // console.log("Configuring tool ", this.options)
      
  }

}

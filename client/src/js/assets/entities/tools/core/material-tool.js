import Tool from './tool'
import Entity from '../../../../entity'
import { GRID_SIZE } from '../../../../config'

export default class MaterialTool extends Tool {

  constructor (data, world, toolbox) {

    super(data, world, toolbox)

    let cameraPos = world.three.camera.position,
        coords =  [ cameraPos.x, 0, cameraPos.z ].map( (c, i) => Math.floor( c / GRID_SIZE[ i ] ) )

    this.mesh = null
    this.name = "Material Tool"
    this.options = {
      color: 0xffffff,
      name: "",
      basic: false,
      faceNormals: true
    }

      this.entity = new Entity(-1, [{
          props: {
            geometry: {
              shape: "box",
              size: [3000, 1200, 8000]
            },
            material: {
              name: "metal"
            },
            tool: {
              panel: {
                title: "Materials",
                color: 0x07ffff,
                content: {
                  props: {
                    metaFactory: { // generates factory for each item in dataSource
                      type: "prop", // entity, prop
                      propName: "material",
                      dataSource: this.world.systems.assets.props.material
                    },
                    layout: {
                      type: "grid",
                      mode: "factory", // child components will ignore layout
                      columns: 3
                    }
                  }
                }
              }
            }
          },
          components: [
            this.initLabel( false, "Material")
          ]
        }
      ], coords)
    }

    primaryAction ( telemetry ) {
      
      let color         = this.options.color,
          material      = this.options.material,
          basic         = this.options.basic,
          cursor        = telemetry.cursor,
          user          = this.world.user,
          systems       = this.world.systems,
          assetSystem   = systems.assets,
          cursorSystem  = systems.cursor,
          cursorState   = cursor.state.cursor || {},
          position      = telemetry.position,
          quat          = telemetry.quaternion,
          selected      = !!cursorState.entity ? cursorState.entity : false,
          coords        = telemetry.voxel,
          props         = {},
          components    = [],
          component     = null,
          componentPath = []
          entityId      = -1,
          entity        = null


          
      return {
        coords,
        component,
        componentPath,
        entity,
        entityId,
        components
      }

    }

    secondaryAction (telemetry, value) {
    
    }
    
    configure ( config ) {

      if ( config.color ) {

        this.options.color = config.color
        this.entity.mesh.material.color = config.color
        this.entity.mesh.material.needsUpdate = true

      }

      if ( config.name ) 

        this.options.name = config.name

      if ( config.basic )

        this.options.basic = config.basic


    }

}
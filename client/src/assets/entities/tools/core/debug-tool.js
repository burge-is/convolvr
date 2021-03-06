import Tool from '../../../../world/tool'
import Entity from '../../../../model/entity'
import { GRID_SIZE, GLOBAL_SPACE } from '../../../../config'

export default class DebugTool extends Tool {

  constructor ( data, world, toolbox ) {

    super ( data, world, toolbox )

      let cameraPos = world.three.camera.position,
          coords = GLOBAL_SPACE
          
      this.mesh = null
      this.name = "Debug Tool"
      this.options = {

      }

      this.entity = new Entity( -1, [
          {
            attrs: {
              geometry: {
                shape: "box",
                size: [ 0.5, 0.34, 1.333 ]
              },
              material: {
                name: "metal"
              },
              tool: {
                panel: {
                  title: "Debug",
                  color: 0x07ff07,
                  content: {
                    attrs: {
                      debug: {
                          user: true, // check the items below for the user's avatar
                          position: true,
                          voxel: true,
                          cursors: true,
                      },
                      text: {
                        color: "#ffffff",
                        background: "#0000ff",
                        lines: [ "Debug out" ]
                      }
                    }
                  }
                }
              }
            },
            components: [
              this.initLabel( false, "Debugger")
            ]
          }
        ],
        null,
        null,
        coords)

    }

    primaryAction ( telemetry ) {
      
    }

    secondaryAction ( telemetry, value ) {
    
    }
    
    configure ( config ) {

    }

    generatePreview( component, preset, data ) {
      
      let preview = null
      
      return preview
      
    }
    
}

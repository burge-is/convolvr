export default class HandSystem {

    constructor ( world ) {
        this.world = world
    }

    init ( component ) {
         
        let userInput = this.world.userInput

        if ( component.props.hand == undefined || component.props.hand != undefined && userInput.trackedControls == false && userInput.leapMotion == false) {
            setTimeout(()=>{
                this.toggleTrackedHands( component, false )
            }, 1500)
        }
    
        return {
            trackedHands: false,
            toggleTrackedHands: ( toggle = true ) => {
                this.toggleTrackedHands( component, toggle )
            },
            grip: ( value ) => {
                this.grip( component, value )
            },
            setHandOrientation: ( position, rotation, index ) => {
                this.setHandOrientation( component, position, rotation, index )
            }
        }
    }

    grip( component, value ) {

        let avatar = component.entity,
            cursors = !!avatar ? avatar.componentsByProp.cursor : false,
            entity = null, //hand.children[0].userData.component.props.,
            cursor = null,
            state = null,
            handPos = [0, 0, 0],
            avatarPos = [0, 0, 0],
            oldVoxel = [0, 0, 0],
            pos = [0, 0, 0]
             //entity.mesh.position,

        if ( component ) {
            state = component.state

            if ( !state.hand.trackedHands && cursors ) {
                cursor = cursors[ 0 ]
            } else {
                cursor = component.allComponents[ 0 ]
            }
        }

        if ( cursor ) {
            if ( Math.round(value) == -1 ) {
                if ( state.hand.grabbedEntity ) {
                    console.info("Let Go")
                    entity = state.hand.grabbedEntity
        
                    if ( entity ) {
                        component.mesh.remove(entity.mesh)
                        three.scene.add(entity.mesh)
                        if ( state.hand.trackedHands ) {
                            handPos = component.mesh.position
                            entity.update( handPos.toArray(), component.mesh.quaternion.toArray() )
                        } else {
                            avatarPos = component.entity.mesh.position
                            entity.update( avatarPos.toArray(), avatar.mesh.quaternion.toArray() )    
                        }
                        entity.mesh.translateZ( -entity.boundingRadius )
                        entity.mesh.updateMatrix()
                        entity.position = entity.mesh.position.toArray()
                        entity.getVoxel( false, true )
                        entity.save( oldVoxel )
                        state.hand = Object.assign({}, state.hand, { grabbedEntity: false })
                    }
                }
            } else {
                entity = cursor.state.cursor.entity

                if (!!entity && !!!state.hand.grabbedEntity) {
                    console.info("Pick Up")
                    three.scene.remove( entity.mesh )
                    state.hand.grabbedEntity = entity
                    component.mesh.add( entity.mesh )
                    entity.mesh.position.fromArray( [0, 0, -entity.boundingRadius] )
                    entity.mesh.quaternion.fromArray([0, 0, 0, 1])
                    entity.mesh.updateMatrix()
                }
            }
        }
    }

    setHandOrientation ( component, position, rotation, index ) {

        let mesh = component.mesh

        if ( mesh ) {
            mesh.autoUpdateMatrix = false
            mesh.position.fromArray(position).add(this.world.camera.position)
            //mesh.translateX(0.3+ index*-0.5)
            mesh.position.y += this.world.settings.floorHeight
            mesh.quaternion.fromArray(rotation)
            mesh.updateMatrix()
        }
    }

    toggleTrackedHands ( component, toggle = true ) {
      
        let scene = window.three.scene,
            avatar = component.entity,
            position = null,
            cursors = avatar.componentsByProp.cursor,
            hands = avatar.componentsByProp.hand

        if (!avatar || !avatar.mesh) {
            console.warn("toggleTrackedHAnds FaileD!!")
            console.warn("No avatar entity for hand.toggleTrackedHands()")
            return
        } else {
            position = avatar.mesh.position
            cursors = avatar.componentsByProp.cursor,
            hands = avatar.componentsByProp.hand
        }

      if ( cursors )
       cursors[0].mesh.visible = !toggle

      hands.map( ( handComponent, i ) => {

        let hand = handComponent.mesh

        handComponent.state.hand.trackedHands = toggle

        if ( toggle ) { 
            //this.headMountedCursor.mesh.visible = false // activate under certain conditions..
            hand.parent.remove(hand)
            scene.add(hand)
            hand.position.set(position.x -0.7+ i*1.4, position.y -0.4, position.z -0.5)
            
            if ( i > 0 ) {
              if ( !!hand.children[0] ) {
                hand.children[0].visible = true
              }  
            } 
        
        } else {

            avatar.mesh.add(hand)

            if ( i > 0 ) {
              if ( !!hand.children[0] ) {
                hand.children[0].visible = false
              }  
            }
            hand.position.set(-0.7+ i*1.4, -0.35, -0.25)
        }

        hand.updateMatrix()
      })
    }
}


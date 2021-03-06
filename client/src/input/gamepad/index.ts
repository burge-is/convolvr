import TrackedControllers from './tracked-controllers'
import UserInput from '../user-input';
import Convolvr from '../../world/world';

export default class GamePadHandler {

  public cooldown: boolean | number  = 0
  public cooldownTimeout: boolean | any | number = 0
  public bumperCooldown: boolean | number = 0
  public bumperCooldownTimeout: boolean | any | number = 0
  public buttons: number[]
  public axes: number[]
  public trackedControllers: TrackedControllers

	constructor (input: UserInput) {
    let gamepads = input.gamepads
    
		this.cooldownTimeout       = null
		this.bumperCooldown        = 0
		this.bumperCooldownTimeout = null
    this.trackedControllers    = new TrackedControllers( input, (window as any).three.world )
    this.buttons               = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
    this.axes                  = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
    function gamepadHandler (e: any, connecting: boolean) {

      let gamepad = e.gamepad;
		      input.gamepadMode = true;

      console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
                  gamepad.index, gamepad.id,
                  gamepad.buttons.length, gamepad.axes.length)
                  
      if ( connecting ) {
        gamepads[ gamepad.index ] = gamepad

        if ( gamepad ) {
          let id = gamepad.id
        }

      } else {
        delete gamepads[gamepad.index]
      }
    }
    window.addEventListener("gamepadconnected", function(e: any) { gamepadHandler( e, true ) }, false)
    window.addEventListener("gamepaddisconnected", function(e: any) { gamepadHandler( e, false ) }, false)
  }

  update (input: UserInput, world: Convolvr) {
    let g = 0,
        id = "",
        gamepad = null,
        trackedControls = false,
        gamepads = navigator.getGamepads()

    if ( !gamepads ) {
      return
    }

    while ( g < gamepads.length ) {
      gamepad = gamepads[g]
      if ( gamepad ) {
        id = gamepad.id
        if ( id.indexOf('Oculus Touch') > -1 ) {

          this.trackedControllers.handleOculusTouch( gamepad )
          trackedControls = true

        } else if ( id.indexOf('OpenVR Gamepad') > -1 ) {
          this.trackedControllers.handleOpenVRGamepad( gamepad )
          trackedControls = true
        } else if ( id.indexOf('Oculus Remote') > -1 ) {
          this.trackedControllers.handleOculusRemote( gamepad )
        } else if ( id.indexOf('Daydream Controller') > -1 ) {
          this.trackedControllers.handleDaydreamController( gamepad )
          trackedControls = true
        } else if ( id.toLowerCase().indexOf('xbox') > -1 ) {
          this.handleXboxGamepad( input, world, gamepad )
        } else if ( id.indexOf('Gamepad') > -1 ) { 
          this.handleMobileGamepad( input, world, gamepad )
        }
        // } else {
        //   this._handleXboxGamepad( input, world, gamepad ) // assume generic dual analog controller
        // }
        if ( trackedControls && input.trackedControls == false && world.mode == "stereo" ) {
          input.trackedControls = true
          setTimeout(()=>{ (world.user as any).avatar.componentsByAttr.hand[0].state.hand.toggleTrackedHands(true) }, 500 )
        } 
      }
      g ++;
    }
  }

  private handleMobileGamepad (input: UserInput, world: Convolvr, gamepad: Gamepad) {
    let a = gamepad.axes.length,
        buttons = gamepad.buttons,
        b = buttons.length,
        i = 0,
				rotation = input.rotationVector,
				tools = (world.user as any).toolbox
    // implement..
    // 17 buttons
    // 4 axis

    if ( this.down( buttons, 0 ) ) { // top triggers: 4 5
      tools.nextTool(-1, 0) // previous tool, right hand
    }
    if ( this.down( buttons, 1 ) ) {
      tools.nextTool(1, 0) // next tool, right hand
    }

    if ( this.up( buttons, 2 ) ) { // bottom triggers: 6 7
        tools.usePrimary(0) // right hand
    }
    if ( this.up( buttons, 3 ) ) {
        tools.useSecondary(0) // right hand
    }
   
    if ( gamepad.axes[0] == 0 && gamepad.axes[2] == 0 && gamepad.axes[3] == 0) { // some cheap gamepads have fake axis
      if ( Math.abs(gamepad.axes[1]) > 0.1 ) { // create settings for stick configuration
          input.moveVector.z = gamepad.axes[0] * 0.090
      }
     } else {
        if (Math.abs(gamepad.axes[0]) > 0.1) {
          input.moveVector.x = gamepad.axes[0] * 0.090
        }
        if (Math.abs(gamepad.axes[1]) > 0.1) {
          input.moveVector.z = gamepad.axes[1] * 0.090
        }
        if (Math.abs(gamepad.axes[2]) > 0.10) { // 10 percent deadzone
          rotation.y += -gamepad.axes[2] / 20.0
        }
        if (Math.abs(gamepad.axes[3]) > 0.10) {
          rotation.x += -gamepad.axes[3] / 20.0
        }
     }

     let buttonState: number[] = this.buttons = []
     gamepad.buttons.map((button: any) => {
       buttonState.push( typeof button == 'object' ? button.value : button )
     })

  }

  private handleXboxGamepad (input: UserInput, world: Convolvr, gamepad: Gamepad) {
    let a = gamepad.axes.length,
        buttons = gamepad.buttons,
        b = buttons.length,
        i = 0,
				rotation = input.rotationVector as any,
				tools = (world.user as any).toolbox

    if ( b > 8 ) {
      // face buttons: 0 1 2 3
      if ( this.down( buttons, 0 ) ) {
        this.jump( input )
      }
      
      if ( this.down( buttons, 4 ) ) { // top triggers: 4 5
        tools.nextTool(-1, 0) // previous tool, right hand
      }
      if ( this.down( buttons, 5 ) ) {
        tools.nextTool(1, 0) // next tool, right hand
      }
      if ( this.down( buttons, 6 ) ) {
        tools.grip(0, 1) // right hand
      }

      if ( this.up( buttons, 6 ) ) { // bottom triggers: 6 7
        tools.grip(0, -1) // right hand
      }
      if ( this.up( buttons, 7 ) ) {
        tools.usePrimary(0) // right hand
      }
      if ( this.down( buttons, 7 ) ) {
          tools.preview(0, 0) // right hand
      }
      
    }

    if ( b >= 16 ) {
      // select / start: 8 9
      // stick click(s): 10 11
      // dpad buttons: 12 13 14 15
    }

    if ( a >= 4 ) { // standard dual analogue controller

        if (Math.abs(gamepad.axes[0]) > 0.1) {
          input.moveVector.x = gamepad.axes[0] * 0.60
        }
        if (Math.abs(gamepad.axes[1]) > 0.1) {
          input.moveVector.z = gamepad.axes[1] * 0.60
        }
        if (Math.abs(gamepad.axes[2]) > 0.10) { // 10 percent deadzone
          rotation.y += -gamepad.axes[2] / 20.0
        }
        if (Math.abs(gamepad.axes[3]) > 0.10) {
          rotation.x += -gamepad.axes[3] / 20.0
        }

    }

    let buttonState: any[] = this.buttons = []
    gamepad.buttons.map(button=> {
      buttonState.push( typeof button == 'object' ? button.value : button )
    })

  }

  jump ( input: UserInput ) {
    if ( !input.device.falling ) {
      input.device.falling = true;
      input.device.velocity.y = 400
    }
  }

  down ( buttons: GamepadButton[], index: number ) {
    let value = this.buttonPressed( buttons[ index ] ) && !this.buttons[ index ]
   // this.buttons[ index ]  = this.buttonPressed( buttons[ index ] )
    return value
  }

  up ( buttons: GamepadButton[], index: number ) {
    let value = !this.buttonPressed( buttons[ index ] ) && this.buttons[ index ]
    //this.buttons[ index ] = this.buttonPressed( buttons[ index ] )
    return value
  }

	triggerCooldown () {
		this.cooldown = true
		clearTimeout(this.cooldownTimeout)
		this.cooldownTimeout = setTimeout(()=>{
			this.cooldown = false
		}, 40) as any;
	}

	bumperCoolDown () {
		this.bumperCooldown = true
		clearTimeout(this.bumperCooldownTimeout)
		this.bumperCooldownTimeout = setTimeout(()=>{
			this.bumperCooldown = false
		}, 300) as any;
	}

  buttonPressed (b: GamepadButton) {
    if (typeof(b) == "object") {
      return b.pressed;
    }
    return b > 0.8;
  }

}

export default function initLocalSettings ( world ) {

		let cameraMode = localStorage.getItem("camera"),
			vrMovement = localStorage.getItem("vrMovement"),
			IOTMode = localStorage.getItem("IOTMode"),
			lighting = localStorage.getItem("lighting"),
			geometry = localStorage.getItem("geometry"),
			enablePostProcessing = localStorage.getItem("postProcessing"),
			aa = localStorage.getItem("aa"),
			shadows = localStorage.getItem("shadows"),
			floorHeight = localStorage.getItem("floorHeight"),
			viewDistance = localStorage.getItem("viewDistance"),
			leapMode = localStorage.getItem("leapMode"),
			manualLensDistance = localStorage.getItem("manualLensDistance"),
			fov = localStorage.getItem("fov")

		if ( cameraMode == null ) {

			cameraMode = 'fps'
			localStorage.setItem("camera", 'fps')

		}

		if ( leapMode == null ) {

			leapMode = "hybrid"
			localStorage.setItem( "leapMode", leapMode )

		}

		if ( vrMovement == null ) {

			vrMovement = 'stick' // change to teleport later
			localStorage.setItem("vrMovement", vrMovement)

		}

		if ( IOTMode == null ) {

			IOTMode = 'off'
			localStorage.setItem("IOTMode", IOTMode)

		}

		if ( aa == null ) {

			aa = 'on'
			localStorage.setItem("aa", aa)

		}

		if ( shadows == null ) {

			shadows = 0
			localStorage.setItem( "shadows", shadows ) 

		} else {

			shadows = parseInt( shadows )

		}

		if ( geometry == null ) {

			geometry = window.innerWidth < 720 ? 1 : 2

		} else {

			geometry = parseInt( geometry )

		}

		if ( lighting == null ) {

			lighting = 'high'
			localStorage.setItem("lighting", !world.mobile ? 'high' : 'low')

		}

		if ( enablePostProcessing == null ) {

			enablePostProcessing = 'off'
			localStorage.setItem("postProcessing", enablePostProcessing)

		}

		if ( floorHeight == null ) {

			floorHeight = 0
			localStorage.setItem("floorHeight", floorHeight)

		} 

		if ( viewDistance == null ) {

			viewDistance = 0
			localStorage.setItem("viewDistance", 0)

		} else {

			viewDistance = parseInt( viewDistance )

		}

		if ( fov == null ) {
			
			fov = 75
			localStorage.setItem("fov", fov)

		} else {

			fov = parseInt( fov )

		}

		if ( manualLensDistance == null ) {

			manualLensDistance = 0

		} else {

			manualLensDistance = parseFloat( manualLensDistance )

		}

		world.fov = fov
		world.aa = aa
		world.shadows = shadows
		world.geometry = geometry
		world.viewDistance = viewDistance
		world.cameraMode = cameraMode
		world.vrMovement = vrMovement
		world.lighting = lighting
		world.enablePostProcessing = enablePostProcessing
		world.IOTMode = IOTMode == 'on'
		world.floorHeight = parseInt(floorHeight)
		world.userInput.leapMode = leapMode
		world.manualLensDistance = manualLensDistance

	}
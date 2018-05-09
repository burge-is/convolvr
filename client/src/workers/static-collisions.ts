/*  static collision detection worker */

let distance2d = ( a: number[], b: number[] ): number => {
    return Math.sqrt( Math.pow( (a[0]-b[0]), 2 ) + Math.pow( (a[2]-b[2]), 2 ) )
  },
  distance2dCompare = ( a: number[], b: number[], n: number): boolean => { // more efficient version of distance2d()
	  return Math.pow( (a[0]-b[0]), 2 ) + Math.pow( (a[2]-b[2]), 2 ) < (n*n)
  },
  distance3dCompare = ( a: number[], b: number[], n: number): boolean => { // ..faster than using Math.sqrt()
	  return (Math.pow( (a[0]-b[0]), 2 ) + Math.pow( (a[1]-b[1]), 2 ) + Math.pow( (a[2]-b[2]), 2 ) ) < (n*n)
  }

let observer = {
		position: [0, 0, 0],
		prevPos: [0, 0, 0],
		velocity: [0, 0, 0],
		vrHeight: 1.66
	},
	voxelList: any[] = [],
	voxels: any = []

let scWorker = (self as any);

scWorker.update = ( ) => {

	var distance = 0,
		position: any = observer.position,
		innerBox 	 = [false, false],
		velocity 	 = observer.velocity,
		vrHeight 	 = observer.vrHeight,
		collision 	 = false,
		yPos 		 = 0,
		voxel 		 = null,
		ent 		 = null,
		entRadius    = 10,
		structure 	 = null,
		bounds 		 = [0, 0],
		voxel 		 = null,
		delta 		 = [0, 0],
		oPos 		 = [],
		speed 		 = 0,
		e 			 = 0,
		i 			 = 0,
		v 			 = 0

	for ( i = 0; i < voxelList.length; i ++ ) {
		voxel = voxelList[ i ]

		if ( !!!voxel || !!!voxel.position) continue
		if ( !!voxel && distance2dCompare( position, voxel.position, 180 ) ) { 	// do collisions on voxels & structures... just walls at first..
			if ( voxel.loaded == undefined ) {
				voxel.loaded = true
				scWorker.postMessage('{"command": "load entities", "data":{"coords":"'+voxel.cell[0]+'.'+voxel.cell[1]+'.'+voxel.cell[2]+'"}}');
			}
			if ( distance2dCompare( position, voxel.position, 60 ) ) {

				let alt = voxel.altitude || 0

				yPos = voxel.position[1]
				if ( distance2dCompare( position, voxel.position, 24.5 ) ) {
					if ( position[1] > yPos - 21 + vrHeight  && position[1] < 14.25+yPos + (vrHeight != 0 ? vrHeight+0.25 : 0) ) {
						collision = true
						scWorker.postMessage('{"command": "platform collision", "data":{"type":"top", "position":[' + voxel.position[0] + ',' + yPos + ',' + voxel.position[2] + '] }}');
					}
				}
				if ( !!voxel.entities && voxel.entities.length > 0 ) {
					collision = scWorker.checkStaticCollisions( voxel, position )
				}
			}
		}
	}

	if ( !collision )
		observer.prevPos = [ observer.position[0], observer.position[1], observer.position[2] ]

	scWorker.postMessage('{"command": "update"}')
	scWorker.updateLoop = setTimeout( () => {
		scWorker.update()
	}, 15)
}

scWorker.checkStaticCollisions = ( voxel: any, position: number[] ) => {
	let e = voxel.entities.length - 1,
		ent: any = null,
		entRadius = 10,
		collision = false

	while (e >= 0) {
		ent = voxel.entities[e]
		entRadius = ent.boundingRadius
		if (!!!ent || !!!ent.components) {
			console.warn("Problem with entity! ", e, ent); continue
		}
		if (distance3dCompare(
			position,
			[ent.position[0] - entRadius/2.0, ent.position[1],
			ent.position[2] - entRadius/2.0], (entRadius * 1.6 || 3) + 2.5
		)) {

			ent.components.map( (entComp: any) => {
				let boundingRadius = entComp.boundingRadius * 1.2 ||
				    Math.max(entComp.attrs.geometry.size[0], entComp.attrs.geometry.size[2]) * 1.2

				if (!!entComp.attrs.floor) {
					let rootPos = ent.position.map( (v: any) => v-ent.boundingRadius / 2.0 )
					if (distance2dCompare(
						position,
						[rootPos[0] + entComp.position[0], 0, rootPos[2] + entComp.position[2]],
						boundingRadius * 1.7
					)) {
						let verticalOffset = (position[1] + 2 - (entComp.position[1] + ent.position[1] )) //  + entComp.geometry ? entComp.geometry.size[1] : 1
						if (verticalOffset > 0 && verticalOffset < 5) {
							scWorker.postMessage(JSON.stringify({
								command: "floor collision", data: {
									position: entComp.position,
									floorData: entComp.attrs.floor
								}
							}))
							collision = true
						}
					}
				} else if (distance3dCompare(
					position,
					[ent.position[0] + entComp.position[0], ent.position[1] + entComp.position[1], ent.position[2] + entComp.position[2]],
					boundingRadius
				)) {
					collision = true
					scWorker.postMessage(JSON.stringify({ command: "entity-user collision", data: { position: entComp.position } }))
				}

			})
		}
		e -= 1
	}
	return collision
}

scWorker.onmessage = (event: any) => {

	var message  = JSON.parse( event.data ),
		data 	 = message.data,
		user 	 = observer,
		voxel 	 = null,
		toRemove = null,
		items 	 = [],
		entities = [],
		c 		 = 0,
		p 		 = 0

	if ( message.command == "update" ) {
		// user.prevPos = [user.position[0], user.position[1], user.position[2]];
		user.position = data.position
		user.velocity = data.velocity
		user.vrHeight = data.vrHeight
		//scWorker.postMessage(JSON.stringify(scWorker.observer));
	} else if ( message.command == "add voxels" ) {
		scWorker.addVoxels( message, data )
	} else if ( message.command == "remove voxels" ) {
		scWorker.removeVoxels( message, data )
	} else if ( message.command == "add entity" ) {
		scWorker.addEntity()
  	} else if ( message.command == "remove entity" ) {
    	scWorker.removeEntity( message, data )
	} else if ( message.command == "update entity" || message.command == "update telemetry" ) {
		if ( message.command == "update entity" ) {
			scWorker.updateEntity( message, data )
		} else {
			scWorker.updateTelemetry( message, data )
		}
	} else if ( message.command == "clear" ) {
		voxels = []
		voxelList = []
	} else if ( message.command == "start" ) {
		scWorker.update()
	} else if ( message.command == "stop" ) {
		scWorker.stop()
	} else if ( message.command == "log" ) {
		if (data == "") {
			scWorker.postMessage('{"command":"log","data":[' + user.position[0] + ',' + user.position[1] + ',' + user.position[2] + ']}');
			scWorker.postMessage('{"command":"log","data":' + JSON.stringify(voxels)+ '}');
		}
	}
};

scWorker.addVoxels = (message: any, data: any) => {
	voxelList = voxelList.concat(data)
	for (let v of data) {
		voxels[ v.cell.join(".") ] = v
	}
}

scWorker.removeVoxels = (message: any, data: any) => {
	let toRemove = null,
		voxel = null,
		c 		 = 0,
		p 		 = data.length -1

	while ( p >= 0 ) {
		toRemove = data[p]
		c = voxelList.length-1

		while ( c >= 0 ) {
			voxel = voxelList[ c ]
			if ( voxel != null && voxel.cell[0] == toRemove.cell[0] && voxel.cell[1] == toRemove.cell[1]
																	&& voxel.cell[2] == toRemove.cell[2] ) {
				voxelList.splice( c, 1 )
				voxels[ voxel.cell.join(".")] = null
			}
			c--
		}
		p --
	}
}

scWorker.addEntity = (message: any, data: any) => {
	if (!data) {
		console.warn("no data for addEntity")
		return
	}
	if (!!! voxels[data.coords.join(".")]) {
		voxels[data.coords.join(".")] = { entities: [], cell: data.coords }
	}
	let entities = voxels[data.coords.join(".")].entities;

	entities.push( data.entity )
}

scWorker.removeEntity = ( message: any, data: any ) => {
	let entities = voxels[ data.coords.join(".") ].entities;

	if ( entities != null ) {
		let c = entities.length-1;

		while ( c >= 0 ) {
			if ( entities[c].id == data.entityId ) {
				voxels[ data.coords.join(".") ].entities.splice(c, 1)
				c = -1
			}
			c--
		}
	}
}

scWorker.updateEntity = (message: any, data: any) => {
	let cell =  data.coords.join(".");

	if (!data || !data.coords) {
		console.warn("no data to update entity")
		return
	}
	if ( !voxels[cell] ) {
		console.warn("can't update entity with no voxel")
		return
	}
	let entities = voxels[ cell ].entities

	if ( entities != null ) {
		let c = entities.length-1;

		while ( c >= 0 ) {
			if (entities[ c ].id == data.entityId) {
				entities[ c ] = data.entity
				c = -1
			}
			c--
		}
	}
}

scWorker.updateTelemetry = (message: any, data: any) => {
	
	console.warn("physics worker: updateTelemetry()", message, data)
	if (!data || !data.coords) {
		console.warn("no data to update entity")
		return
	}
	let cell =  data.coords.join(".");

	if ( !voxels[cell] ) {
		console.warn("can't update entity with no voxel")
		return
	}
	let entities = voxels[ cell ].entities,
		oldCell = message.data.oldCoords.join("."),
		oldEntities = voxels[oldCell];

	if (oldCell != cell) {
		let c = oldEntities.length - 1;

		while (c >= 0) {
			let movedEnt = oldEntities[c]
			if (movedEnt.id == data.entityId) {
				oldEntities.splice(oldEntities.indexOf(movedEnt), 1)
				entities.push(movedEnt)
				console.log("physics worker: update telemetry: moved between voxels")
				movedEnt.position = data.position
				if (data.quaternion) {
					movedEnt.quaternion = data.quaternion;
				}
				c = -1
			}
		}

	} else {
		if (entities != null) {
			let c = entities.length - 1;
			
			while (c >= 0) {
				if (entities[c].id == data.entityId) {
					console.info("physics worker: update telemetry")
					entities[c].position = data.position
					if (data.quaternion) {
						entities[c].quaternion = data.quaternion;
					}
					c = -1
				}
				c--
			}
		}
	}
}

scWorker.stop = () => {
	clearTimeout( scWorker.updateLoop )
}
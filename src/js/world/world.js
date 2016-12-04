import Avatar from './avatar.js';
import Platform from './platform.js';
import WorldPhysics  from '../workers/world-physics.js';
import io from 'socket.io-client'
//import {on,send,sendReceive} from '../network/socket'

export default class World {
	constructor(userInput = false, socket) {

		var scene = new THREE.Scene(),
			camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1000, 4500000 ),
			renderer = new THREE.WebGLRenderer({antialias: true}),
			mobile = (window.innerWidth <= 640),
			self = this,
			coreGeom = new THREE.CylinderGeometry(8096, 8096, 1024, 9),
			material = new THREE.MeshPhongMaterial( {color: 0xffffff} ),
			core = new THREE.Mesh(coreGeom, material),
			skyLight =  new THREE.PointLight(0x6000ff, 0.5, 3000000),
			skyShaderMat = null,
			three = {},
			x = 0,
			y = 0,
			r = 4000;

		this.socket = socket;
		this.mode = "vr";
		this.users = [];
		this.user = {
			id: 0,
			username: "user"+Math.floor(1000000*Math.random()),
			toolbox: null,
			arms: [],
			gravity: 1,
			velocity: new THREE.Vector3(),
			falling: false
		}
		this.camera = camera;
		this.mobile = mobile;
		this.userInput = userInput;
		this.sendUpdatePacket = 0;
		this.capturing = false;
		this.webcamImage = "";
		this.platforms = [];
		this.pMap = []; // map of coord strings to platforms
		this.lastChunkCoords = [0, 0, 0];
		this.chunkCoords = [0, 0, 0];
		this.cleanUpPlatforms = [];
		this.HMDMode = "non standard"; // "head-movement"

		this.ambientLight = new THREE.AmbientLight(0x090037);
		scene.add(this.ambientLight);
		renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild( renderer.domElement );
		renderer.domElement.setAttribute("id", "viewport");
		renderer.setClearColor(0x3b3b3b);
		camera.position.set(85000, 5916.124890438994, 155000);

		skyShaderMat = new THREE.ShaderMaterial( {
			side: 1,
			fog: false,
			uniforms: {
				time: { type: "f", value: 1.0 }
			},
			vertexShader: document.getElementById('sky-vertex').textContent,
			fragmentShader: document.getElementById('sky-fragment').textContent

		} );

		this.ground = new THREE.Object3D();
		this.ground.rotation.x = -Math.PI /2;
		this.skybox = new THREE.Mesh(new THREE.OctahedronGeometry(4400000, 4), skyShaderMat);
		this.skybox.add(skyLight);
		skyLight.position.set(0, 300000, 300000);
		scene.add(core);
		core.position.set(0, 2000, 0);
		scene.add(this.skybox);
		this.skybox.position.set(camera.position.x, 0, camera.position.z);
		userInput.init(this, camera, this.user);
		this.worldPhysics = new WorldPhysics();
		this.worldPhysics.init(self);

		this.workers = {
			physics: this.worldPhysics
			// npc: this.npcLogic.worker
		}

		three = this.three = {
			world: this,
			skyMat: skyShaderMat,
			core: core,
			scene: scene,
			chunks: [],
			camera: camera,
			renderer: renderer
		};
		window.three = this.three;
		console.log("window.three");
		console.log(window.three);
		this.render(0);

		window.onresize = function () {
			if (three.world.mode != "stereo") {
				three.renderer.setSize(window.innerWidth, window.innerHeight);
			}
			three.camera.aspect = innerWidth / innerHeight;
			three.camera.updateProjectionMatrix();
		}

		this.bufferPlatforms(true, 0);

	}

	render (last) {
		var core = this.three.core,
			mobile = this.mobile,
			camera = three.camera,
			cPos = camera.position,
			delta = ((Date.now() - last) / 10000.0),
			time = (Date.now() / 4600),
			image = "",
			imageSize = [0, 0],
			beforeHMD = [0, 0, 0],
			beforeInput = [0, 0, 0],
			userArms = this.user.arms,
			arms = [];

		if (!! this.userInput) {
			this.userInput.update(delta);
			// Update VR headset position and apply to camera.
			if(!! three.vrControls) {
				beforeHMD = [camera.position.x, camera.position.y, camera.position.z];
				three.vrControls.update();
				camera.position.multiplyScalar(12000);

			}

			if (this.mode == "stereo") {
				if (this.HMDMode == "standard") {
					camera.position.set(/*beforeHMD[0] + */ cPos.x / 2.0,
															/*beforeHMD[1] + */ cPos.y / 2.0,
															/*beforeHMD[2] + */ cPos.z / 2.0);
				} else {
					camera.position.set(beforeHMD[0] + cPos.x / 2.0,
															beforeHMD[1] + cPos.y / 2.0,
															beforeHMD[2] + cPos.z / 2.0);
				}

			}
		}
		this.user.light && this.user.light.position.set(cPos.x, cPos.y, cPos.z);
		if (this.sendUpdatePacket == 12) { // send image
			if (this.capturing) {
				var v = document.getElementById('webcam'),
				 	canvas = document.getElementById('webcam-canvas'),
				 	context = canvas.getContext('2d'),
				 	cw = Math.floor(v.videoWidth),
				 	ch = Math.floor(v.videoHeight),
					imageSize = [cw, ch];

				canvas.width = 320;
				canvas.height = 240;
				context.drawImage(v, 0, 0, 320, 240);
				this.webcamImage = canvas.toDataURL("image/jpg", 0.6);
			}
			this.sendUpdatePacket = 0;
		}
		this.skybox.material.uniforms.time.value += delta;
		this.sendUpdatePacket += 1;
		if (this.sendUpdatePacket %((2+(1*this.mode == "stereo"))*(mobile ? 2 : 1)) == 0) {

			if (this.userInput.leapMotion) {
				userArms.forEach(function (arm) {
					arms.push({pos: [arm.position.x, arm.position.y, arm.position.z],
						quat: [arm.quaternion.x, arm.quaternion.y, arm.quaternion.z, arm.quaternion.w] });
					});
				}

				this.socket.emit('update', {
					entity: {
						id: this.user.id,
						username: this.user.username,
						image: this.webcamImage,
						imageSize: imageSize,
						arms: arms,
						position: {x:camera.position.x, y:camera.position.y, z: camera.position.z},
						quaternion: {x: camera.quaternion.x, y: camera.quaternion.y, z: camera.quaternion.z, w:camera.quaternion.w}
					}
				});

					if (this.capturing) {
						this.webcamImage = "";
					}
				}

				core.rotation.y += 0.005;
				this.skybox.material.uniforms.time.value += delta;
				this.skybox.position.set(camera.position.x, camera.position.y, camera.position.z);
				this.ground.position.set(camera.position.x, camera.position.y - 2000, camera.position.z);
				if (this.mode == "vr" || this.mode == "desktop") {
					// render for desktop / mobile (without cardboard)
					this.three.renderer.render(three.scene, camera);
				} else if (this.mode == "stereo") {
					// Render the scene in stereo for HMD.
				 	!!three.vrEffect && three.vrEffect.render(three.scene, camera);
				}
				last = Date.now();
				requestAnimationFrame( () => { this.render(last) } )
		}

		toggleStereo (mode) {
			let renderer = three.renderer,
				camera = three.camera,
				controls = null,
				effect = null;

				if (mode == "stereo") {
					if (three.vrControls == null) {
						window.WebVRConfig = {
              MOUSE_KEYBOARD_CONTROLS_DISABLED: true
            };
						controls = new THREE.VRControls(camera);
						effect = new THREE.VREffect(renderer);
						let ratio = window.devicePixelRatio || 1;
						effect.setSize(window.innerWidth * ratio, window.innerHeight * ratio);
						three.vrEffect = effect;
						three.vrControls = controls;
						// Get the VRDisplay and save it for later.
						var vrDisplay = null;
						navigator.getVRDisplays().then(function(displays) {
						  if (displays.length > 0) {
						    vrDisplay = displays[0];
						  }
						});

						function onResize() {
							let ratio = window.devicePixelRatio || 1;
						  effect.setSize(window.innerWidth * ratio, window.innerHeight * ratio);
						}
						function onVRDisplayPresentChange() {
						  console.log('onVRDisplayPresentChange');
						  onResize();
						}
						// Resize the WebGL canvas when we resize and also when we change modes.
						window.addEventListener('resize', onResize);
						window.addEventListener('vrdisplaypresentchange', onVRDisplayPresentChange);

						setTimeout(()=> {
							if (vrDisplay) {
								vrDisplay.requestPresent([{source: renderer.domElement}]);
							} else {
								alert("Connect VR Display and then reload page.")
							}
						}, 1000)

						// document.querySelector('#viewport').addEventListener('click', function() {
						//   vrDisplay.requestPresent([{source: renderer.domElement}]);
						// });
						// document.querySelector('button#reset').addEventListener('click', function() {
						//   vrDisplay.resetPose();
						// });
					}
				}
				window.onresize();
		}

		generateFullLOD (coords) {
			let platform = this.pMap[coords];
			if (platform != null) {
				if (platform.structures != null) {
					platform.structures.forEach(structure =>{
							structure.generateFullLOD();
					})
				}
			}
		}

		makeVoxels (t) {
			let voxels = [],
				y = 11,
				x = 15;

			switch(t) {
				case 0:
					for (x = 8; x >= 0; x--) {
						if (Math.random() < 0.1) {
							voxels.push({
								cell: [
									x, 2+Math.floor(2*Math.sin(x/6.0)), x % 6
								]
							})
						}
					}
				break
				case 1:
					for (x = 15; x >= 0; x--) {
						for (y = 8; y >= 0; y--) {
							if (Math.random() < 0.2) {
								voxels.push({
									cell: [
										x, 2+Math.floor(Math.sin(x/12.0)*Math.cos(y/12.0)), y
									]
								})
							}
						}
					}
				break;
				case 2:
				for (x = 8; x >= 0; x--) {
					for (y = 11; y >= 0; y--) {
						if (Math.random() < 0.4) {
							voxels.push({
								cell: [
									x-y, 2+y%4, y+x
								]
							})
						}
					}
				}
				break;
				case 3:
				for (x = 15; x >= 0; x--) {
					for (y = 11; y >= 0; y--) {
						if (Math.random() < 0.75) {
							voxels.push({
								cell: [
									x, Math.floor(y+x/4.0), y
								]
							})
						}
					}
				}
				break;
				case 4:
				for (x = 15; x >= 0; x--) {
					for (y = 11; y >= 0; y--) {
						if (Math.random() < 0.25) {
							voxels.push({
								cell: [
									x, 2+Math.floor(2*Math.sin(x/3.5)+2*Math.cos(y/3.5)), y
								]
							})
						}
					}
				}
				break;
			}
			return voxels;
		}
		bufferPlatforms (force, phase) {
			let platforms = this.platforms,
				plat = null,
				physicalPlatforms = [],
				removePhysicsChunks = [],
				chunkPos = [],
				pCell = [0,0,0],
				pMap = this.pMap,
				position = three.camera.position,
				platform = null,
				physicalPlat = null,
				c = 0,
				coords = [Math.floor(position.x/232000), 0, Math.floor(position.z/201840)],
				lastCoords = this.lastChunkCoords,
				moveDir = [coords[0]-lastCoords[0], coords[2] - lastCoords[2]],
				viewDistance = (this.mobile ? 6 : 11),
				removeDistance = viewDistance + 2 + (window.innerWidth > 2100 ?  2 : 1),
				endCoords = [coords[0]+viewDistance, coords[2]+viewDistance],
				x = coords[0]-phase,
				y = coords[2]-phase;
				this.chunkCoords = coords;

			if (force || coords[0] != lastCoords[0] || coords[1] != lastCoords[1] || coords[2] != lastCoords[2]) {
				lastCoords = this.lastChunkCoords = [coords[0], coords[1], coords[2]];
				force = false; 	// remove old chunks
				for (c in platforms) {
						platform = platforms[c];
						pCell = platform.data.cell;
						if (!!!platform.cleanUp && (pCell[0] < coords[0] - removeDistance ||
																				pCell[0] > coords[0] + removeDistance ||
																				pCell[2] < coords[2] - removeDistance ||
																				pCell[2] > coords[2] + removeDistance)
							) { 	// park platforms for removal
								platform.cleanUp = true;
								this.cleanUpPlatforms.push({physics: {cell: [pCell[0], 0, pCell[2]]}, cell: pCell[0]+".0."+pCell[2]});
							}
					}
				}
					c = 0;
					let cleanUpPlats = this.cleanUpPlatforms;
					this.cleanUpPlatforms.forEach(function (plat, i) {
						if (c < 4) {
							if (!!plat) {
								physicalPlat = pMap[plat.cell];
								!! physicalPlat && !! physicalPlat.mesh && three.scene.remove(physicalPlat.mesh);
								removePhysicsChunks.push(plat.physics);
								platforms.splice(platforms.indexOf(physicalPlat), 1);
								delete pMap[plat.cell];
								cleanUpPlats.splice(i, 1);
							}
							c ++;
						}
					})
					c = 0;
					// load new platforms // at first just from client-side generation
					while (x <= endCoords[0]) {
						while (y <= endCoords[1]) {
							//console.log("checking", x, y);
							if (c < 2 && pMap[x+".0."+y] == null) { // only if its not already loaded
								c ++;
								if (Math.random() < 0.5 ) {
									let voxels = [],
											lightColor = false;

									if (Math.random() < 0.33) {
										if (Math.random() < 0.6) {
											lightColor = 0x00ff00;
										} else {
											if (Math.random() < 0.5) {
												lightColor = 0x6000ff;
											} else {
												if (Math.random() < 0.4) {
													lightColor = 0x00ff00;
												} else {
													lightColor = 0x0000ff;
												}
											}
										}
									}

									if (Math.random() < 0.16) {
										voxels = this.makeVoxels( Math.floor(Math.random() * 5) );
									}
									platform = new Platform({voxels: voxels, structures: Math.random() < 0.15 ? [
										{
											length: 1+Math.floor(Math.random()*3.0),
											width: 1+Math.floor(Math.random()*3.0),
											floors: 2+Math.floor(Math.random()*10.0),
											position: [-1.0, 0, -1.0],
											light: lightColor
										}
								] : undefined}, [x, 0, y]);
									three.scene.add(platform.mesh);
									physicalPlatforms.push(platform.data);
								} else {
									platform = { data: {
										 cell: [x, 0, y]
									}};
								}

								platforms.push(platform);
								pMap[x+".0."+y] = platform;
							}
							y += 1;
						}
						y = coords[2]-viewDistance;
						x += 1;
					}

				if (physicalPlatforms.length > 0) {
					this.worldPhysics.worker.postMessage(JSON.stringify({
				        command: "add platforms",
				        data: physicalPlatforms
				    }))
				}
				if (removePhysicsChunks.length > 0) {
					this.worldPhysics.worker.postMessage('{"command":"remove platforms","data":'+JSON.stringify(removePhysicsChunks)+'}');
				}

				lastCoords[0] = coords[0];
				lastCoords[1] = coords[1];
				lastCoords[2] = coords[2];
				phase ++;

				if (phase > viewDistance) {
					phase = 1;
				}
				setTimeout(() => { this.bufferPlatforms(force, phase); }, 32);
			}

			loadInterior (name) {

			}
			enterInterior (name) {

			}


	};

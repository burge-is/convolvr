import { send } from '../network/socket'

export let render = (world, last) => {
  var core = three.core,
      mobile = world.mobile,
      camera = three.camera,
      cPos = camera.position,
      delta = ((Date.now() - last) / 10000.0),
      time = (Date.now() / 4600),
      image = "",
      imageSize = [0, 0],
      beforeHMD = [0, 0, 0],
      beforeInput = [0, 0, 0],
      userArms = world.user.arms,
      arms = [];

  if (!! world.userInput) {
    world.userInput.update(delta);
    // Update VR headset position and apply to camera.
    if(!! three.vrControls) {
      beforeHMD = [camera.position.x, camera.position.y, camera.position.z];
      three.vrControls.update();
      camera.position.multiplyScalar(12000);
    }
    if (world.mode == "stereo") {
      if (world.HMDMode == "standard") {
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
  if (world.user && world.user.mesh) {
    world.user.mesh.position.set(cPos.x, cPos.y, cPos.z);
    world.user.mesh.quaternion.set(camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w);
  }
  if (world.sendUpdatePacket == 12) { // send image
    if (world.capturing) {
      var v = document.getElementById('webcam'),
          canvas = document.getElementById('webcam-canvas'),
          context = canvas.getContext('2d'),
          cw = Math.floor(v.videoWidth),
          ch = Math.floor(v.videoHeight),
          imageSize = [cw, ch];

      canvas.width = 320;
      canvas.height = 240;
      context.drawImage(v, 0, 0, 320, 240);
      world.webcamImage = canvas.toDataURL("image/jpg", 0.6);
    }
    world.sendUpdatePacket = 0;
  }

  world.sendUpdatePacket += 1;
  if (world.sendUpdatePacket %((2+(1*world.mode == "stereo"))*(mobile ? 2 : 1)) == 0) {

    if (world.userInput.leapMotion) {
      userArms.forEach(function (arm) {
        arms.push({pos: [arm.position.x, arm.position.y, arm.position.z],
          quat: [arm.quaternion.x, arm.quaternion.y, arm.quaternion.z, arm.quaternion.w] });
        });
      }

      send('update', {
        entity: {
          id: world.user.id,
          username: world.user.username,
          image: world.webcamImage,
          imageSize: imageSize,
          arms: arms,
          position: {x:camera.position.x, y:camera.position.y, z: camera.position.z},
          quaternion: {x: camera.quaternion.x, y: camera.quaternion.y, z: camera.quaternion.z, w:camera.quaternion.w}
        }
      });
      if (world.capturing) {
          world.webcamImage = "";
      }
    }

      world.skybox && world.skybox.material && ()=>{world.skybox.material.uniforms.time.value += delta }
      world.skybox && world.skybox.position.set(camera.position.x, camera.position.y, camera.position.z);
      world.skybox && world.ground.position.set(camera.position.x, camera.position.y - 2000, camera.position.z);
      if (world.mode == "vr" || world.mode == "desktop") { // render for desktop / mobile (without cardboard)
        three.renderer.render(three.scene, camera);
      } else if (world.mode == "stereo") { // Render the scene in stereo for HMD.
        !!three.vrEffect && three.vrEffect.render(three.scene, camera);
      }
      last = Date.now();
      requestAnimationFrame( () => { render(world, last) } )
  }

export let toggleStereo = (mode) => {
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
            //toggle vr here?
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
      three.world.user.hud.toggleVRHUD();
      window.onresize();
  }
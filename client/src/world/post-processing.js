export default class PostProcessing {

  constructor (renderer, scene, camera) {

    this.renderer = renderer
    this.scene = scene
    this.camera = camera
    this.enabled = false
    this.stereoCamera = null;
    this.effectFXAA = null;
    this.effectCopy = null;
    this.effectBloom = null;
    this.composer = null;
    this.renderPass = null;
    this.width = window.innerWidth * (window.devicePixelRatio || 1)
    this.height = window.innerHeight * (window.devicePixelRatio || 1)
    let self = this
    window.addEventListener('resize', function() { self.onResize() }, true);

  }

  init () {

    this.enabled = true
    this.renderer.autoClear= false
    this.effectCopy = new THREE.ShaderPass(THREE.CopyShader)
    this.effectCopy.renderToScreen = true
    this.effectBloom = new THREE.BloomPass(0.95)
    let useAA = localStorage.getItem("aa")
    this.renderPass = new THREE.RenderPass(this.scene, this.camera)
    this.composer = new THREE.EffectComposer(this.renderer)
    this.composer.addPass(this.renderPass)

    if (useAA != null && useAA == 'on' ) {

      this.effectFXAA = new THREE.ShaderPass(THREE.FXAAShader)
      this.effectFXAA.uniforms.resolution.value = new THREE.Vector2(1 / this.width, 1 / this.height)
      this.composer.addPass(this.effectFXAA)
      this.useAA = true

    } else {

      this.useAA = false

    }

    this.composer.addPass(this.effectBloom)
    this.composer.addPass(this.effectCopy)

  }

  onResize (width, height) {
    if (this.enabled) {
      this.width = !!width ? width : window.innerWidth * (window.devicePixelRatio || 1)
      this.height = !!height ? height : window.innerHeight * (window.devicePixelRatio || 1)
      if (this.useAA) {
        this.effectFXAA.uniforms.resolution.value = new THREE.Vector2(1 / this.width, 1 / this.height)
      }
      this.composer.setSize(this.width, this.height)
      this.composer.reset()
    }

  }
  
}

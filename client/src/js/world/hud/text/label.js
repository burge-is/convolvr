import Text from './text'

export default class Label extends Text {
    constructor (data, mount) {
        this.mount = mount
        this.mesh = null
        this.color = data.color || 0xffffff
        this.lightColor = data.lightColor || 0xffffff
        this.text = typeof data == 'string' ? data : (data.text || "Text")
        this.position = data.position || [0, 0, 0]
    }

    initMesh () {
      let mesh = null,
          color = this.color,
          pos = this.position,
          light =  this.lightColor ? new THREE.PointLight(this.lightColor, 1.0, 200) : false,
          geom = new THREE.BoxGeometry(3200, 800, 80),
          mat = this.renderText(this.text, color, "#000000")
      if (this.mesh == null) {
        mesh = new THREE.Mesh(geom, mat)
        if (light) {
          mesh.add(light)
          light.position.set(0, 100, -100)
        }
        this.mesh = mesh
        this.mount.add(mesh)
      } else {
        this.mesh.material = mat
        this.mesh.material.needsUpdate = true
      }
      this.mesh.position.set(pos[0], pos[1], pos[2])
    }

    update (data) {
      this.text = data.text
      this.color = data.color
      this.lightColor = data.lightColor
      this.initMesh()
    }

    onActivate () {

    }
}

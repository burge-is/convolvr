import Component from '../components/component.js';

export default class Entity {
  constructor (id, components, aspects = [], position, quaternion, z) {
      this.id = id
      this.components = components
      this.aspects = aspects
      this.position = position ? position : false
      this.quaternion = quaternion ? quaternion : false
      this.z = z //translate from
      this.mesh = null
  }

  init (scene) {
    var mesh = new THREE.Object3D(),
        base = new THREE.Geometry(),
        mobile = three.world.mobile,
        aspects = this.aspects,
        ncomps = this.components.length,
        nonStructural = [],
        compMesh = null,
        materials = [],
        addToOctree = true,
        comp = null,
        face = 0,
        faces = null,
        c = 0,
        s = 0

    while (c < ncomps) {
        comp = new Component(this.components[c], {mobile}) // use simpler shading for mobile gpus
        compMesh = comp.mesh
        if (comp.type == 'structure') {
          materials.push(compMesh.material)
          compMesh.updateMatrix()
          faces = compMesh.geometry.faces
          face = faces.length-1
          while (face > -1) {
              faces[face].materialIndex = s
              face --
          }
          base.merge(compMesh.geometry, compMesh.matrix)
          s ++
        } else {
          nonStructural.push(comp.mesh)
        }
        c ++
    }
    if (s > 0) {
      mesh = new THREE.Mesh(base, new THREE.MultiMaterial(materials))
    } else {
      mesh = staticComps[0]
      s = 1
      while (s < staticComps.length) {
        mesh.add(staticComps[s])
      }
    }
    if (!! this.quaternion) {
        mesh.quaternion.set(this.quaternion[0], this.quaternion[1], this.quaternion[2], this.quaternion[3])
    }
    if (!! this.position) {
        mesh.position.set(this.position[0], this.position[1], this.position[2])
    }
    if (!!aspects) {
        c = 0;
        while (c < aspects.length) {
            // connect entity to appropriate system
            if (aspects[c] == "no-raycast") {
              addToOctree = false
            }
            c ++
        }
    }
    mesh.userData = { entity: this }
    if (addToOctree) {
      three.world.octree.add(mesh)
    }
    scene.add(mesh)
    this.z != 0 && mesh.translateZ(this.z)
    this.mesh = mesh

    return this
  }

}

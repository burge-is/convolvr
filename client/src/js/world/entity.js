import Component from './component.js';

export default class Entity {
  constructor (id, components, aspects = [], position, quaternion) {
      this.id = id;
      this.components = components;
      this.position = position ? position : false;
      this.quaternion = quaternion ? quaternion : false;
      this.mesh = null;
  }

  init (scene) {
    var mesh = new THREE.Object3D(),
        aspects = this.aspects,
        ncomps = this.components.length,
        comp = null,
        c = 0;

    while (c < ncomps) {
        comp = new Component(this.components[c]);
        mesh.add(comp.mesh);
        c ++;
    }
    if (!! this.quaternion) {
        mesh.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    }
    if (!! this.position) {
        mesh.position.set(position.x, position.y, position.z);
    }
    scene.add(mesh);
    this.mesh = mesh;
    if (!!aspects) {
        c = 0;
        while (c < aspects.length) {
            // connect entity to appropriate system
        }
    }
  }

}
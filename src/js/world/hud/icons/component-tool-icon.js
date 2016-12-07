import Icon from './icon'

export default class ComponentToolIcon extends Icon {
    constructor (data) {
        this.mesh = null;
        this.name = "Component Tool";

    }

    initMesh (data = {}) {
      let mesh = null,
          color = data.color || 0x404040,
          light = data.lightColor ? new THREE.PointLight(data.lightColor, 1.0, 200) : false,
          geom = new THREE.CylinderGeometry(132, 132, 132, 6, 1),
          geomB = new THREE.BoxGeometry(20, 20, 20),
          mat = new THREE.MeshPhongMaterial({color: color, fog: false});

      mesh = this.initButtonMesh();
      mesh.add(new THREE.Mesh(geom, mat));
      if (light) {
        mesh.add(light);
        light.position.set(0, 100, -100);
      }
      this.mesh = mesh;
      return mesh;
    }

    onActivate () {

    }
}

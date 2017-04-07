import Entity from '../../entities/entity'

let physics = null;

export default class Chunk {
    constructor (data, cell) {
        let x = 8,
            voxel = null,
            structure = null,
            track = null,
            items = [],
            altitude = 0,
            gridSize = 264000 / 16,
            narrow = gridSize * 0.87,
            mesh = null,
            bsp = null,
			      cellMesh = null,
            finalGeom = new THREE.Geometry(),
            base = new THREE.Geometry(),
            smooth = (data != null && data.smooth != null) ? data.smooth : false,
            visible = data.visible,
            geom = new THREE.CylinderGeometry( 532000, 532000, 835664, 6, 1),
            voxelGeom = null,
            world = three.world,
            map = world.textures.grid, // make this configurable
            lowQuality = world.mobile || world.lighting == 'low',
            mat = lowQuality ?
              new THREE.MeshLambertMaterial( {color: data.color, shininess: 20, map: map} )
            : new THREE.MeshPhongMaterial( {color: data.color, shininess: 20, map: map} ),
            modifier = smooth ? new THREE.BufferSubdivisionModifier( 3 ) : null

        this.structures = []
        this.entities = []
        physics = world.systems.worldPhysics.worker
        if (data == null) {
            data = { }
        }
        if (!!data.voxels && data.voxels.length > 0) { // terrain (sub)voxels
            voxelGeom = new THREE.CylinderGeometry( 264000 / 16, 264000 / 16, 264000 / 8.5, 6, 1);
            items = data.voxels;
            cellMesh = new THREE.Mesh(geom, mat)
            if (visible != null && visible === false) {
              cellMesh.scale.set(0.01, 0.01, 0.01)
            }
            cellMesh.updateMatrix()
            base.merge(cellMesh.geometry, cellMesh.matrix);

            x = items.length - 1;
            while (x >= 0 ) {
                voxel = items[x]
                cellMesh = new THREE.Mesh(voxelGeom, mat);
               cellMesh.position.set((voxel.cell[0] * gridSize) + (voxel.cell[2] % 2==0 ? 0 : gridSize / 2),
                                      voxel.cell[1] * gridSize,    voxel.cell[2] * gridSize)
               cellMesh.updateMatrix();
               base.merge(cellMesh.geometry, cellMesh.matrix)
               x --
            }
            mesh = new THREE.Mesh(base, mat)
        } else {
          if (smooth) {
            geom = modifier.modify( geom )
          }
          mesh = new THREE.Mesh(geom, mat)
          if (visible == false) {
            mesh.visible = false
          }
        }
        this.mesh = mesh
        if (!!data.entities) {
          data.entities.map(e => {
            let entity = new Entity(e.id, e.components, e.position, e.quaternion)
            this.entities.push(entity)
            entity.init(three.scene)
            // probably need to offset the position for the chunk..
          })
        }
        altitude = data.altitude || 0
        if (!! cell) {
            mesh.position.set((cell[0]*928000) + (cell[2] % 2 == 0 ? 0 : 928000 / 2),
                               altitude + (cell[1]*928000) - 528000,
                               cell[2]*807360);
            data.cell = cell;
            data.position = [
                mesh.position.x,
                mesh.position.y,
                mesh.position.z
            ]
        } else {
            data.position = [0, 0, 0];
        }

        if (data.size == null) {
            data.size = { x: 132000, y: 132000, z: 132000 }
        }
        this.data = data
        this.mesh = mesh
        // add to octree
        three.world.octree.add(mesh)
        three.scene.add(mesh)
    }
}

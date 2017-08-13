//@flow
import Convolvr from '../world/world'
import Component from '../component'
import Entity from '../entity'

export default class FactorySystem {

    world: Convolvr

    constructor ( world: Convolvr ) {

        this.world = world

    }
  
    init ( component: Component ) { //console.log("factory component init ", component) 
        
        let prop = component.props.factory
        
        if ( prop.autoGenerate !== false ) {
            
            setTimeout(()=>{

                this.generate( component )

            }, 1000)

        }

        return {

            generate: () => {

                this.generate( component )

            }

        }

    }

    generate ( component: Component ) {

        let prop = component.props.factory,
            position = component.entity.mesh.position,
            voxel: Array<number> = component.entity.voxel,
            entityPos: Array<number> = !!prop.anchorOutput ? [0, 0, 0] : position.toArray(),
            miniature = !!prop.miniature,
            type = prop.type,
            preset = prop.preset,
            propName = prop.propName,
            data = prop.data,
            quat: Array<number> = data.quaternion,
            components = data.components,
            created = null
            
        if ( type == 'entity' ) {
 
            created = this._generateEntity( components, voxel, entityPos, quat, preset )

        } else if (type == 'component') {

            created = this._generateComponent( data, voxel, entityPos, quat, preset )

        } else if ( type == 'prop' ) {

            switch (propName) {

                case "geometry":
                    created = this._generateGeometry( data, voxel, entityPos, quat )
                break
                case "material":
                    created = this._generateMaterial( data, voxel, entityPos, quat )
                break
                case "assets":
                    created = this._generateAsset( data, voxel, entityPos, quat )
                break
                case "systems":
                    created = this._generateSystem( data, voxel, entityPos, quat )
                break

            }

        } else if ( type == "world" ) {

            created = this._generateWorld( data, voxel, entityPos, quat )

        } else if ( type == "place" ) {

            created = this._generatePlace( data, voxel, entityPos, quat )

        } else if ( type == "file" ) {

            created = this._generateFile( data, voxel, entityPos, quat )

        } else if ( type == "directory" ) {

            created = this._generateDirectory( data, voxel, entityPos, quat )

        }

        if ( created != null && created.mesh != null ) {

            if ( !!prop.anchorOutput ) {

                created.init(component.mesh)

            } else {

                created.init(window.three.scene)

            }

            created.mesh.translateZ(-10000)
            created.update(created.mesh.position.toArray())

        } else {

            console.error( "error generating entity", created, prop )

        }

    }

    _generateEntity ( components: Array<Component>, voxel: Array<number>, position: Array<number>, quaternion: Array<number>, preset: string ) { 

        if ( !! components && components.length > 0 ) { // debugging this..
            
            components[0].props.miniature = { }
            components[0].props.toolUI = {
                configureTool: {
                    tool: 0,
                    preset
                }
            }
        
        }

        return  new Entity( -1, components, position, quaternion )

    }

    _generateComponent ( data: Object, voxel: Array<number>, position: Array<number>, quaternion: Array<number>, preset: string ) {

        data.props.miniature = { }
        data.props.toolUI = {
            configureTool: {
                tool: 1,
                preset
            }
        }
        return new Entity( -1, [ data ], position, quaternion )
    }

    _generateGeometry ( data: Object, voxel: Array<number>, position: Array<number>, quaternion: Array<number> ) {

        return new Entity(-1, voxel, [{ 
                props: Object.assign({}, {geometry: data}, {
                    mixin: true,
                    miniature: {},
                    material: {
                        name: "wireframe",
                        color: 0xffffff
                    },
                    toolUI: {
                        configureTool: {
                            tool: 3,
                            preset: data.shape
                        }
                    }
                }
            )}
        ], position, quaternion)

    }

    _generateSystem ( data: Object, voxel: Array<number>, position: Array<number>, quaternion: Array<number> ) {

        return new Entity(-1, voxel, [{
            props: Object.assign({}, data, {
                    mixin: true,
                    material: {
                        name: "wireframe",
                        color: 0xffffff
                    },
                    geometry: {
                        shape: "sphere",
                        size: [4500, 4500, 4500]
                    },
                    toolUI: {
                        configureTool: {
                            tool: 2,
                            data
                        }
                    }
                }
            )}
        ], position, quaternion)

    }

    _generateMaterial ( data: Object, voxel: Array<number>, position: Array<number>, quaternion: Array<number> ) {

        return new Entity(-1, voxel, [{
                props: Object.assign({}, {material: data}, {
                    mixin: true,
                    geometry: {
                        shape: "sphere",
                        size: [4500, 4500, 4500]
                    },
                    toolUI: {
                        configureTool: {
                            tool: 4,
                            data
                        }
                    }
                }
            )}
        ], position, quaternion)

    }

    _generateAsset ( data: Object, voxel: Array<number>, position: Array<number>, quaternion: Array<number> ) {

        return new Entity(-1, voxel, [{
                props: Object.assign({}, {material: data}, {
                    mixin: true,
                    assets: {
                        images: [data] 
                    },
                    material: {
                        name: "wireframe",
                        color: 0xffffff,
                        map: data
                    },
                    geometry: {
                        shape: "sphere",
                        size: [4500, 4500, 4500]
                    }
                }
            )}
        ], position, quaternion)

    }

    _generateWorld ( data: Object, voxel: Array<number>, position: Array<number>, quaternion: Array<number> ) {

        return new Entity(-1, voxel, [{
            props: Object.assign({}, data, {
                    mixin: true,
                    portal: {
                        username: data.username,
                        world: data.name
                    }, 
                    material: {
                        name: "metal",
                        color: 0x00ffff // get actual world color here..
                    },
                    geometry: {
                        shape: "sphere",
                        size: [4500, 4500, 4500]
                    }
                }
            )}
        ], position, quaternion)

    }

    _generatePlace ( data: Object, voxel: Array<number>, position: Array<number>, quaternion: Array<number> ) {

         return new Entity(-1, voxel, [{
            props: Object.assign({}, data, {
                    mixin: true,
                    portal: {
                        username: data.username,
                        world: data.world,
                        place: data.name
                    }, 
                    material: {
                        name: "metal",
                        color: 0xff8000 
                    },
                    geometry: {
                        shape: "sphere",
                        size: [4500, 4500, 4500]
                    }
                }
            )}
        ], position, quaternion)

    }

    _generateFile ( data: Object, voxel: Array<number>, position: Array<number>, quaternion: Array<number> ) {

        return new Entity(-1, voxel, [{
            props: Object.assign({}, data, {
                    mixin: true,
                    text: {
                        color: 0xffffff,
                        background: 0x000000,
                        lines: [
                            data
                        ]
                    },
                    file: {
                        filename: data
                        // implement
                    },
                    material: {
                        name: "metal",
                        color: 0x0080ff 
                    },
                    geometry: {
                        shape: "sphere",
                        size: [4500, 4500, 4500]
                    }
                }
            )}
        ], position, quaternion)

    }

    _generateDirectory ( data: Object, voxel: Array<number>, position: Array<number>, quaternion: Array<number> ) {

        return new Entity(-1, voxel, [{
            props: Object.assign({}, data, {
                    mixin: true,
                    text: {
                        color: 0xffffff,
                        background: 0x000000,
                        lines: [
                            data
                        ]
                    },
                    file: {
                        workingDir: data
                        // implement
                    },
                    material: {
                        name: "wireframe",
                        color: 0x000000 
                    },
                    geometry: {
                        shape: "sphere",
                        size: [4500, 4500, 4500]
                    }
                }
            )}
        ], position, quaternion)

    }

}


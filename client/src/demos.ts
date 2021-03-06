import Convolvr from "./world/world";
import Entity from "./model/entity";

export default function initDemos(world: Convolvr, coords: number[], pos: any, altitude: number) {
    let scene = world.three.scene,
        systems = world.systems;

    function _initVideoChat ( world: Convolvr, helpScreen: Entity, voxel: number[] ) {
        let videoChat = world.systems.assets.makeEntity( "video-chat", true, {}, voxel )as Entity // simple example of displaying GET response from server
        // videoChat.components[0].attrs.particles = {}
        videoChat.init( helpScreen.mesh ) // anchor to other entity (instead of scene) upon init
        videoChat.update( [ -8, 0, 0 ] )
    }
  
    function _initHTTPClientTest ( world: Convolvr, helpScreen: Entity, voxel: number[] ) {
        let httpClient = world.systems.assets.makeEntity( "help-screen", true, {}, voxel ) as Entity, // simple example of displaying GET response from server
            attributes = httpClient.components[0].attrs
    
        attributes.rest = {
        get: {
            url: "/api/voxels/"+world.name+"/0x0x0,-1x0x0"
        }
        }
        attributes.text.lines = ["/api/voxels/overworld/0x0x0,-1x0x0"] // really just clearing the default text until something loads
        attributes.text.color = "#f0f0f0"
        httpClient.init( helpScreen.mesh ) // anchor to other entity (instead of scene) upon init
        httpClient.update( [ -12, 0, 0 ] )
    }
  
    function _initFileSystemTest ( world: Convolvr, helpScreen: Entity, voxel: number[] ) {
        let fileBrowser = world.systems.assets.makeEntity( "file-browser", true, {}, voxel ) as Entity // show public files in 3d
    
        fileBrowser.init( helpScreen.mesh ) // anchor to other entity (instead of scene) upon init
        fileBrowser.update( [ -16, 0, 0 ] )
    }

    let chatScreen = systems.assets.makeEntity( "chat-screen", true, {}, coords ) as Entity; //; chatScreen.components[0].attrs.speech = {}
    chatScreen.init( scene );
    chatScreen.update( [ pos.x, altitude + 21, pos.z+10] );  
    (world as any).chat = chatScreen
    let helpScreen = systems.assets.makeEntity( "help-screen", true, {}, coords ) as Entity;
  
    helpScreen.init(scene, {}, (help: Entity) => { 
      _initHTTPClientTest( world, help, coords ); 
    //  _initFileSystemTest( world, help, coords ); 
    //   _initVideoChat( world, help, coords ); 
    })
  
    helpScreen.update( [ pos.x+4, altitude + 21, pos.z+10 ] );
    world.help = helpScreen;
}

export const DemoProgram = [
    "let colors = [' ', '`', '.', ',', '-', '+', 'x', '=', 'L', 'X', 'H', '$', '#', '@']",
    "let size = [58,14]",
    "for (y, size[1]) {" +
    "    let s = '-'" +
    "    let idx = 0" +
    "    for (x, size[0]-1) {" + 
    "        if ((x/2+y/2) % 10 <5) {" +
    "            idx = (x/1+y)%4" +
    "        }",
    "        if ((x/2-y/2)% 10 <5) {" +
    "            idx = 2+(x*y)%8" +
    "        }",
    "        s = s + colors[idx];" + 
    "    }" +
    "    print(s)" + 
    "}"
]
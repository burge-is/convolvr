import * as React from "react"; import { Component } from "react";
import { withRouter } from 'react-router-dom'
import { Route, Switch} from 'react-router'
import { events } from '../../network/socket'
import Shell from '../components/shell'
import SideMenu from '../components/side-menu'
import { Button } from 'energetic-ui'
import Data from '../../2d-ui/containers/data'
import Spaces from '../../2d-ui/containers/worlds'
import Places from '../../2d-ui/containers/places'
import NewSpace from '../../2d-ui/containers/new-world'
import Settings from '../../2d-ui/containers/settings'
import Inventory from '../../2d-ui/containers/inventory'
import Network from '../../2d-ui/containers/network'
import Login from '../../2d-ui/containers/login'
import Chat from '../../2d-ui/containers/chat'
import Profile from '../../2d-ui/containers/profile'
import HUD from '../../2d-ui/containers/hud'
import { APP_ROOT} from '../../config'
import { 
  detectSpaceDetailsFromURL,
  APP_NAME
} from '../../config';
import * as THREE from 'three'; 

type AppContainerState = {
  unread: number,
  lastSender: string
}

type AppContainerProps = {
  children?: any,
  fetchSpaces: Function,
  getInventory: Function,
  getMessage: Function,
  getChatHistory: Function,
  fetchUniverseSettings: Function,
  toggleMenu: Function,
  setWindowFocus: Function,
  toggleVRMode: Function,
  login: Function,
  url: any,
  history: any,
  focus: boolean,
  stereoMode: boolean,
  loggedIn: boolean,
  world: string,
  username: string,
  menuOpen: boolean
}

class App extends Component<AppContainerProps, AppContainerState> {

  public state: AppContainerState = {
    unread: 0,
    lastSender: ''
  }

  public props: AppContainerProps
  public world: Convolvr

  componentWillMount () {

    this.props.fetchSpaces()
    this.props.getInventory(this.props.username, "Entities")
    this.props.getInventory(this.props.username, "Components")
    this.props.getInventory(this.props.username, "Properties")

    let world = (window as any).three.world;

    this.world = world;
    events.on("chat message", (message: any) => {
      let m = JSON.parse( message.data ),
          worldName = '',
          from = '';

      if (!!!m.space || m.space != this.props.world) {
        return
      }
    	this.props.getMessage(m.message, m.from, m.files, m.avatar, m.space)

      if (this.state.lastSender != m.from || (m.files != null && m.files.length > 0)) {
        from = `${m.from}: `
      }

      this.setState({
        lastSender: m.from
      })

      this.notify(m.message, m.from)
      worldName = this.props.world.toLowerCase() == "overworld" ? APP_NAME : this.props.world

      if ( this.props.focus == false ) {
        this.setState({
          unread: this.state.unread +1
        })

        if (this.state.unread > 0)
          document.title = `[${this.state.unread}] ${worldName}`

      } else {
        document.title = worldName
      }

      if ( !this.props.menuOpen ) {
        // TODO: implement show chat modal
        // world.chatModal.componentsByAttr.text[0].state.text. 
      }
    });

    this.props.fetchUniverseSettings();

    window.document.body.addEventListener("keydown", (e)=>this.handleKeyDown(e), true)

    let showMenuURLs = [ "chat", "login", "spaces", "files", "places", "inventory", "settings", "network", "new-world" ]
    showMenuURLs.map( (menuUrl) => {
      window.location.pathname.indexOf(`/${menuUrl}`) > -1 && this.props.toggleMenu(true)
    })

    world.rememberUserCallback = (username: string, password: string) => {
			  this.props.login(username, password, "", {});
    };
    // alert("set init chat callback")
    // world.initChatCallback = () => {
    //   alert("get chat history")
    //   this.props.getChatHistory(world.name, 0);
    // };
    world.onFocusCallback = () => {
      this.setState({
			  unread: 0
			});
    };
    world.clickCanvasCallback = () => {
      this.props.toggleMenu(false);
    };
    world.toggleVRButtonCallback = () => {
      this.props.toggleVRMode();
    }
  }

  componentWillReceiveProps ( nextProps: any) {
    let newSpace: any[] = ["world", "Convolvr"],
        userNameChanged = nextProps.username != this.props.username,
        pathChange =  nextProps.url.pathname != this.props.url.pathname; // nextProps.url.pathname.indexOf("/at") > -1 ? false :

    if ( pathChange ) {
      newSpace = detectSpaceDetailsFromURL()
     
      if (!nextProps.url.nativeAPI) {
        this.props.history.push(nextProps.url.pathname);
      }

    }

    if ( userNameChanged ) {
      this.props.getInventory(nextProps.username, "Entities")
      this.props.getInventory(nextProps.username, "Components")
      this.props.getInventory(nextProps.username, "Properties")
    }
  }

  componentWillUpdate ( nextProps: any, nextState: any ) {


  }

  handleKeyDown (e: any) {
    if (e.which == 27) {
      this.props.toggleMenu(true)
    }
    if (e.which == 13) {
      if (!this.props.menuOpen) {
        this.props.toggleMenu(true);
        this.props.history.push("/chat")
      }
    }
  }

  goBack () {
    let worldURL = detectSpaceDetailsFromURL()

    this.props.history.push(`/${worldURL[0]}/${worldURL[1]}`)
  }

  notify (chatMessage: string, from: string) {
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notification");
    } else if ((Notification as any).permission === "granted") {
      const notification = new Notification(`Message from ${from}`, {
        body: chatMessage
      } as NotificationOptions);
    } else if ((Notification as any ).permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          const notification = new Notification(`Message from ${from}`, {
            body: chatMessage
          }as NotificationOptions);
        }
      });
    }

  }
  
  renderVRButtons () {
    return this.props.stereoMode ?
        [<Button title="Exit VR"
                style={{
                  position: "fixed",
                  right: 0,
                  top: 0
                }}
                key='2'
                image="/data/images/x.png"
                onClick={ (evt: any, title: string) => {
                    this.props.toggleVRMode();
                } }
        />]
       : <Button title="Enter VR"
                  style={{
                      position: "fixed",
                      right:0,
                      bottom: 0,
                      zIndex: 9999,
                      background: 'none'
                  }}
                  image="/data/images/vr.png"
                  onClick={ (evt: any, title: string) => {
                    this.world.initiateVRMode()
                  }
                }
            />

  }

  render() {
    return (
        <div className="root">
         <Shell noBackground={true}
                hasMenu={true}
                menuOnly={true}
                menuOpen={this.props.menuOpen}></Shell>
         { this.renderVRButtons() }
         <Button title="Close Menu"
                 image="/data/images/x.png"
                 style={{
                     position: "fixed",
                     left:6,
                     bottom: 0,
                     zIndex: 9999999,
                     background: 'transparent',
                     display: !this.props.menuOpen ? "none" : "inline-block"
                 }}
                 onClick={ (evt: any, title: string) => {
                     this.props.toggleMenu(false)
                     this.goBack()
                     //this.props.history.push("/menu")
                 } }
                 key={2}
         />
        <Switch>
          <Route path={APP_ROOT + "/:userName/:worldName"} component={HUD} />
          <Route path={APP_ROOT + "/:userName/:worldName/at/:coords"} component={HUD} />
          <Route path={APP_ROOT + "/:userName/:worldName/:placeName"} component={HUD} />
          <Route path={APP_ROOT + "/login"} component={Login} />
          <Route path={APP_ROOT + "/chat"} component={Chat} />
          <Route path={APP_ROOT + "/files"} component={Data} />
          <Route path={APP_ROOT + "/files/:username"} component={Data} />
          <Route path={APP_ROOT + "/spaces"} component={Spaces} />
          <Route path={APP_ROOT + "/places"} component={Places} />
          <Route path={APP_ROOT + "/new-world"} component={NewSpace} />
          <Route path={APP_ROOT + "/settings"} component={Settings} />
          <Route path={APP_ROOT + "/inventory"} component={Inventory} />
          <Route path={APP_ROOT + "/network"} component={Network} />
          <Route path={APP_ROOT + "/profile"} component={Profile} />
        </Switch>
            <div className="lightbox" style={{display: "none"}}></div>
            <canvas id="webcam-canvas"></canvas>
            <video id='local-video' style={{display:'none'}}></video>
            <video id='remote-video' style={{display:'none'}}></video>
            <input type='button' value='Video Call' style={{display:'none'}} id='videoCallButton' />
            <input type='button' value='End Call' style={{display:'none'}} id='endCallButton' />
        </div>
    )
  }
}

import { connect } from 'react-redux'
import {
  toggleMenu,
  toggleVR,
  setWindowFocus,
  showChat
} from '../../2d-ui/redux/actions/app-actions'
import {
  fetchSpaces,
  setCurrentSpace,
  fetchUniverseSettings
} from '../../2d-ui/redux/actions/world-actions'
import {
  getChatHistory,
  getMessage
} from '../../2d-ui/redux/actions/message-actions'
import { 
  fetchUsers,
  login 
} from '../../2d-ui/redux/actions/user-actions'
import {
  getInventory
} from '../../2d-ui/redux/actions/inventory-actions'
import Convolvr from "../../world/world";
import sideMenu from "../components/side-menu";

export default connect(
  (state: any) => {
    return {
      loggedIn: state.users.loggedIn,
      username: state.users.loggedIn != false ? state.users.loggedIn.name : "public",
      url: state.app.navigateToUrl,//state.routing.locationBeforeTransitions,
      tools: state.tools,
      users: state.users,
      menuOpen: state.app.menuOpen,
      stereoMode: state.app.vrMode,
      focus: state.app.windowFocus,
      world: state.spaces.current,
      worldUser: state.spaces.worldUser
    }
  },
  (dispatch: any) => {
    return {
      fetchUniverseSettings: ()=> {
        dispatch(fetchUniverseSettings())
      },
      login: (user: string, pass: string, email: string, data: any) => {
            dispatch(login(user, pass, email, data))
      },
      getMessage: (message: string, from: string, files: any[], avatar: string, space: string) => {
          dispatch(getMessage(message, from, files, avatar, space))
      },
      getInventory: (userId: any, category: string) => {
        dispatch(getInventory(userId, category))
      },
      showChat: () => {
        dispatch(showChat())
      },
      getChatHistory: (spaceName: string, skip: number) => {
        dispatch(getChatHistory(spaceName, skip))
      },
      toggleMenu: (force: boolean) => {
          //window.three.world.mode = force ? "3d" : "web"
          dispatch(toggleMenu(force))
      },
      fetchSpaces: () => {
          dispatch(fetchSpaces())
      },
      setCurrentSpace: (username: string, world: string) => {
        dispatch(setCurrentSpace(username, world))
      },
      setWindowFocus: (t: any) => {
        dispatch(setWindowFocus(t))
      },
      toggleVRMode: () => {
          dispatch(toggleVR())
      }
    }
  }
)(withRouter(App as React.ComponentClass<any>) as React.ComponentClass<any>)

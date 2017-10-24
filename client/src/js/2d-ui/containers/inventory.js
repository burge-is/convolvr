import React, { Component } from 'react'
import Shell from '../components/shell'
import Card from '../components/card'
import LocationBar from '../components/location-bar'
import InventoryList from './inventory-list'
import {
  isMobile
} from '../../config'

class Inventory extends Component {

  componentWillMount () {

    this.props.getInventory(this.props.username, "Entities")
    this.props.getInventory(this.props.username, "Components")
    this.props.getInventory(this.props.username, "Properties")

    this.setState({
      
    })

  }

  componentWillReceiveProps ( nextProps ) {

    let userNameChanged = nextProps.username != this.props.username,
        finishedFetchingDirs = this.props.dirsFetching == true && nextProps.dirsFetching == false,
        finishedFetchingFiles = (this.props.filesFetching == true && nextProps.filesFetching == false)

  }

  componentWillUpdate (nextProps, nextState) {


  }

  onContextAction ( name, data, e ) {
    
        switch ( name ) {
    
          case "Add To World":
            this.props.launchImportToWorld( this.props.username, data )
          break;
          case "Edit":
            this.props.launchInventoryEditor( this.props.username, data.category, data.itemId )
          break;
          case "Export JSON":
            this.props.launchInventoryExport( this.props.username, data.category, data.itemId )
          break;
    
        }
    
      }

  render() {

    let files = this.props.files,
        dirs = this.props.dirs

    return (
        <Shell className="data-view" 
               style={ isMobile() ? { paddingTop: '60px' } : { paddingTop: '0px' } }
               innerStyle={ { paddingTop: isMobile() ? '72px' : 0, paddingLeft: isMobile() ? '10px' : '72px' }  }       
        >
          <InventoryList onContextAction={ (name, data, e) => this.onContextAction(name, data, e) }
                         options={ this.props.inventoryEntities }
                         username={ this.props.username }
                         style={{zIndex: 9999}}
                         category="Entities" 
          />
          <InventoryList onContextAction={ (name, data, e) => this.onContextAction(name, data, e) }
                         options={ this.props.inventoryComponents }
                         username={ this.props.username }
                         style={{zIndex: 99999}}
                         category="Components"   
          />
          <InventoryList onContextAction={ (name, data, e) => this.onContextAction(name, data, e) }
                         options={ this.props.inventoryProperties }
                         username={ this.props.username }
                         style={{zIndex: 999999}}
                         category="Properties" 
          />
        </Shell>
    )

  }

}

Inventory.defaultProps = {

}

import { connect } from 'react-redux';
import {
    sendMessage
} from '../../redux/actions/message-actions'
import {
  toggleMenu,
  showChat
} from '../../redux/actions/app-actions'
import {
  listFiles,
  listDirectories,
  changeDirectory,
  uploadFiles
} from '../../redux/actions/file-actions'
import {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  removeInventoryItem,
  addItemToWorld,
} from '../../redux/actions/inventory-actions'

export default connect(
  (state, ownProps) => {
    return {
        loggedIn: state.users.loggedIn,
        username: state.users.loggedIn != false ? state.users.loggedIn.name : "public",
        messages: state.messages.messages,
        stereoMode: state.app.stereoMode,
        menuOpen: state.app.menuOpen,
        chatOpen: state.app.chatOpen,
        vrMode: state.app.vrMode,
        inventoryEntities: state.inventory.items.entities,
        inventoryComponents: state.inventory.items.components,
        inventoryProperties: state.inventory.items.properties,
        files: state.files.list.data,
        dirs: state.files.listDirectories.data,
        filesFetching: state.files.list.fetching,
        dirsFetching: state.files.listDirectories.fetching,
        workingPath: state.files.listDirectories.workingPath,
        upload: state.files.uploadMultiple
    }
  },
  dispatch => {
    return {
      getInventory: (userId, category) => {
          dispatch(getInventory(userId, category))
      },
      addInventoryItem: (userId, category, data) => {
          dispatch(addInventoryItem(userId, category, data))
      },
      updateInventoryItem: (userId, category, data) => {
        dispatch(updateInventoryItem(userId, category, data))
      },
      removeInventoryItem: (userId, category, itemId) => {
        dispatch(removeInventoryItem(userId, category, itemId))
      },
      toggleMenu: (toggle) => {
        dispatch(toggleMenu(toggle))
      },
      uploadFile: (file, username, dir) => {
        dispatch(uploadFile(file, username, dir))
      }
    }
  }
)(Inventory)


let styles = {
  hr: {
    visibility: 'hidden'
  },

}
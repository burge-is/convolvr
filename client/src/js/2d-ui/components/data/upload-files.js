import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import FileButton from './file-button'

let styles = {
  button: {
    height: '32px',
    display: 'inline-block',
    marginLeft: '0.75em',
    background: 'rgba(255, 255, 255, 0.15)',
    textAlign: "center",
    borderRadius: '1.5px',
    boxShadow: '0 0.25em 0.5em 0px rgba(0, 0, 0, 0.3)'
  },
  modal: {
    width: '60%',
    maxWidth: '729px',
    minWidth: '320px',
    padding: '1em',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 'auto'
  }
}

class UploadFiles extends Component {

  constructor () {

    super()

  }

  componentWillMount () {

    this.setState({
      activated: false
    })
    
  }

  componentWillReceiveProps ( nextProps ) {

  }

  componentWillUpdate ( nextProps, nextState ) {

  }

  toggleModal () {

    this.setState({
      activated: !this.state.activated
    })

  }

  render() {

    if ( this.state.activated ) {

      return (
        <div style={ styles.modal } >

        </div>
      )

    } else {

      return (
        <FileButton title="Upload Files" onClick={ () => { this.toggleModal() } } />
      )

    }
    
  }
}

UploadFiles.defaultProps = {

}

import { connect } from 'react-redux'
import {
    toggleMenu
 } from '../../../redux/actions/app-actions'

export default connect(
  (state, ownProps) => {
    return {
        section: state.routing.locationBeforeTransitions.pathname,
        stereoMode: state.app.stereoMode,
        menuOpen: state.app.menuOpen,
        vrMode: state.app.vrMode
    }
  },
  dispatch => {
    return {
      toggleMenu: (force) => {
          dispatch(toggleMenu(force))
      }
    }
  }
)(UploadFiles)

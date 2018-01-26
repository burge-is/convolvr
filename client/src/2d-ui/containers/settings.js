import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import Shell from '../components/shell'
import { 
  textAreaStyle,
  basicInputStyle,
  lightboxStyle, 
  modalStyle 
} from '../styles'
import { isMobile } from '../../config'

class Settings extends Component {

  constructor () {

    super()

  }

  componentWillMount () {

    this.setState({
      defaultWorld: 'overworld',
      welcomeMessage: 'Welcome to Convolvr!',
      network: [],
      camera: localStorage.getItem("camera") || 'fps',
      lighting: localStorage.getItem("lighting") || 'high',
      postProcessing: localStorage.getItem("postProcessing") || 'off',
      vrMovement: localStorage.getItem("vrMovement") || 'stick',
      aa: localStorage.getItem("aa") || "on",
      shadows: parseInt(localStorage.getItem("shadows")) || window.innerWidth < 720 ? 0 : 1,
      geometry: parseInt(localStorage.getItem("geometry") || 2),
      floorHeight: parseInt(localStorage.getItem("floorHeight") || 1),
      IOTMode: localStorage.getItem("IOTMode") || 'off',
      leapMode: localStorage.getItem("leapMode") || "hybrid",
      blurEffect: localStorage.getItem("blurEffect") == "on" ? true : window.innerWidth > 720 ? true : false,
      viewDistance: localStorage.getItem("viewDistance") != null ? localStorage.getItem("viewDistance") : 0,
      fov: localStorage.getItem("fov") != null ? localStorage.getItem("fov") : 75,
      manualLensDistance: localStorage.getItem("manualLensDistance") != null ? localStorage.getItem("manualLensDistance") : 0
    })

    this.props.fetchUniverseSettings()
  
  }

  componentWillReceiveProps ( nextProps, nextState ) {
  
    if (this.props.fetchingSettings == true && nextProps.fetchingSettings == false && nextProps.settings != null) {
      console.log("Done Loading Universe Settings")
      this.setState({
        defaultWorld: nextProps.settings.defaultWorld,
        welcomeMessage: nextProps.settings.welcomeMessage,
        network: nextProps.settings.network || []
      })
    }
  
  }

  reload () {

    window.location.href = window.location.href
  
  }

  save () {

    localStorage.setItem( 'camera', this.state.camera )
    localStorage.setItem( 'lighting', this.state.lighting )
    localStorage.setItem( 'aa', this.state.aa)
    localStorage.setItem( 'geometry', this.state.geometry )
    localStorage.setItem( 'shadows', this.state.shadows )
    localStorage.setItem( 'postProcessing', this.state.postProcessing )
    localStorage.setItem( 'vrMovement', this.state.vrMovement ) 
    localStorage.setItem( 'IOTMode', this.state.IOTMode )
    localStorage.setItem( 'floorHeight', this.state.floorHeight )
    localStorage.setItem( 'leapMode', this.state.leapMode )
    localStorage.setItem( 'viewDistance', this.state.viewDistance )
    localStorage.setItem( 'blurEffect', this.state.blurEffect)
    localStorage.setItem( 'manualLensDistance', this.state.manualLensDistance )
    localStorage.setItem( 'fov', this.state.fov )
    this.reload()

  }

  updateUniverseSettings () {

    let data = {
      id: 1,
      defaultWorld: this.state.defaultWorld,
      welcomeMessage: this.state.welcomeMessage,
      network: this.state.network
    }
    this.props.updateUniverseSettings(data, this.props.user.password)

  }

  addServer() {

    let network = this.state.network
    network.push({domain: '', image: ''})
    this.setState({network})

  }

  removeServer( index ) {

    let network = this.state.network
    network.splice(index, 1)
    this.setState({network})

  }

  updateServer ( index, name, image = '' ) {

    let network = this.state.network
    network[index].name = name
    network[index].image = image
    this.setState({network})

  }

  resetToDefault () {

    window.localStorage.clear()
    window.location.href = window.location.href

  }

  render() {

    let isAdmin = this.props.user.name == 'admin'

    return (
        <Shell className="settings">
          <div style={styles.modal()}>
            <div>
              <h1>Settings</h1>
            </div>
            <div style={ { ...styles.even, ...styles.top } }>
            <h3 style={styles.h3}>View Distance</h3>
              <div style={styles.col}>
                <input onChange={e=> {this.setState({viewDistance: parseInt(e.target.value)})}}
                      style={styles.range}
                      defaultValue={this.state.viewDistance}
                      step={1}
                      type='range'
                      min='-4'
                      max='8'
                />
                <span style={styles.numericLabel}>
                  {(this.state.viewDistance >= 0 ?'+ ':'')+this.state.viewDistance} Voxels 
                </span>
              </div>
            </div>
            <div style={styles.odd}>
            <h3 style={styles.h3}>Field Of View</h3>
              <div style={styles.col}>
                <input onChange={e=> {this.setState({fov: parseInt(e.target.value)})}}
                      style={styles.range}
                      defaultValue={this.state.fov}
                      step={1}
                      type='range'
                      min='70'
                      max='110'
                />
                <span style={styles.numericLabel}>
                  {this.state.fov} degrees 
                </span>
              </div>
            </div>
            <div style={styles.even}>
              <h3 style={styles.h3}>Lighting Quality</h3>
              <div style={styles.col}>
                <select onChange={e=> {this.setState({lighting: e.target.value})}}
                        value={ this.state.lighting }
                        style={ styles.select }
                >
                  <option value="high">High (recommended)</option>
                  <option value="low">Low (mobile devices)</option>
                </select>
              </div>
            </div>
            <div style={styles.odd}>
              <h3 style={styles.h3}>Shadow Quality</h3>
              <div style={styles.col}>
                <select onChange={e=> {this.setState({shadows: parseInt(e.target.value)})}}
                        value={ this.state.shadows }
                        style={ styles.select }
                >
                  <option value="3">High</option>
                  <option value="2">Moderate</option>
                  <option value="1">Low</option>
                  <option value="0">Off</option>
                </select>
              </div>
            </div>
            <div style={styles.even}>
              <h3 style={styles.h3}>Geometry Detail</h3>
              <div style={styles.col}>
                <select onChange={e=> {this.setState({geometry: parseInt(e.target.value)})}}
                        value={ this.state.geometry }
                        style={ styles.select }
                >
                  <option value="3">Ultra</option>
                  <option value="2">High</option>
                  <option value="1">Moderate</option>
                  <option value="0">Low</option>
                </select>
              </div>
            </div>
          <div style={styles.odd}>
            <h3 style={styles.h3}>Antialiasing</h3>
            <div style={styles.col}>
              <select onChange={e=> {this.setState({aa: e.target.value})}}
                      value={ this.state.aa }
                      style={ styles.select }
              >
                <option value="on">On (recommended)</option>
                <option value="off">Off (for older GPUs)</option>
              </select>
            </div>
          </div>
          <div style={styles.even}>
            <h3 style={styles.h3}>Override Lens Spacing</h3>
            <div style={styles.col}>
              <input onChange={e=> {this.setState({manualLensDistance: parseFloat(e.target.value)})}}
                    style={styles.range}
                    defaultValue={this.state.manualLensDistance}
                    step='0.001'
                    type='range'
                    min='0.01'
                    max='0.1'
              />
              <span style={styles.numericLabel}>
                { this.state.manualLensDistance || "Using auto detection."}
              </span>
            </div>
          </div>
          <div style={styles.odd}>
            <h3 style={styles.h3}>Floor Height (VR)</h3>
            <div style={styles.col}>
              <input onChange={e=> {this.setState({floorHeight: parseInt(e.target.value)})}}
                   style={styles.range}
                   defaultValue={this.state.floorHeight}
                   step={0.1}
                   type='range'
                   min='-3'
                   max='3'
              />
              <span style={styles.numericLabel}>
                {this.state.floorHeight} Units
              </span>
            </div>
          </div>
          <div style={styles.even}>
            <h3 style={styles.h3}>Leap Motion Mode</h3>
            <div style={styles.col}>
              <select onChange={e=> {this.setState({leapMode: e.target.value})}}
                    value={ this.state.leapMode }
                    style={ styles.select }
              >
                  <option value="hybrid">Hybrid Mode</option>
                  <option value="movement">Movement & Look Only</option>
                  <option value="avatar">Control Both Hands</option>
              </select>
            </div>
          </div>
          <div style={styles.odd}>
            <h3 style={styles.h3}>Camera Control Mode</h3>
            <div style={styles.col}>
              <select onChange={e=> { this.setState({camera: e.target.value})}}
                    value={ this.state.camera }
                    style={ styles.select }
              >
              <option value="fps">First Person Camera</option>
              <option value="vehicle">Flight Camera (relative rotation)</option>
            </select>
            </div>
          </div>
          <div style={styles.even}>
            <h3 style={styles.h3}>IOT Mode</h3>
            <div style={styles.col}>
              <select onChange={e=> {this.setState({IOTMode: e.target.value})}}
                    value={ this.state.IOTMode }
                    style={ styles.select }
              >
                <option value="off">Off (Recommended)</option>
                <option value="on">On (Only renders after world update)</option>
              </select>
            </div>
          </div>
          <div style={styles.odd}>
            <h3 style={styles.h3}>Post Processing</h3>
            <div style={styles.col}>
              <select onChange={e=> {this.setState({postProcessing: e.target.value})}}
                      value={ this.state.postProcessing }
                      style={ styles.select }
              >
                <option value="on">On (Bloom HDR Effect)</option>
                <option value="off">Off (Better Performance)</option>
              </select>
            </div>
          </div>
          <div style={{ ...styles.even, ...styles.bottom }}>
            <h3 style={styles.h3}>Menu Blur Effect</h3>
            <div style={styles.col}>
              <select onChange={e=> {this.setState({blurEffect: e.target.value})}}
                      value={ this.state.blurEffect }
                      style={ styles.select }
              >
                <option value="on">On (3d view is blurred when menu is open)</option>
                <option value="off">Off (Better Performance)</option>
              </select>
            </div>
          </div>
          <input style={styles.save}
                 type='submit'
                 value="Profile Settings"
                 onClick={ e=> { browserHistory.push("/profile") } }
          />
          <input style={styles.save}
                 type='submit'
                 value="Reset To Defaults"
                 onClick={ e=> this.resetToDefault()}
          />
          <input style={styles.save}
                 type='submit'
                 value="Save Settings"
                 onClick={ e=> this.save()}
          /> 
          <br />
          { isAdmin ? (
            <div style={styles.admin}>
              <h2 style={{marginTop: '1em'}}>Admin Settings</h2>
              <div>
                <h3 style={styles.h3}>Default World</h3>
                <div style={styles.col}>
                  <select onChange={e=> { this.setState({defaultWorld: e.target.value})}}
                            value={ this.state.defaultWorld }
                            style={ styles.select }
                    >
                    {
                      this.props.worlds.map( (world, i) => {
                        return (
                          <option value={world.name} key={i}>{world.name}</option>
                        )
                      })
                    }
                    </select>
                  </div>
                </div>
              <div>
                <h3 style={styles.h3}>Welcome Message</h3>
                <div style={styles.col}>
                  <input onBlur={e=> { this.setState({welcomeMessage: e.target.value})}}
                          value={ this.state.welcomeMessage }
                          style={styles.textInput}
                          type='text'
                    />
                  </div>
                </div>
              <div style={styles.table}>
                <h3 style={styles.h3}>Manage Network</h3>
                <table>
                  <tr>
                    <td>Domain Name</td>
                    <td></td>
                    <td>
                      <input type='button'
                             value='Add Server'
                             onClick={e=> { this.addServer() }}
                             style={styles.addServer}
                      />
                    </td>
                  </tr>
                  <tr>
                    </tr>
                    {
                      this.state.network.map((domain, index)=>{
                        return (
                          <tr key={index}>
                            <td>
                              <input type='text'
                                     style={styles.domainName}
                                     value={domain.name}
                                     onBlur={e=> this.updateServer(index, e.target.value)}
                              />     
                            </td>
                            <td>{
                              domain.image != '' ? ( // make this editable later
                                <img src={`/data/public/${domain.image}`} 
                                     style={styles.domainImage}
                                     title={domain.name}
                                     alt={domain.name}
                                />
                              ) : ''}
                            </td>
                            <td>
                              <input type='button'
                                     value='Remove'
                                     onClick={e=> { this.removeServer(index) }}
                                     style={styles.addServer}
                              />
                            </td>
                          </tr>
                        )
                      })
                    }
                </table>
              </div>
              <input style={styles.save}
                     type='submit'
                     value="Save Admin Settings"
                     onClick={ e=> this.updateUniverseSettings()}
              />
            </div>
          ): ""}
          </div>
        </Shell>
    )
  }
}


import { connect } from 'react-redux';
import {
    sendMessage
} from '../../redux/actions/message-actions'
import {
  fetchWorlds,
  setCurrentWorld,
  fetchUniverseSettings,
  updateUniverseSettings
} from '../../redux/actions/world-actions'

export default connect(
  (state, ownProps) => {
    return {
        fetchingSettings: state.worlds.fetchingSettings,
        settings: state.worlds.universeSettings,
        worlds: state.worlds.all,
        user: state.users.loggedIn
    }
  },
  dispatch => {
    return {
      sendMessage: (message, from) => {
          dispatch(sendMessage(message, from))
      },
      setCurrentWorld: (world) => {
          dispatch(setCurrentWorld(world))
      },
      updateUniverseSettings: (data, password) => {
          dispatch(updateUniverseSettings(data, password))
      },
      fetchUniverseSettings: () => {
        dispatch(fetchUniverseSettings())
      }
    }
  }
)(Settings)

const styles = {
  modal: () => {
    return Object.assign({}, modalStyle(isMobile()), {
        maxWidth: '1080px',
        bottom: undefined,
        top: '1em',
        height: '120vh',
        left: '0px'
      })
  },
  save: {
    float: 'right',
    marginRight: '2em',
    marginTop: '1em',
    marginBottom: '3em',
    fontSize: '1.25em',
    background: '#2b2b2b',
    color: 'white',
    border: 'none',
    padding: '0.5em',
    borderRadius: '3px',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.54)'
  },
  top: {
    borderTopRightRadius: '0.2em',
    borderTopLeftRadius: '0.2em'
  },
  bottom: {
    borderBottomRightRadius: '0.2em',
    borderBottomLeftRadius: '0.2em'
  },
  odd: {
    backgroundColor: 'rgba(32,32,32,0.85)'
  },
  even: {
    backgroundColor: 'rgba(42,42,42,0.85)'
  },
  h3: {
    textAlign: 'left',
    width: '42%',
    fontSize: '14px',
    display: 'inline-block',
    marginLeft: '3%'
  },
  col: {
    width: '55%',
    display: 'inline-block',
  },
  textInput: {

  },
  select: {
    padding: '0.5em'
  },
  range: {
    padding: '0.5em'
  },
  admin: {
    marginTop: '3em'
  },
  table: {
    marginLeft: '3em'
  },
  numericLabel: {paddingLeft: '1em', width: '100px', display: 'inline-block'}
}
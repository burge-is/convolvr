import {
  SPACE_SET_CURRENT,
  SPACE_CREATE_FETCH,
  SPACE_CREATE_DONE,
  SPACE_CREATE_FAIL,
  SPACES_FETCH,
  SPACES_FETCH_DONE,
  SPACES_FETCH_FAIL,
  USER_SPACES_FETCH,
  USER_SPACES_FETCH_FAIL,
  USER_SPACES_FETCH_DONE,
  SPACE_UPDATE_FETCH,
  SPACE_UPDATE_DONE,
  SPACE_UPDATE_FAIL,
  SPACE_DELETE_FETCH,
  SPACE_DELETE_DONE,
  SPACE_DELETE_FAIL,
  UNIVERSE_SETTINGS_FETCH,
  UNIVERSE_SETTINGS_FETCH_DONE,
  UNIVERSE_SETTINGS_FETCH_FAIL,
  UNIVERSE_SETTINGS_UPDATE_FETCH,
  UNIVERSE_SETTINGS_UPDATE_DONE,
  UNIVERSE_SETTINGS_UPDATE_FAIL
} from '../constants/action-types'
import axios from 'axios'
import { browserHistory } from 'react-router'
import { API_SERVER } from '../../config.js'

export function fetchSpaces () {
    return dispatch => {
     dispatch({
        type: SPACES_FETCH
     })
     return axios.get(API_SERVER+"/api/spaces")
        .then(res => {
            three.world.systems.assets.setSpaces( res.data )
            dispatch({
                type: SPACES_FETCH_DONE,
                spaces: res.data
            })
        }).catch(res => {
            dispatch({
                type: SPACES_FETCH_FAIL,
                err: err
            })
        });
   }
}
export function fetchUserSpaces (userId) {
    return dispatch => {
     dispatch({
        type: USER_SPACES_FETCH,
        userId
     })
     return axios.get(API_SERVER+"/api/spaces/user/"+userId)
        .then(res => {
            dispatch({
                type: USER_SPACES_FETCH_DONE,
                data: res.data
            })
        }).catch(err => {
            dispatch({
                type: USER_SPACES_FETCH_FAIL,
                err: err
            })
        });
   }
}
export function fetchUniverseSettings () {
    return dispatch => {
     dispatch({
        type: UNIVERSE_SETTINGS_FETCH
     })
     return axios.get(API_SERVER+"/api/universe-settings")
        .then(response => {
            if ( window.location.pathname == "/" ) {
                console.log("got universe settings.. setting current world")
              dispatch({
                type: SPACE_SET_CURRENT,
                current: response.data.defaultSpace,
                userName: "space" 
              })
            }

            dispatch({
              type: UNIVERSE_SETTINGS_FETCH_DONE,
              settings: response.data
            })
        }).catch(response => {
            dispatch({
              type: UNIVERSE_SETTINGS_FETCH_FAIL,
              err: response
            })
        });
   }
}

export function createSpace (data) {
    return dispatch => {
     dispatch({
        type: SPACES_FETCH,
        data
     })
     return axios.post(API_SERVER+"/api/spaces", data)
        .then(response => {
            dispatch(createSpaceDone(response))
            //three.world.reload( data.userName, data.name, false, false ) // until this works perfectly, refresh the page
            browserHistory.push("/"+data.userName+"/"+data.name)
            window.location.href = window.location.href  /* work around */
        }).catch(response => {
            dispatch(createSpaceFail(response))
        });
   }
}
export function createSpaceDone (res) {
    return {
        type: SPACE_CREATE_DONE,
        created: res.data
    }
}
export function createSpaceFail (err) {
    return {
        type: SPACE_CREATE_FAIL,
        err
    }
}
export function setCurrentSpace (userName, world) {
  return {
    type: SPACE_SET_CURRENT,
    current: world,
    userName
  }
}
export function updateSpace (id, data) {
    return dispatch => {
     dispatch({
        type: SPACE_UPDATE_FETCH,
        id: id
     })
     return axios.post(API_SERVER+"/api/spaces/"+id, data)
        .then(response => {
            dispatch(updateSpaceDone(response))
        }).catch(response => {
            dispatch(updateSpaceFail(response))
        });
   }
}
export function updateSpaceDone (res) {
    return {
        type: SPACE_UPDATE_DONE,
        updated: res.data
    }
}
export function updateSpaceFail (err) {
    return {
        type: SPACE_UPDATE_FAIL,
        err
    }
}
export function updateUniverseSettings (data, password) {
    return dispatch => {
     dispatch({
        type: UNIVERSE_SETTINGS_UPDATE_FETCH,
        id: 1
     })
     return axios.post(API_SERVER+"/api/universe-settings", data)
        .then(res => {
            dispatch({
                type: UNIVERSE_SETTINGS_UPDATE_DONE,
                settings: res.data
            })
        }).catch(res => {
            dispatch({
                type: UNIVERSE_SETTINGS_UPDATE_FAIL,
                err: res.error
            })
        });
   }
}

export function deleteSpace (id, data) {
    return dispatch => {
     dispatch({
        type: SPACE_DELETE_FETCH,
        id: id
     })
     return axios.post(API_SERVER+"/api/spaces/delete/"+id)
        .then(response => {
            dispatch(deleteSpaceDone(response))
        }).catch(response => {
            dispatch(deleteSpaceFail(response))
        });
   }
}
export function deleteSpaceDone (res) {
    return {
        type: SPACE_DELETE_DONE,
        details: res.data
    }
}
export function deleteSpaceFail (err) {
    return {
        type: SPACE_DELETE_FAIL,
        err
    }
}

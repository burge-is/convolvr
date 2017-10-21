import {
    INVENTORY_SET_CURRENT,
    INVENTORY_ADD_FETCH,
    INVENTORY_ADD_DONE,
    INVENTORY_ADD_FAIL,
    INVENTORY_FETCH,
    INVENTORY_FETCH_DONE,
    INVENTORY_FETCH_FAIL,
    INVENTORY_UPDATE_FETCH,
    INVENTORY_UPDATE_DONE,
    INVENTORY_UPDATE_FAIL,
    INVENTORY_DELETE_FETCH,
    INVENTORY_DELETE_DONE,
    INVENTORY_DELETE_FAIL,
    INVENTORY_ADD_TO_WORLD_FETCH,
    INVENTORY_ADD_TO_WORLD_DONE,
    INVENTORY_ADD_TO_WORLD_FAIL
} from '../constants/action-types'
import { detectWorldDetailsFromURL } from '../../config'

module.exports = function places (state = {
    items: {
        entities: [],
        components: [],
        properties: []
    },
    updated: false,
    created: false,
    deleted: false,
    addedToWorld: false,
    error: false,
    fetching: false
}, action) {
  switch (action.type) {
    case INVENTORY_ADD_FETCH:
      return Object.assign({}, state, {
          fetching: true
      })
    case INVENTORY_ADD_DONE:
      return Object.assign({}, state, {
          created: action.data,
          fetching: false
      })
    case INVENTORY_ADD_FAIL:
      return Object.assign({}, state, {
          fetching: false,
          error: action.err
      })
    case INVENTORY_FETCH:
      return Object.assign({}, state, {
          fetching: true
      })
    case INVENTORY_FETCH_FAIL:
      return Object.assign({}, state, {
          fetching: false,
          error: action.err
      })
    case INVENTORY_FETCH_DONE:
      switch( action.category ) {
          case "Entities":
            return Object.assign({}, state, {
                items: {
                    ...state.items,
                    entities: action.data
                },
                fetching: false
            })
          break
          case "Components":
            return Object.assign({}, state, {
                items: {
                    ...state.items,
                    components: action.data
                },
                fetching: false
            })
          break
          case "Properties":
            return Object.assign({}, state, {
                items: {
                    ...state.items,
                    properties: action.data
                },
                fetching: false
            })
          break
      }
     
    case INVENTORY_UPDATE_FETCH:
      return Object.assign({}, state, {
          fetching: true,
          updated: false
      })
    case INVENTORY_UPDATE_DONE:
      return Object.assign({}, state, {
          updated: action.updated,
          fetching: false
      })
    case INVENTORY_UPDATE_FAIL:
      return Object.assign({}, state, {
          error: action.err,
          fetching: false
      })
    case INVENTORY_DELETE_FETCH:
      return Object.assign({}, state, {
          fetching: true,
          deleted: false
      })
    case INVENTORY_DELETE_DONE:
      return Object.assign({}, state, {
          deleted: action.data,
          fetching: false
      })
    case INVENTORY_DELETE_FAIL:
      return Object.assign({}, state, {
          error: action.err,
          fetching: false
      })
    case INVENTORY_ADD_TO_WORLD_FETCH:
      return Object.assign({}, state, {
          fetching: true,
          addedToWorld: false
      })
    case INVENTORY_ADD_TO_WORLD_DONE:
      return Object.assign({}, state, {
          addedToWorld: action.data,
          fetching: false
      })
    case INVENTORY_ADD_TO_WORLD_FAIL:
      return Object.assign({}, state, {
          error: action.err,
          fetching: false
      })   
    default:
      return state;
  }
};
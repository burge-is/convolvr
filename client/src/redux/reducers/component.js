import {
    COMPONENT_ADD,
    COMPONENTS_FETCH,
    COMPONENTS_FETCH_DONE,
    COMPONENTS_FETCH_FAILED,
    UPDATE_COMPONENT,
    DELETE_COMPONENT
} from '../constants/action-types';

module.exports = function components (state = {
    all: [],
    userComponents: [],
    current: null,
    fetching: false
}, action) {
  switch (action.type) {
    case COMPONENT_ADD:
      return [
        ...state,
        action.data
      ]
    case DELETE_COMPONENT:

    case COMPONENTS_FETCH:
        return Object.assign({}, state, {
            fetching: true
        })
    case COMPONENTS_FETCH_DONE:
        return Object.assign({}, state, {
                all: action.data,
                fetching: false
        })
    case COMPONENTS_FETCH_FAILED:
        return Object.assign({}, state, {
            fetching: false
        })
    case UPDATE_COMPONENT:

    default:
      return state;
  }
};

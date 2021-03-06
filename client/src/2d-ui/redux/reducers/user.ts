import {
    USER_ADD,
    USERS_FETCH,
    USERS_FETCH_DONE,
    USERS_FETCH_FAIL,
    USER_CONNECT,
    USER_DISCONNECT,
    UPDATE_USER_FETCH,
    UPDATE_USER_DONE,
    UPDATE_USER_FAIL,
    USER_LOG_OUT,
    DELETE_USER,
    LOGIN_FETCH,
    LOGIN_DONE,
    LOGIN_FAIL
} from '../constants/action-types';

export default function users (state: any = {
    loggedIn: false,
    loginError: false,
    all: [],
    fetching: false,
    updateFetching: false,
    updateError: false
}, action: any) {
  switch (action.type) {
    case USER_ADD:

      return [

      ]
    case USER_CONNECT:
        return Object.assign({}, state, {
          all: [
              ...state.all,
              {
                name: action.name,
                data: action.data,
                pic: action.pic
              }
          ]
        })
    case USER_DISCONNECT:

    case DELETE_USER:
    break
    case USER_LOG_OUT:  
        return Object.assign({}, state, {
            loggedIn: false
        })
    case USERS_FETCH:
        return Object.assign({}, state, {
            fetching: true
        })
    case USERS_FETCH_DONE:
        return Object.assign({}, state, {
            fetching: false,
            all: action.data.users
        })
    case USERS_FETCH_FAIL:
        return Object.assign({}, state, {
            fetching: false,
            all: state.all
        })
    case UPDATE_USER_FETCH:
        return Object.assign({}, state, {
            updateFetching: true
        })
    case UPDATE_USER_DONE:
        return Object.assign({}, state, {
            updateFetching: false,
            updateError: false
        })
    case UPDATE_USER_FAIL:
        return Object.assign({}, state, {
            updateFetching: false,
            updateError: action.error
        })
    case LOGIN_FETCH:
        return Object.assign({}, state, {
            fetching: true,
            loggedIn: false
        })
    case LOGIN_DONE:
        console.warn("login done", action);
        return Object.assign({}, state, {
                fetching: false,
                loggedIn: action.data != "" ? action.data : false
        })
    case LOGIN_FAIL:
        return Object.assign({}, state, {
            fetching: false
        })

    default:
      return state;
  }
};

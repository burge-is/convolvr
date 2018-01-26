import React, { Component } from 'react';
import Button from './button';
import { isMobile } from '../../config'
import {
  tabStyle,
  tabTitleStyle
} from '../styles'

let styles = {
  tab: tabStyle,
  title: ()=> tabTitleStyle(isMobile()),
  visible: {
    opacity: 1,
    height: '20px'
  }
}

export default class Tab extends Component {

  render() {

    return (
        <div style={ { ...styles.tab( this.props.compact), ...this.props.style } } title={ this.props.title }
             onClick={ (evt) => { this.props.clickHandler(evt, this.props.title) } }
        >
            <Button title={this.props.title}
                    innerStyle={ this.props.buttonStyle }
                    image={this.props.image}
                    compact={this.props.compact}
            />
            <span style={ this.props.showTitle ? { ...styles.title(), ...styles.visible } : styles.title() }>
                { this.props.title }
            </span>
        </div>
    )
    
  }

}

Tab.defaultProps = {
    title: "Menu Item",
    showTitle: false, 
    compact: false
}
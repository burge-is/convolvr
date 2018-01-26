import React, { Component } from 'react'
import Button from './button'
import ContextMenu from './context-menu'

export default class Card extends Component {

  componentWillMount () {

    this.setState({
     
    })

  }

  handleContextAction ( name, e ) {

    let data = {}

    // display a modal window here if needed.
    if ( name == "Rename" || name == "Edit" || name == "Delete" ) {

      data.filename = this.props.title
      data.username = this.props.username

    }
    
    if ( name == "Delete" ) {

      if ( confirm(`Delete ${data.filename}?`) ) {
        this.props.onContextMenu(name, data, e)
      } else {
        this.props.onContextMenu("", {}, {})
      }

    } else {

      this.props.onContextMenu(name, data, e)

    }

  }

  handleCardClick ( evt, title ) {

    let elemClass = evt.target && evt.target.getAttribute("class")

    if ( elemClass == "ui-card-outer" || elemClass == "ui-card-title" ) // make sure the outer div was clicked

      this.props.clickHandler( evt, this.props.title )

  }

  render() {

    return (
        <div style={styles.card(this.props.image, this.props.color, this.props.compact, this.props.quarterSize)}
             onClick={ evt => this.handleCardClick( evt ) }
             title={this.props.title }
             className={"ui-card-outer"}
        >
            {(this.props.showTitle ? (
                <span style={styles.title(this.props.image, this.props.quarterSize)}
                      className="ui-card-title"
                >
                { this.props.title }
                </span>
            ) : "")}
            {
              this.props.onContextMenu ? (
                <ContextMenu options={this.props.contextMenuOptions} 
                             onAction={ (name, e) => this.handleContextAction( name, e ) }
                             compact={ this.props.compact }
                             title={ this.props.title }
                             isImage={ this.props.image != "" }
                             username={ this.props.username }
                             category={ this.props.category }
                             dir={ this.props.dir }
                />
              ) : ''
            }
            {
              this.props.description != "" ? (
                <div style={styles.description(this.props.compact)}>
                  { this.props.description }
                </div>
              ) : ""
            }
        </div>
    )

  }

}

Card.defaultProps = {
    title: "Menu Item",
    description: "",
    username: "",
    dir: "",
    category: "",
    showTitle: false,
    color: '#252525',
    image: "",
    compact: false,
    quarterSize: false,
    onContextMenu: false,
    contextMenuOptions: [
      { name: "Download" },
      { name: "Add To Inventory"},
      { name: "Delete" },
      { name: "Rename" },
      { name: "Share" },
      { name: "Edit" },
    ]
}

let styles = {
  card: (image, color, compact, quarterSize) => {
    return {
      borderRadius: '1.5px',
      boxShadow: '0 0.25em 0.5em 0px rgba(0, 0, 0, 0.3)',
      cursor: 'pointer',
      width: quarterSize ? '120px' : '240px',
      height: quarterSize ? '120px' : (compact ? '60px' : '240px'),
      display: 'inline-block',
      marginRight: '0.5em',
      marginBottom: '0.5em',
      backgroundColor: 'rgba(255,255,255, 0.1)',
      backgroundSize: 'cover',
      backgroundImage: `url(${image})`,
      textAlign: "center",
      verticalAlign: "top",
    }
  },
  description: ( compact ) => {
    return {
      opacity: 0.8
    }
  },
  title: (image, quarterSize) => {
    return {
      width: '100%',
      fontSize: quarterSize ? '12px' : '16px',
      textShadow: quarterSize || image != '' ? 'rgba(0, 0, 0, 0.33) 1px 1px 1px' : 'none',
      height: '32px',
      paddingTop: '8px',
      display: 'block',
      wordBreak: 'break-word',
      backgroundColor: quarterSize || image != '' ? 'transparent' : 'rgba(0,0,0,0.2)'
    }
  }
}
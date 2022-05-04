import React, { Component } from 'react'
 
import objects from './object'

 
import WhiteBoard, {
  getWhiteBoardData,
  loadWhiteBoardData,
  addWhiteBoardObject,
  modifyWhiteBoardObjects,
  removeWhiteBoardObjects,
  clearWhiteBoardContext,
  createWhiteBoardSelection,
  updateWhiteBoardSelection,
  clearWhiteBoardSelection,
} from 'fabric-whiteboard'
 
export default class Fabricwhiteboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mode: 'select',
      width: '600px',
      height: '600px',
      brushColor: '#f44336',
      brushThickness: 2,
    }
 
    this.refLeft = undefined
    this.refRight = undefined
 
    this.calcBoundsSize = this.calcBoundsSize.bind(this)
    this.handleBoundsSizeChange = this.handleBoundsSizeChange.bind(this)
 
    this.handleOnModeClick = this.handleOnModeClick.bind(this)
    this.handleOnBrushColorChange = this.handleOnBrushColorChange.bind(this)
    this.handleOnBrushThicknessChange = this.handleOnBrushThicknessChange.bind(
      this
    )
    this.handleOnObjectAdded = this.handleOnObjectAdded.bind(this)
    this.handleOnObjectsModified = this.handleOnObjectsModified.bind(this)
    this.handleOnObjectsRemoved = this.handleOnObjectsRemoved.bind(this)
    this.handleOnSelectionCreated = this.handleOnSelectionCreated.bind(this)
    this.handleOnSelectionUpdated = this.handleOnSelectionUpdated.bind(this)
    this.handleOnSelectionCleared = this.handleOnSelectionCleared.bind(this)
  }
 
  componentDidMount() {
    this.calcBoundsSize()
 
    window.addEventListener('resize', this.handleBoundsSizeChange)
  }
 
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleBoundsSizeChange)
  }
 
  render() {
    const { mode, width, height, brushColor, brushThickness } = this.state
 
    return (
      <div className="App1" id="App">
        <div className="whiteboard" id="whiteboard">
          <WhiteBoard
            ref={(ref) => {
              this.refLeft = ref
            }}
            width={width}
            height={height}
            showToolbar={true}
            enableToolbar={true}
            showBoard={true}
            mode={mode}
            onModeClick={this.handleOnModeClick}
            brushColor={brushColor}
            brushColors={[
              '#f44336',
              '#e91e63',
              '#9c27b0',
              '#673ab7',
              '#3f51b5',
              '#2196f3',
            ]}
            brushThickness={brushThickness}
            onBrushColorChange={this.handleOnBrushColorChange}
            onBrushThicknessChange={this.handleOnBrushThicknessChange}
            onObjectAdded={this.handleOnObjectAdded}
            onObjectsModified={this.handleOnObjectsModified}
            onObjectsRemoved={this.handleOnObjectsRemoved}
            onSelectionCreated={this.handleOnSelectionCreated}
            onSelectionUpdated={this.handleOnSelectionUpdated}
            onSelectionCleared={this.handleOnSelectionCleared}
          />        
        </div>
 
        <div className="toolbar" id="toolbar">
          
         

          <button
            className="toolbar-button"
            onClick={() => {
              clearWhiteBoardContext(this.refLeft)
              clearWhiteBoardContext(this.refRight)
            }}
          >
            Clear
          </button>
        </div>
 
        <div className="toolbar">
          <button className="whiteboard-btn gray_btn" onClick={()=>this.props.whiteboardhandler(false)} >Close</button>
        </div>
      </div>
    )
  }
 
  calcBoundsSize() {
    return
    const domApp = document.getElementById('App')
    const domToolbar = document.getElementById('toolbar')
 
    const domAppStyle = window.getComputedStyle(domApp)
    const domToolbarStyle = window.getComputedStyle(domToolbar)
 
    this.setState({
      width: domAppStyle.width,
      height: `${
        parseInt(domAppStyle.height, 10) -
        parseInt(domToolbarStyle.height, 10) -
        20
      }px`,
    })
  }
 
  handleBoundsSizeChange() {
    this.calcBoundsSize()
  }
 
  handleOnModeClick(mode) {
    this.setState({
      mode: mode,
    })
  }
 
  handleOnBrushColorChange(color) {
    this.setState({
      brushColor: color.hex,
    })
  }
 
  handleOnBrushThicknessChange(thickness) {
    this.setState({
      brushThickness: thickness,
    })
  }
 
  handleOnObjectAdded(object) {
    addWhiteBoardObject(this.refRight, object)
  }
 
  handleOnObjectsModified(object) {
    modifyWhiteBoardObjects(this.refRight, object)
  }
 
  handleOnObjectsRemoved(objects) {
    removeWhiteBoardObjects(this.refRight, objects)
  }
 
  handleOnSelectionCreated(selection) {
    createWhiteBoardSelection(this.refRight, selection)
  }
 
  handleOnSelectionUpdated(selection) {
    updateWhiteBoardSelection(this.refRight, selection)
  }
 
  handleOnSelectionCleared(selection) {
    clearWhiteBoardSelection(this.refRight, selection)
  }
}
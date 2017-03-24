import React, { Component } from 'react'
import data from './data.json'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      location: "-97.69326,30.28760",
      hole: 1
    }
  }

  componentWillMount = () => {
    navigator.geolocation.getCurrentPosition(
      position => this.setState({ location: `${position.coords.longitude},${position.coords.latitude}` })
    )
    navigator.geolocation.watchPosition(
      position => this.setState({ location: `${position.coords.longitude},${position.coords.latitude}` }),
      error => alert(JSON.stringify(error)),
      { enableHighAccuracy: true }
    )
  }

  switchHole = (hole) => this.setState({ hole })

  distance = (pt1, pt2) => {
    const [lon1, lat1] = pt1.split(",")
    const [lon2, lat2] = pt2.split(",")

    const radlat1 = Math.PI * lat1/180
    const radlat2 = Math.PI * lat2/180
    const theta = lon1-lon2
    const radtheta = Math.PI * theta/180
    let dist = (
      Math.sin(radlat1) * Math.sin(radlat2) + 
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
    )
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    return dist * 5280 / 3 // yards
  }

  render = () => {
    const location = this.state.location

    const course = "morris-williams"
    const points = data[course][this.state.hole].poi.map(p => ({
      ...p,
      dist: Math.round(this.distance(p.gps, this.state.location || p.gps)),
    }))
    const filename = `images/${course}-hole${this.state.hole}.png`
    const image = <img src={filename} alt={filename} />

    const holeSelect = (
      <select onChange={evt => this.switchHole(evt.target.value)}>
        { 
          Object.keys(data[course]).map((i, idx) => <option value={idx+1}>{`Hole ${idx + 1}`}</option>)
        }
      </select>
    )

    const container = (
      <div>
        { holeSelect }
        <div style={{ position: 'relative' }}>
          { image }
          {
            points.map(p => {
              const radius = 10
              return [(
                <div
                  style={{
                    zIndex: 2,
                    position: 'absolute',
                    left: p.pixel.split(",")[0],
                    top: p.pixel.split(",")[1],
                    background: 'black',
                    textAlign: 'center',
                    padding: 2,
                    color: 'white'
                  }}
                >{ p.dist }</div>
              ),(
                <svg
                  viewBox="0 0 10 10"
                  style={{
                    zIndex: 1,
                    position: 'absolute',
                    left: p.pixel.split(",")[0] - 5,
                    top: p.pixel.split(",")[1] - 5,
                    width: 10,
                    height: 10,
                  }}
                ><circle cx={5} cy={5} r={5} fill="green" /></svg>
              )]
            })
          }
        </div>
        { location }
      </div>
    )

    return container
  }
}

export default App

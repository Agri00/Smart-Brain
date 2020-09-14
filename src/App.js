import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './Components/Navigation/Navigation'
import Logo from './Components/Logo/Logo'
import Rank from './Components/Rank/Rank'
import ImagesLinkForm from './Components/ImagesLinkForm/ImagesLinkForm'
import NumberOfFaces from './Components/ImagesLinkForm/NumberOfFaces'
import FaceRecognition from './Components/FaceRecognition/FaceRecognition'
import SignIn from './Components/SignIn/SignIn'
import Register from './Components/Register/Register'
import './App.css';

const app = new Clarifai.App({
    apiKey: '0677751c181a4d2fbf91b0b2a1e81a6a',
    ImageUrl: ''
});

const particlesOptions = {
    particles: {
        number: {
            value: 105,
            density: {
                enable: true,
                value_area: 800
            }
        }
    }
}

const initialState = {
    input: '',
    imageUrl: '',
    box: {},
    boxes: [],
    route: 'SignIn',
    isSignedIn: false,
    isClicked: false,
    user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
    }
}

class App extends Component {
    constructor() {
        super()
        this.state = initialState

    }


loadUser = (data) => {
    this.setState({
        user: {
            id: data.id,
            name: data.name,
            email: data.email,
            entries: data.entries,
            joined: data.joined,
        }
    })
}

calculateFaceLocation = (data) => {

    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return data.outputs[0].data.regions.map(face => {
      let clarifaiFace = face.region_info.bounding_box;
      return {
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - (clarifaiFace.right_col * width),
        bottomRow: height - (clarifaiFace.bottom_row * height)
      }
    });
}

displayFaceBox = (boxes) => {
    this.setState({ boxes: boxes })
}

onInputChange = (event) => {
    this.setState({ input: event.target.value });
}

onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    this.setState({ isClicked: true })
        fetch('https://shrouded-harbor-71329.herokuapp.com/imageurl', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              input: this.state.input
            })
          })
        .then(response => response.json())
        .then(response => {
            if (response) {
          fetch('https://shrouded-harbor-71329.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
            })
            .catch(console.log)

        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));

}
onRouteChange = (route) => {
    if (route === 'SignIn') {
        this.setState(initialState);
    } else if (route === 'home') {
        this.setState({ isSignedIn: true })
    }
    this.setState({ route: route });
}
render() {
    const { isSignedIn, imageUrl, route, box, user, boxes, isClicked } = this.state;
    return (
        <div className="App">
            <Particles  className='particles'
              params={particlesOptions}
            />
            <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
            {route === 'home'
            ? <div> 
                <Logo />
                <Rank entries= {this.state.user.entries} name = {user.name}/>
                <ImagesLinkForm 
                 onInputChange={this.onInputChange} 
                 onButtonSubmit={this.onButtonSubmit}
                />
                {isClicked
                    ?<NumberOfFaces boxes={boxes} />
                    : null}
                <FaceRecognition box={box} imageUrl={imageUrl} boxes={boxes}/>
              </div>
            :(
              this.state.route==='SignIn'
              ? <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
          }
          </div>
    );
}
}

export default App;
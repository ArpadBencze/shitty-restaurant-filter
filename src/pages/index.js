import React, { useEffect, useReducer } from "react"
import { Helmet } from "react-helmet"
import styled from "styled-components"

import Layout from "../components/layout"

let map
let service
let infowindow

let latitude
let longitude

const getCoordinates = () => {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject)
  })
}

const getGeoLocation = async () => {
  if ("geolocation" in navigator) {
    const geoLocation = await getCoordinates()
    latitude = geoLocation.coords.latitude
    longitude = geoLocation.coords.longitude
    const { lat, lng } = {
      lat: geoLocation.coords.latitude,
      lng: geoLocation.coords.longitude,
    }

    return { lat, lng }
  } else {
    console.log("Not Available")
  }
}

if (typeof window !== "undefined") {
  window.initMap = async () => {
    const geoLocation = await getGeoLocation()
    const clientLocation = { ...geoLocation }
    map = new window.google.maps.Map(document.getElementById("map"), {
      center: { ...clientLocation },
      zoom: 15,
    })
    infowindow = new window.google.maps.InfoWindow()

    new window.google.maps.Marker({
      position: clientLocation,
      map: map,
    })
  }
}

function createMarker(place) {
  if (!place.geometry || !place.geometry.location) return
  const marker = new window.google.maps.Marker({
    map,
    position: place.geometry.location,
  })
  window.google.maps.event.addListener(marker, "click", () => {
    console.log(place)
    infowindow.setContent(
      `<div class='infoWindow visible'><p>${place.name}</p><p>${place.rating}</p><p>${place.vicinity}</p><p>${place.price_level}</p></div>`
    )
    infowindow.open(map)
  })
}

const findPlacesAboveRatingX = (rating, radius) => {
  let location = new window.google.maps.LatLng(latitude, longitude)

  let request = {
    location,
    radius: +radius,
    type: ["restaurant"],
  }
  const moreButton = document.getElementById("more")

  let getNextPage
  moreButton.onclick = function () {
    moreButton.disabled = true

    if (getNextPage) {
      getNextPage()
    }
  }

  service = new window.google.maps.places.PlacesService(map)
  service.nearbySearch(request, callback)

  function callback(results, status, pagination) {
    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
      for (let i = 0; i < results.length; i++) {
        if (results[i].rating >= rating) {
          createMarker(results[i])
        }
      }
      moreButton.disabled = !pagination || !pagination.hasNextPage
      if (pagination && pagination.hasNextPage) {
        getNextPage = () => {
          // Note: nextPage will call the same handler function as the initial call
          pagination.nextPage()
        }
      }
    }
    console.log(results)
  }
}

const MapAndControls = styled.div`
  display: flex;

  @media only screen and (max-width: 480px) {
    flex-direction: column;
  }
`

const StyledMapContainer = styled.div`
  width: 500px;
  height: 500px;
`

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 25px;

  input {
    margin-bottom: 10px;
  }

  button {
    margin-top: 10px;
  }
`

const RadioInputContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const Radio = styled.div`
  > input {
    margin-right: 5px;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
`

const updateTextQueryAction = "UPDATE TEXT QUERY"
const updateRadiusAction = "UPDATE RADIUS"
const updateRatingAction = "UPDATE RATING"

const reducer = (state, action) => {
  switch (action.type) {
    case updateTextQueryAction:
      return {
        ...state,
        queryString: action.payload,
      }
    case updateRadiusAction:
      return {
        ...state,
        radius: action.payload,
      }
    case updateRatingAction:
      return {
        ...state,
        rating: action.payload,
      }
  }
}

const IndexPage = () => {
  const [state, dispatch] = useReducer(reducer, {
    queryString: "",
    radius: 500,
    rating: 4.5,
  })

  useEffect(() => {
    console.log(state)
  }, [state])

  const handleSubmit = e => {
    e.preventDefault()
    findPlacesAboveRatingX(state.rating, state.radius)
  }

  return (
    <Layout>
      <Helmet>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`}
          async
          defer
        />
      </Helmet>
      <h1>Shitty restaurant filter app </h1>
      <MapAndControls>
        <StyledMapContainer id="map"></StyledMapContainer>
        <Controls>
          <Form onSubmit={e => handleSubmit(e)}>
            <input
              type="text"
              value={state.queryString}
              onChange={e =>
                dispatch({
                  type: updateTextQueryAction,
                  payload: e.target.value,
                })
              }
            />
            <input
              type="number"
              value={state.radius}
              onChange={e =>
                dispatch({ type: updateRadiusAction, payload: e.target.value })
              }
            />
            <p>Above rating:</p>
            <RadioInputContainer>
              <Radio>
                <input
                  type="radio"
                  value="4.5"
                  name="rating"
                  checked={state.rating === 4.5}
                  onChange={e =>
                    dispatch({
                      type: updateRatingAction,
                      payload: +e.target.value,
                    })
                  }
                />
                <label>4.5</label>
              </Radio>
              <Radio>
                <input
                  type="radio"
                  value="4.6"
                  name="rating"
                  checked={state.rating === 4.6}
                  onChange={e =>
                    dispatch({
                      type: updateRatingAction,
                      payload: +e.target.value,
                    })
                  }
                />
                <label>4.6</label>
              </Radio>
              <Radio>
                <input
                  type="radio"
                  value="4.7"
                  name="rating"
                  checked={state.rating === 4.7}
                  onChange={e =>
                    dispatch({
                      type: updateRatingAction,
                      payload: +e.target.value,
                    })
                  }
                />
                <label>4.7</label>
              </Radio>
              <Radio>
                <input
                  type="radio"
                  value="4.8"
                  name="rating"
                  checked={state.rating === 4.8}
                  onChange={e =>
                    dispatch({
                      type: updateRatingAction,
                      payload: +e.target.value,
                    })
                  }
                />
                <label>4.8</label>
              </Radio>
              <Radio>
                <input
                  type="radio"
                  value="4.9"
                  name="rating"
                  checked={state.rating === 4.9}
                  onChange={e =>
                    dispatch({
                      type: updateRatingAction,
                      payload: +e.target.value,
                    })
                  }
                />
                <label>4.9</label>
              </Radio>
            </RadioInputContainer>
            <button id="more" type="submit">
              More
            </button>

            <button type="submit">Submit</button>
          </Form>
        </Controls>
      </MapAndControls>
    </Layout>
  )
}

export default IndexPage

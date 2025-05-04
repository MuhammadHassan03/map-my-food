/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import { gql } from "@apollo/client";
import {
  Button,
  Grid,
  InputAdornment,
  TextField,
  useMediaQuery,
  useTheme,
  Box,
  Typography,
} from "@mui/material";
import { GoogleMap, Marker } from "@react-google-maps/api";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Autocomplete from "@mui/material/Autocomplete";
import { restaurantList } from "../../../apollo/server";
import React, { useEffect, useState, useCallback } from "react";
import { useLocationContext } from "../../../context/Location";
import FlashMessage from "../../FlashMessage";
import useStyle from "./styles";
import { mapStyles } from "../../../screens/OrderDetail/mapStyles";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

const RESTAURANTS = gql`
  ${restaurantList}
`;

function SearchContainer({ isHome }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));
  const extraSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const classes = useStyle({ mobile, extraSmall });
  const [open, setOpen] = useState(false);
  const { setLocation } = useLocationContext();
  const navigateTo = useNavigate();
  const [alertError, setAlertError] = useState(null);
  const [map, setMap] = React.useState(false);
  const [trains, setTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [trainLocation, setTrainLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationMarkers, setStationMarkers] = useState([]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    loadMap();
    return () => {
      setMap(false);
    };
  }, []);

  const loadMap = async () => {
    setTimeout(() => {
      setMap(true);
    }, 100);
  };

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const response = await axios.get('https://api.pakraillive.com/api/Train/GetLiveTrains');
        if (response.data.IsSuccess) {
          setTrains(response.data.Response);
        }
      } catch (error) {
        console.error('Error fetching trains:', error);
        setAlertError('Failed to fetch trains data');
        setOpen(true);
      }
    };
    fetchTrains();
  }, []);

  useEffect(() => {
    if (!selectedTrain) return;

    const fetchStations = async () => {
      try {
        const response = await axios.get(`https://api.pakraillive.com/api/Train/GetTrainStationsByTrainId?id=${selectedTrain.TrainId}`);
        if (response.data.IsSuccess) {
          setStations(response.data.Response);
          const markers = response.data.Response.map(station => ({
            position: {
              lat: station.Latitude,
              lng: station.Longitude
            },
            title: station.StationName,
            isCrossed: station.IsCrossed
          }));
          setStationMarkers(markers);
        }
      } catch (error) {
        console.error('Error fetching stations:', error);
        setAlertError('Failed to fetch stations data');
        setOpen(true);
      }
    };

    fetchStations();
  }, [selectedTrain]);

  useEffect(() => {
    if (!selectedTrain) return;

    const updateTrainLocation = async () => {
      try {
        const stationsResponse = await axios.get(`https://api.pakraillive.com/api/Train/GetTrainStationsByTrainId?id=${selectedTrain.TrainId}`);
        if (stationsResponse.data.IsSuccess) {
          const stations = stationsResponse.data.Response;
          const currentStation = stations.find(station => !station.IsCrossed);
          if (currentStation) {
            setTrainLocation({
              lat: currentStation.Latitude,
              lng: currentStation.Longitude
            });
          }
        }

        try {
          const liveResponse = await axios.get(`https://api.pakraillive.com/api/Train/GetTrainLocation?trainId=${selectedTrain.TrainId}`);
          if (liveResponse.data.IsSuccess && liveResponse.data.Response) {
            setTrainLocation({
              lat: liveResponse.data.Response.Latitude,
              lng: liveResponse.data.Response.Longitude
            });
          }
        } catch (liveError) {
          console.log('Live location not available, using station location');
        }
      } catch (error) {
        console.error('Error fetching train location:', error);
      }
    };

    updateTrainLocation();
    const interval = setInterval(updateTrainLocation, 60000);

    return () => clearInterval(interval);
  }, [selectedTrain]);

  const handleFindRestaurants = () => {
    if (selectedStation) {
      setLocation({
        label: "Station",
        deliveryAddress: selectedStation.StationName,
        latitude: selectedStation.Latitude,
        longitude: selectedStation.Longitude,
      });
      navigateTo("/restaurant-list");
    }
  };

  const renderDropdowns = () => (
    <>
      <Autocomplete
        id="train-selection"
        getOptionLabel={(option) => option.TrainName || ''}
        options={trains}
        value={selectedTrain}
        onChange={(event, newValue) => {
          setSelectedTrain(newValue);
          setSelectedStation(null);
        }}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <Typography style={{ color: 'black' }}>{option.TrainName}</Typography>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            className={classes.textField}
            variant="outlined"
            placeholder="Select a train"
            fullWidth
            InputProps={{
              ...params.InputProps,
              style: { color: 'black' },
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon style={{ color: theme.palette.primary.main }} />
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      {selectedTrain && (
        <Autocomplete
          id="station-selection"
          getOptionLabel={(option) => option.StationName || ''}
          options={stations.filter(station => !station.IsCrossed)}
          value={selectedStation}
          onChange={(event, newValue) => {
            setSelectedStation(newValue);
            if (newValue) {
              setTrainLocation({
                lat: newValue.Latitude,
                lng: newValue.Longitude
              });
            }
          }}
          style={{ marginTop: '1rem' }}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Typography style={{ color: 'black' }}>{option.StationName}</Typography>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              className={classes.textField}
              variant="outlined"
              placeholder="Select a station"
              fullWidth
              InputProps={{
                ...params.InputProps,
                style: { color: 'black' },
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon style={{ color: theme.palette.primary.main }} />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      )}

      {selectedStation && (
        <Button
          variant="contained"
          color="primary"
          fullWidth
          disableElevation
          className={classes.button}
          style={{ marginTop: '1rem' }}
          onClick={handleFindRestaurants}
        >
          {t("findRestaurants")}
        </Button>
      )}
    </>
  );

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <Grid container className={classes.mainContainer}>
        <FlashMessage
          severity="error"
          alertMessage={alertError}
          open={open}
          handleClose={handleClose}
        />
        <Grid className={classes.temp} style={{ position: 'relative', height: '500px' }}>
          {map && (
            <GoogleMap
              mapContainerStyle={{
                height: "100%",
                width: "100%",
                flex: 1,
              }}
              zoom={10}
              center={trainLocation || {
                lat: 33.6844,
                lng: 73.0479,
              }}
              options={{
                styles: mapStyles,
                zoomControl: true,
                zoomControlOptions: {
                  position: window.google.maps.ControlPosition.RIGHT_CENTER,
                },
              }}
            >
              {trainLocation && (
                <Marker
                  position={trainLocation}
                  icon={{
                    url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                  title={`${selectedTrain?.TrainName} - Current Location`}
                />
              )}
              {stationMarkers.map((marker, index) => (
                <Marker
                  key={index}
                  position={marker.position}
                  icon={{
                    url: marker.isCrossed 
                      ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                      : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    scaledSize: new window.google.maps.Size(30, 30),
                  }}
                  title={marker.title}
                />
              ))}
            </GoogleMap>
          )}
        </Grid>
      </Grid>

      {mobile ? (
        <Grid
          container
          className={isHome ? classes.mobileheadingContainer : classes.mobileheadingContainerNotHome}
        >
          <Box className={classes.mobileBox} style={{ width: '100%', padding: '0 16px' }}>
            <Grid container>
              <Grid item xs={12}>
                {renderDropdowns()}
              </Grid>
            </Grid>
          </Box>
        </Grid>
      ) : (
        <Grid container className={classes.headingContainer}>
          <Grid item xs={1} md={1} />
          <Grid
            container
            item
            xs={10}
            md={10}
            lg={7}
            style={{ marginBottom: "8%" }}
          >
            <Grid container item xs={12} className={classes.searchContainer}>
              <Grid item xs={12}>
                {renderDropdowns()}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </div>
  );
}

export default React.memo(SearchContainer);

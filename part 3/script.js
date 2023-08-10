/**
https://dribbble.com/shots/11528804-Weather-Widget
**/
const WEATHER_API_KEY = "d860d1c7ae8a4fda9bd222436231904";
const widgetEl = document.getElementById("widget");
const loaderEl = document.getElementById("loader");
const tempEl = document.getElementById("temp");
const cityEl = document.getElementById("city");
const toggleEl = document.getElementById("toggle");
const toggleInputEl = document.getElementById("temp-toggle");
const flagEl = document.getElementById("flag");
const weatherImageEl = document.getElementById("weather-image"); // Add weather image element
const weatherDescriptionEl = document.getElementById("weather-description"); // Add weather description element


let tempC = -1;
let tempF = -1;
let city = "New York, NY";
let countryCode = '';


let temp = -1;
let time = 0;
const minTime = 1;
const maxTime = 900;

// http://upshots.org/actionscript/jsas-understanding-easing
function easeInQuad(t, b, c, d) {
    return c * (t /= d) * t + b;
}

function setData(newTemp, newCity) {
    tempEl.innerHTML = `${newTemp}°`;
    cityEl.innerHTML = `${newCity}`;
    temp = newTemp;
    city = newCity;
}

function setTemp(newTemp) {
    tempEl.innerHTML = `${newTemp}°`;
    cityEl.innerHTML = `${city}`;
    temp = newTemp;
}

function hideLoading() {
  loaderEl.style.display = 'none';
  toggleEl.style.display = 'inline-block';
}

function changeTemp(nextTemp) {
    const lower = Math.min(temp, nextTemp);
    const higher = Math.max(temp, nextTemp);
    const diff = higher - lower;
    const increase = nextTemp > temp;
    let currTemp = increase ? lower : higher;

    toggleInputEl.setAttribute("disabled", "true");
    for (let i = 0; i <= diff; i++) {
        (function(s) {
            const timer = setTimeout(function() {
                setTemp(increase ? currTemp++ : currTemp--);
                if (currTemp === nextTemp) {
                  toggleInputEl.removeAttribute("disabled");
                }
            }, time);
        })(i);

        time = easeInQuad(i, minTime, maxTime, diff);
    }

    temp = currTemp;
}


async function getLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;

            const url = `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}`;

            try {
                console.log(`fetch - ${url}`);
                const resp = await fetch(url);
                const data = await resp.json();
                if (data) {
                    const { address } = data;
                    const { city, village, state_district, state, country, country_code } = address;
                    let placeStr = "";
                    if (city || village || state_district) {
                      placeStr = `${city || village || state_district}, ${state || country}, ${country}`;
                    } else if (state && country) {
                      placeStr = `${state}, ${country}`;
                    } else if (country) {
                      placeStr = country;
                    }
                    countryCode = country_code;
                    resolve(placeStr);
                }
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    } else {
        return;
        console.log("Geolocation is not supported by this browser.");
    }
  });
}

async function getWeatherData() {
  try {
    if (navigator.userAgent.match(/chrome|chromium|crios/i)) {
      city = await getLocation();
    }
  } catch(e) {
    console.error(e);
  }

  const url =
      `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${city}`;

  try {
      console.log(`fetch - ${url}`);
      const resp = await fetch(url);
      const data = await resp.json();
      tempC = Math.round(data.current.temp_c);
      tempF = Math.round(data.current.temp_f);
      const weatherCondition = data.current.condition.text; // Get the weather condition
      console.log(weatherCondition);

      const weatherIcon = data.current.condition.icon; // Get the weather icon code
      weatherImageEl.src = `https:${weatherIcon}`; // Set the image source
      weatherImageEl.alt = weatherCondition; // Set the alt text
      weatherDescriptionEl.textContent = weatherCondition;

      hideLoading();
      setData(tempC, city);
  } catch (err) {
      hideLoading();
      console.error(err);
  }
}

getWeatherData();

toggleInputEl.addEventListener('change', function() {
  if (this.checked) {
    changeTemp(tempC);
  } else {
    changeTemp(tempF);
  }
});
const apiKey = "0a483d20e717191bc0a0c49aabc90a78";

function getIcon(cond) {
  const c = cond.toLowerCase();
  if (c.includes("rain")) return "cloud.png";
  if (c.includes("cloud")) return "cloud1.png";
  if (c.includes("clear")) return "sun.png";
  if (c.includes("snow")) return "moon.png";
  return "cloud1.png";
}

function isCityValid(name) {
  if (!name) {
    alert("Type a city.");
    return false;
  }
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    alert("Use letters and spaces only.");
    return false;
  }
  return true;
}

async function fetchData() {
  let inp = document.querySelector(".inputfield");
  let city = inp.value.trim();
  if (!isCityValid(city)) return;

  try {
    let geo = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
    let geoJson = await geo.json();
    if (!geoJson.length) throw new Error("No such place");

    let { lat, lon, name, state, country } = geoJson[0];
    let loc = [name, state, country].filter(Boolean).join(", ");
    document.getElementById("cityName").textContent = loc;

    let current = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    let cJson = await current.json();

    let forecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    let fJson = await forecast.json();

    let air = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    let aqi = await air.json();

    document.getElementById("cityTemp").innerHTML = `${cJson.main.temp.toFixed(1)} &deg;C`;
    document.getElementById("sky des").textContent = cJson.weather[0].description;

    let now = new Date();
    document.querySelector(".datecontainer h6").textContent = now.toLocaleDateString();
    document.querySelectorAll(".d-flex.gap-2 h6")[1].textContent = now.toLocaleTimeString();

    let aqiEls = document.querySelectorAll(".AQI .text-center");
    aqi.list.slice(0, 4).forEach((d, i) => {
      if (aqiEls[i]) {
        aqiEls[i].children[0].textContent = `AQI ${i + 1}`;
        aqiEls[i].children[1].textContent = d.main.aqi;
      }
    });

    let sr = new Date(cJson.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    let ss = new Date(cJson.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    let srE = document.querySelector(".AQI2 h5:nth-of-type(1)");
    let ssE = document.querySelector(".AQI2 h5:nth-of-type(2)");
    if (srE) srE.textContent = sr;
    if (ssE) ssE.textContent = ss;

    let boxes = document.querySelectorAll(".extramatris");
    if (boxes.length >= 4) {
      boxes[0].querySelectorAll("h6")[0].textContent = "Humidity";
      boxes[0].querySelectorAll("h6")[1].textContent = `${cJson.main.humidity}%`;
      boxes[1].querySelectorAll("h6")[0].textContent = "Wind Speed";
      boxes[1].querySelectorAll("h6")[1].textContent = `${cJson.wind.speed} m/s`;
      boxes[2].querySelectorAll("h6")[0].textContent = "Pressure";
      boxes[2].querySelectorAll("h6")[1].textContent = `${cJson.main.pressure} hPa`;
      boxes[3].querySelectorAll("h6")[0].textContent = "Feels Like";
      boxes[3].querySelectorAll("h6")[1].textContent = `${cJson.main.feels_like.toFixed(1)}°C`;
    }

    let box = document.querySelector(".nextfivedaysdiv > div");
    box.innerHTML = "";

    let fMap = new Map();
    for (let item of fJson.list) {
      let d = item.dt_txt.split(" ")[0];
      if (!fMap.has(d)) fMap.set(d, item);
      if (fMap.size === 5) break;
    }

    fMap.forEach((val, d) => {
      let t = val.main.temp.toFixed(1);
      let ic = getIcon(val.weather[0].main);
      let day = new Date(d).toLocaleDateString("en-US", { weekday: "long" });

      let row = document.createElement("div");
      row.className = "forecastrow d-flex justify-content-between align-items-center";
      row.style.padding = "8px 0";

      row.innerHTML = `
        <div class="d-flex gap-2 align-items-center">
          <img src="${ic}" alt="" width="35px">
          <h6>${t} &deg;C</h6>
        </div>
        <h6>${day}</h6>
        <h6>${new Date(d).toLocaleDateString()}</h6>
      `;

      box.appendChild(row);
    });

    let timeline = document.querySelectorAll(".todaytemp");
    for (let i = 0; i < 6; i++) {
      let slot = fJson.list[i];
      let tm = new Date(slot.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let ic = getIcon(slot.weather[0].main);
      let t = `${slot.main.temp.toFixed(1)} °C`;

      timeline[i].innerHTML = `
        <h5>${tm}</h5>
        <img src="${ic}" width="35px">
        <h5>${t}</h5>
      `;
    }

  } catch (e) {
    console.error("Oops!", e);
    alert("Couldn't load weather info.");
  }
}

document.querySelector(".inputfield").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    fetchData();
  }
});

document.querySelector(".searchicon").addEventListener("click", fetchData);

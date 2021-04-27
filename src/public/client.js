//const { update } = require("immutable")

let store = {
  apod: "",
  rovers: ["Curiosity", "Opportunity", "Spirit"],
  activeRover: {
    name: "Curiosity",
    photos: [],
    manifest: {},
  },
};

// add our markup to the page
const root = document.getElementById("root");

const updateStore = (store, newState) => {
  store = Object.assign(store, newState);
  console.log(store);
  render(root, store);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
};

// create content
const App = state => {
  let { rovers, activeRover } = state;

  return `
        <header></header>
        <main>
            ${ActiveRover(activeRover.name)}
            <section>
                <h3>Put things on the page!</h3>
                <p>${RoverPhotos(activeRover.photos)}</p>
                <p>${RoverManifest(activeRover.manifest)}</p>
                </section>
                </main>
                <footer></footer>
                `;
            };
            

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
  render(root, store);
});

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const ActiveRover = activeRover => {
  if (activeRover) {
    return `
            <h1>${activeRover}</h1>
        `;
  }

  return `
        <h1>Hello!</h1>
    `;
};

// Example of a pure function that renders infomation requested from the backend

const RoverPhotos = photos => {
  const PhotoElement = photo => {
    return `
    <li>
        <img src="${photo.img_src}"/>
        <span>${photo.earth_date}</span>
    </li>
    `;
  };
  if (photos.length === 0) getRoverPhotosOfTheDay(store);
  return `
    <ul>
        ${photos.map(photo => PhotoElement(photo))}
    </ul>
    `;
};

const RoverManifest = manifest => {
  const ManifestElement = value => {
    return `
        <li>
        <span>${value}</span>
    </li>`;
  };
  if (Object.values(manifest).length === 0) getRoverManifest(store);
  return `
    <ul>
        ${Object.values(manifest).map(value => ManifestElement(value))}
    </ul>
    `;
};

const ImageOfTheDay = apod => {
  // If image does not already exist, or it is not from today -- request it again
  const today = new Date();
  const photodate = apod.date && new Date(apod.date);
  //  console.log(photodate.getDate(), today.getDate());
  console.log(apod);
  // console.log(photodate.getDate() === today.getDate());
  if (!apod || apod.date === today.getDate()) {
    getImageOfTheDay(store);
  }

  // check if the photo of the day is actually type video!
  if (apod.media_type === "video") {
    return `
        <p>See today's featured video <a href="${apod.url}">here</a></p>
        <p>${apod.title}</p>
        <p>${apod.explanation}</p>
        `;
  } else {
    return `
        <img src="${apod.url}" height="350px" width="100%" />
        <p>${apod.explanation}</p>
        `;
  }
};

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = state => {
  let { apod } = state;

  fetch(`http://localhost:3000/apod`)
    .then(res => res.json())
    .then(apod => {
      apod = apod.image;
      // console.log(apod)
      updateStore(store, { apod });
    });

  return apod;
};

const getRoverPhotosOfTheDay = async state => {
  let {
    activeRover: { name, photos, manifest },
  } = state;
  let date = new Date().toISOString().slice(0, 10);
  date = "2021-04-24";
  try {
    const response = await fetch(
      `http://localhost:3000/photos/${name}/${date}`
    );
    const roverPhotos = await response.json();
    photos = roverPhotos.photos.photos;
    updateStore(store, { activeRover: { name, photos, manifest } });
  } catch (error) {
    console.log(error);
  }
};

const getRoverManifest = async state => {
  let {
    activeRover: { name, photos, manifest },
  } = state;
  let date = new Date().toISOString().slice(0, 10);
  date = "2021-04-24";
  try {
    const response = await fetch(`http://localhost:3000/manifest/${name}`);
    const roverManifest = await response.json();
    console.log(roverManifest);

    const manifest = roverManifest.manifest.photo_manifest;
    delete manifest.photos
    
    updateStore(store, { activeRover : {name, photos, manifest } });
  } catch (error) {
    console.log(error);
  }
};

// photo_manifest":{"name":"Curiosity","landing_date":"2012-08-06","launch_date":"2011-11-26","status":"active","max_sol":3098,"max_date":"2021-04-24","total_photos":489145,

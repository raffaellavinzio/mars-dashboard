let store = Immutable.fromJS({
  rovers: ["Curiosity", "Opportunity", "Spirit", "Perseverance"],
  activeRover: "",
  roversData: [
    { name: "Curiosity", photos: [], manifest: {} },
    { name: "Opportunity", photos: [], manifest: {} },
    { name: "Spirit", photos: [], manifest: {} },
    { name: "Perseverance", photos: [], manifest: {} },
  ],
});

// updateStore is not a pure function because it changes the global state
const updateStore = newState => {
  store = store.mergeDeep(newState);
};

// add our markup to the page
const root = document.getElementById("root");

const render = async (root, state) => {
  root.innerHTML = App(state);
};

// create content
const App = state => {
  const { activeRover, roversData, rovers } = state.toJS();
  const activeRoverData =
    activeRover && roversData.find(el => el.name === activeRover);

  return `
  <header>Mars Rovers</header>
  <main>
    <aside>
    ${RoverSelector(rovers, activeRover)}
    </aside>
    <section>
    ${activeRoverData && RoverPhotos(activeRoverData.photos)}
    </section>
    <article>${
      activeRoverData && RoverManifest(activeRoverData.manifest)
    }</article>
  </main>
  <footer>Udacity Intermediate Javascript Nanodegree P2</footer>
    `;
};

// listening for load event because page should load before any JS is called
const loadRoversData = async () => {
  const mergeRoverData = (name, data) => {
    const output = data.filter(el => el.name === name);
    return Object.assign(output[0], output[1]);
  };

  try {
    const rovers = store.getIn(["rovers"]);
    const getManifestPromises = rovers.map(name => getRoverManifest(name));
    const getPhotosPromises = rovers.map(name => getRoverPhotos(name));
    const results = await Promise.all([
      ...getManifestPromises,
      ...getPhotosPromises,
    ]);

    return rovers.map(name => mergeRoverData(name, results));
  } catch (error) {
    throw error; // re-throw the error unchanged
  }
};

// DOM event listener is not a pure function because it accesses and changes the global store with update and render
window.addEventListener("load", async () => {
  const merged = await loadRoversData();
  updateStore({ roversData: merged });
  render(root, store);
});

// DOM event listener is not a pure function because it accesses and changes the global store with update and render
root.addEventListener("click", async event => {
  const rovers = store.getIn(["rovers"]);
  if (rovers.includes(event.target.innerHTML))
    updateStore({ activeRover: event.target.innerHTML });
  render(root, store);
  carousel();
});

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information
const RoverSelector = (rovers, activeRover) => {
  return `
  <nav>
    ${rovers
      .map(rover =>
        rover === activeRover
          ? `<span class="active">${rover}</span>`
          : `<span>${rover}</span>`
      )
      .join("")}
  </nav>
  `;
};

// Pure function that renders infomation requested from the backend
const RoverPhotos = photos => {
  const PhotoElement = photo => {
    return `
        <img class="slide" src="${photo.img_src}"/>
        `;
  };
  //  <span>${photo.earth_date}</span>

  return `
        ${photos.map(photo => PhotoElement(photo)).join("")}
    `;
};

const RoverManifest = manifest => {
  const ManifestElement = (key, value) => {
    return `
        <p>
        ${key.replace('_', ' ').replace('max', 'latest')}
        <span>${value}</span>
    </p>`;
  };

  return `
        ${Object.entries(manifest)
          .map(([key, value]) => ManifestElement(key, value))
          .join("")}
    `;
};

// ------------------------------------------------------  API CALLS

const getRoverPhotos = async rover => {
  try {
    const response = await fetch(`http://localhost:3000/photos/${rover}`);
    const roverPhotos = await response.json();

    const photos = roverPhotos.photos.latest_photos;
    return { name: rover, photos };
  } catch (error) {
    throw error; // re-throw the error unchanged
  }
};

const getRoverManifest = async rover => {
  try {
    const response = await fetch(`http://localhost:3000/manifest/${rover}`);
    const roverManifest = await response.json();

    const manifest = roverManifest.manifest.photo_manifest;
    delete manifest.photos;

    return { name: rover, manifest };
  } catch (error) {
    throw error; // re-throw the error unchanged
  }
};

// ------------------------------------------------------  CAROUSEL
let slideIndex = 0;

function carousel() {
  let x = document.getElementsByClassName("slide");
  for (let i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > x.length) {
    slideIndex = 1;
  }
  x[slideIndex - 1].style.display = "block";
  setTimeout(carousel, 3000);
}

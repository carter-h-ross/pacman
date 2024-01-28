function createMapArray(sizeX,sizeZ) {
    const map = [];
    for (let z = 0; z < sizeZ; z++) {
      const row = [];
      for (let x = 0; x < sizeX; x++) {
        if (z === 0 || z === sizeZ - 1 || x === 0 || x === sizeX - 1) {
          row.push(1); 
        } else {
          row.push(0); 
        }
      }
      map.push(row); 
    }    
    console.log(map);
    return map;
}

const mapContainer = document.getElementById('map-container');
const gridSizeX = 0;
const gridSizeZ = 0; 
let topLeftX = 0;
let topLeftZ = 0;

function createMap(size) {
  for (let z = 0; z < size; z++) {
    for (let x = 0; x < size; x++) {
      const button = document.createElement('button');
      button.classList.add('grid-button');
      button.setAttribute('data-x', x);
      button.setAttribute('data-z', z);
      button.addEventListener('click', fillTile);
      mapContainer.appendChild(button);
    }
  }
}

function handleArrowKeys(event) {
  const key = event.key;
  switch (key) {
    case 'ArrowUp':
      if (topLeftZ > 0) {
        topLeftY--;
      }
      break;
    case 'ArrowDown':
      if (topLeftZ < gridSize - 1) {
        topLeftY++;
      }
      break;
    case 'ArrowLeft':
      if (topLeftX > 0) {
        topLeftX--;
      }
      break;
    case 'ArrowRight':
      if (topLeftX < gridSize - 1) {
        topLeftX++;
      }
      break;
    default:
      break;
  }
  updateGridPosition();
}

function updateGridPosition() {
  const buttons = document.querySelectorAll('.grid-button');
  buttons.forEach(button => {
    const x = parseInt(button.getAttribute('data-x'));
    const y = parseInt(button.getAttribute('data-z'));
    button.style.transform = `translate(${(x - topLeftX) * 30}px, ${(y - topLeftY) * 30}px)`; // Adjust button position based on top left corner
  });
}

document.addEventListener('keydown', handleArrowKeys);
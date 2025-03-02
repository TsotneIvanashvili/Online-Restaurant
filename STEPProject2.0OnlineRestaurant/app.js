let section = document.querySelector("section");
let ul = document.querySelector("ul");

let spicinessSlider = document.getElementById("spicinessSlider");
let spicinessLabel = document.getElementById("spicinessLabel");
let noNutsCheckbox = document.getElementById("noNutsCheckbox");
let vegetarianCheckbox = document.getElementById("vegetarianCheckbox");
let applyFilterButton = document.getElementById("applyFilterButton");
let resetButton = document.getElementById("resetButton");

let currentPage = 0;
let itemsPerPage = 9;
let currentData = [];

let paginationContainer = document.createElement("div");
paginationContainer.className = "pagination-container";

let prevButton = document.createElement("button");
prevButton.innerHTML = "&larr;";
prevButton.className = "pagination-arrow";
prevButton.addEventListener("click", function() {
  if (currentPage > 0) {
    currentPage = currentPage - 1;
    updateDisplay();
  }
});

let nextButton = document.createElement("button");
nextButton.innerHTML = "&rarr;";
nextButton.className = "pagination-arrow";
nextButton.addEventListener("click", function() {
  let maxPage = Math.floor((currentData.length - 1) / itemsPerPage);
  if (currentPage < maxPage) {
    currentPage = currentPage + 1;
    updateDisplay();
  }
});

paginationContainer.appendChild(prevButton);
paginationContainer.appendChild(nextButton);

function updateDisplay() {
  let start = currentPage * itemsPerPage;
  let end = start + itemsPerPage;
  let dishesContainer = document.querySelector('.dishes');

  dishesContainer.classList.add('fade-out');
  
  setTimeout(function() {
    let dishHTML = "";
    let currentDishes = currentData.slice(start, end);
    
    for (let i = 0; i < currentDishes.length; i++) {
      dishHTML += card(currentDishes[i]);
    }
    
    dishesContainer.innerHTML = dishHTML;
    dishesContainer.classList.remove('fade-out');
    dishesContainer.classList.add('fade-in');
    
    dishesContainer.appendChild(paginationContainer);
    
    setTimeout(function() {
      dishesContainer.classList.remove('fade-in');
    }, 300);
  }, 300);
}

spicinessSlider.addEventListener("input", function() {
  let value = parseInt(spicinessSlider.value);
  if (value === -1) {
    spicinessLabel.textContent = "Spiciness: Not Chosen";
  } else {
    spicinessLabel.textContent = "Spiciness: " + value;
  }
});

applyFilterButton.addEventListener("click", function() {
  let filters = {
    spiciness: spicinessSlider.value !== "-1" ? parseInt(spicinessSlider.value) : null,
    nuts: noNutsCheckbox.checked ? false : null,
    vegeterian: vegetarianCheckbox.checked ? true : null
  };

  let queryParams = new URLSearchParams();
  
  for (let key in filters) {
    if (filters[key] !== null) {
      queryParams.append(key, filters[key]);
    }
  }

  fetch("https://restaurant.stepprojects.ge/api/Products/GetFiltered?" + queryParams)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      currentData = data;
      currentPage = 0;
      updateDisplay();
    })
    .catch(function(error) {
      console.log("Filter error:", error);
    });
});

resetButton.addEventListener("click", function() {
  spicinessSlider.value = -1;
  spicinessLabel.textContent = "Spiciness: Not Chosen";
  noNutsCheckbox.checked = false;
  vegetarianCheckbox.checked = false;
  getAllCards();
});

fetch("https://restaurant.stepprojects.ge/api/Categories/GetAll")
  .then(function(pasuxi) {
    return pasuxi.json();
  })
  .then(function(data) {
    console.log(data);
    for (let i = 0; i < data.length; i++) {
      ul.innerHTML += '<div class="hr"></div><li onclick="getfoodByID(' + data[i].id + ')">' + data[i].name + '</li>';
    }
  });

function getAllCards() {
  section.innerHTML = "";
  fetch("https://restaurant.stepprojects.ge/api/Products/GetAll")
    .then(function(pasuxi) {
      return pasuxi.json();
    })
    .then(function(data) {
      currentData = data;
      currentPage = 0;
      updateDisplay();
    });
}

function getfoodByID(id) {
  section.innerHTML = "";
  fetch("https://restaurant.stepprojects.ge/api/Categories/GetCategory/" + id)
    .then(function(pasuxi) {
      return pasuxi.json();
    })
    .then(function(data) {
      currentData = data.products;
      currentPage = 0;
      updateDisplay();
    });
}

function card(item) {
  let nutsDotClass, nutsText;
  if (item.nuts) {
    nutsDotClass = "green";
    nutsText = "Nuts";
  } else {
    nutsDotClass = "grey-border";
    nutsText = "Nuts";
  }

  let vegetarianDotClass, vegetarianText;
  if (item.vegeterian) {
    vegetarianDotClass = "green";
    vegetarianText = "Vegetarian";
  } else {
    vegetarianDotClass = "grey-border";
    vegetarianText = "Vegetarian";
  }

  return `    
    <div id= "card">
        <img class="cardImg" src="${item.image}" alt="">
        <h3>${item.name}</h3>
        <h4>Spiciness: ${item.spiciness}</h4>
        <div class="ingredients">
            <p>
              <span class="dot ${nutsDotClass}"></span>
              ${nutsText}
            </p>
            <p>
              <span class="dot ${vegetarianDotClass}"></span>
              ${vegetarianText}
            </p>
        </div>
        <div class="adjustment">
        <h3>${item.price}$</h3>
        <a class="add" onclick="addtoCart(${item.id}, ${item.price}, '${item.name}', '${item.image}')">Add To Cart</a>
        </div>
    </div>`;
}

function addtoCart(id, price, name, image) {
  let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
  let found = false;
  
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === id) {
      cart[i].quantity += 1;
      found = true;
      break;
    }
  }
  
  if (!found) {
    cart.push({
      id: id,
      name: name,
      price: price,
      image: image,
      quantity: 1
    });
  }
  
  sessionStorage.setItem('cart', JSON.stringify(cart));

  fetch("https://restaurant.stepprojects.ge/api/Baskets/AddToBasket", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quantity: 1,
      price: price,
      productId: id
    })
  }).then(function() {
    alert(name + " Added To Cart");
  });
}

getAllCards();
//Setting up username
sessionStorage.setItem("username", "jingalala");

//api endpoint
apiEndpoint = "http://localhost:3000/api";

// Defining api calling function

function makeApiCall(method, operation, paramsList=[]){
    var jsonReq = new XMLHttpRequest();
    var params = "";

    for(var i=0; i<paramsList.length; i++){
        params += paramsList[i]+"/";
    }
    jsonReq.open(method, apiEndpoint+"/"+operation+"/"+params, false);//synchronous
    jsonReq.onload = () => {
        returnVal = jsonReq.response;
        //console.log("request complete ("+apiEndpoint+"/"+operation+"/"+params+")");
    };
    jsonReq.send();

    try{
        return JSON.parse(jsonReq.responseText);
    }
    catch(err){
        return;
    }
    
}

// element creation functions

async function createListing(gameId, listingType="recomm"){

    console.log("creating listing for "+gameId);
    const gameData = await makeApiCall("GET", "getGameInfo", [gameId]);
    const username = sessionStorage.getItem("username");

    if(listingType == "recomm"){
        var coverImg = document.createElement("img");
        coverImg.className = "coverImg";
        coverImg.src = gameData.image;
        coverImg.width = "200";
        coverImg.height = "200";
        coverImg.setAttribute("data-gameId", gameId);

        var gameName = document.createElement("p");
        gameName.innerHTML = gameData.name;
        gameName.className = "gameName";
        
        var gamePrice = document.createElement("p");
        gamePrice.innerHTML = "₹ "+gameData.price;
        gamePrice.className = "gamePrice";

        var br = document.createElement("br");

        var addCartButton = document.createElement("button");
        addCartButton.innerHTML = "Add to Cart";
        addCartButton.className = "add_cart";
        addCartButton.addEventListener("click", () => {addToCart(username, gameId)});
        addCartButton.setAttribute("data-gameId", gameId);

        var listing = document.createElement("div");
        listing.className = "recomm_listing";
        listing.appendChild(coverImg);
        listing.appendChild(gameName);
        listing.appendChild(gamePrice);
        listing.appendChild(br);
        listing.appendChild(addCartButton);
    }

    else if(listingType == "cart"){
        var coverImg = document.createElement("img");
        coverImg.className = "coverImg";
        coverImg.src = gameData.image;
        coverImg.width = "100";
        coverImg.height = "100";
        coverImg.setAttribute("data-gameId", gameId);

        var gameName = document.createElement("p");
        gameName.innerHTML = gameData.name;

        var gamePrice = document.createElement("p");
        gamePrice.innerHTML = "₹ "+gameData.price;

        var removeCartButton = document.createElement("button");
        removeCartButton.innerHTML = "remove";
        removeCartButton.className = "remove_cart";
        removeCartButton.addEventListener("click", () => {removeFromCart(gameId)});
        removeCartButton.setAttribute("data-gameId", gameId);

        var listing = document.createElement("div");
        listing.className = "cart_listing";
        listing.appendChild(coverImg);
        listing.appendChild(gameName);
        listing.appendChild(gamePrice);
        listing.appendChild(removeCartButton);
    }
    
    return listing;
}


// defining listing insertion functions

async function insertNewReleases(){
    var newReleases = await makeApiCall("GET", "getLatestGames");
    var newReleasesFieldset = document.getElementById("new_releases").children[0];
    for(var i=0; i<newReleases.length; i++){
        var listing = await createListing(newReleases[i]);
        newReleasesFieldset.appendChild(listing);
    }
}

async function insertRecommended(){
    var username = sessionStorage.getItem("username");
    var recommendedGames = await makeApiCall("GET", "getRecommendedGames", [username]);
    var recommendedFieldset = document.getElementById("recommended").children[0];
    for(var i=0; i<recommendedGames.length; i++){
        var listing = await createListing(recommendedGames[i]);
        recommendedFieldset.appendChild(listing);
    }
}




// Defining game data retrieval function

// function getGameData(requestingDiv){
//     var gameId = requestingDiv.getAttribute("data-gameId");
//     var divType = requestingDiv.className;
//     var gameData = makeApiCall("GET", "getGameInfo", [gameId]);

//     if(divType == "fullGameInfo"){
//         requestingDiv.children[1].innerHTML = gameData.name;
//         requestingDiv.children[2].innerHTML = "₹ "+gameData.price;
//         requestingDiv.children[3].innerHTML = gameData.description;
//     }
//     else if(divType == "listing"){
//         requestingDiv.children[1].src = gameData.image;
//         requestingDiv.children[3].innerHTML = "₹ "+gameData.price;
//     }

// }

// Defining cart adding function

// async function addToCart(requestingButton){
//     console.log("requesting button"+requestingButton);
//     var username = sessionStorage.getItem("username");
//     var gameId = requestingButton.data-gameId;
//     await makeApiCall("POST", "addToCart", [username, gameId]);
//     updateCartButton();
//     updateCart();
// }

async function addToCart(username, gameId){
    await makeApiCall("POST", "addToCart", [username, gameId]);
    updateCart();
    showCart();
}

// Defining cart removal function

async function removeFromCart(gameId){
    var username = sessionStorage.getItem("username");
    await makeApiCall("POST", "removeFromCart", [username, gameId]);
    updateCart();
}


// Defining cart clearing function

async function clearCart(){
    var username = sessionStorage.getItem("username");
    await makeApiCall("POST", "clearCart", [username]);
    updateCart();
}

// defining cart update function


async function updateCart(){
    var username = sessionStorage.getItem("username");
    var cart = await makeApiCall("GET", "getCart", [username]);
    console.log("retrived cart: "+cart);
    var cartButton = document.getElementById("cart");
    cartButton.innerHTML = "<img src='Images/shopping-cart-24.png', width = '25%', height = '25%'> ("+String(cart.length)+")";

    var cart_content_div = document.getElementById("cart_content");
    cart_content_div.innerHTML = "";
    for(var i=0; i<cart.length; i++){
        var listing = await createListing(cart[i], "cart");
        cart_content_div.appendChild(listing);
    }
}

function closeCart(){
    document.getElementById('cart_overlay').style.display='none';
}

function showCart(){
    document.getElementById("cart_overlay").style.display="block";
}
import fetch from 'node-fetch';

const usersApiUrl = "https://fakestoreapi.com/users";
const cartsApiUrl = "https://fakestoreapi.com/carts";
const productsApiUrl = "https://fakestoreapi.com/products";


export const manageAPIDataProgram = async() => {

     /*fetches data from api to variables, they are lists of objects */
    const getAPIData = async (url) => {
        return await fetch(url)
        .then((res) => res.json())
        .then((resJson) => {return resJson});
    
        
    }

    const usersData = await getAPIData(usersApiUrl);
    const cartsData = await getAPIData(cartsApiUrl);
    const productsData = await getAPIData(productsApiUrl);

    const allCategoriesAntTotalValues = () => {

        /*this function checks all product categories in producstData list and makes array with only unique values*/
        let categoriesArray = (productsData.map(product => product.category)).filter((x, i, a) => a.indexOf(x) == i);


        // let categoriesAndTotalValues = categoriesArray.reduce((acc, curr) => (acc[curr]='a', acc), {}); //alternative way

        /*first, i make empyt object. Then for every category in ategoriesArray, i make a key with value = 0,
        when key is a value from categoriesArray. I chose this solution, not the one above, because i think, it's easier to understand*/
        let categoriesAndTotalValues = {}; categoriesArray.forEach(key => categoriesAndTotalValues[key] = 0);

        /*for every key in categoriesAndTotalValues object, im checking every product from fetched data for a price of a product
        with the same category as the specific key. If it is, value of this product is added to the value of specific category*/
        Object.keys(categoriesAndTotalValues).forEach(key => {
            productsData.map(product => {
                if(key == product.category) {
                    categoriesAndTotalValues[key] += product.price;
                }
            })
        });

        return categoriesAndTotalValues;

    }






    const findUserByID = id => usersData.find(user => user.id === id);


    const getFullNameOfUser = user => Object.keys(user.name).reduce((res, v) => {
        return res.concat(user.name[v].charAt(0).toUpperCase() + user.name[v].slice(1));
    }, []).join(' ');




    /*Function which finds the cart with the highest value of all products from fetched cartsData */
    function findHighestValueCart() {

        /*Arrow function which gets product object with specified id */
        const getProductById = id => productsData.find((product) => { return product.id === id});

        /*Arrow funcion which calculates sum of all products of specified cart object */
        const calculateCartValue = cart => {
            let sum = 0;
            cart.products.forEach(product => {sum += (parseFloat(getProductById(product.productId).price) * parseInt(product.quantity))});
            return sum;
        };


        let highestValCart = {};
        let highestSumOfProductsInCart;
        
        /*Finds the cart with highest value */

        //1st solution
        // cartsData.forEach(cart => {
        //     let suma = calculateCartValue(cart);
        //     if (suma > highestSumOfProductsInCart) {
        //         highestSumOfProductsInCart = suma;
        //         highestValCart = cart;
        //     }
        // });

        //2nd solution
        highestValCart = cartsData.reduce((prevCart, currCart) => (calculateCartValue(prevCart) > calculateCartValue(currCart)) ? prevCart : currCart);
        highestSumOfProductsInCart = calculateCartValue(highestValCart);

        /*Finds owner of the this cart */
        let owner = findUserByID(highestValCart.userId);

        /*Full name as string with capital name and lastname*/
        let ownerOfHighestValCartFullName = getFullNameOfUser(owner);


        console.log("The highest value of products in cart is:  " + highestSumOfProductsInCart + " and the owner of this cart is: " + ownerOfHighestValCartFullName);
        // console.log(ownerOfHighestValCartFullName);

        return highestValCart;
        

    }


    function findFurthestLivingUsers() {

        /*Function for calculating distance beetwen two points, which latitudes and longitudes are specified */
        function calculateDistance(lat1, lon1, lat2, lon2) {
            let p = 0.017453292519943295;    // Math.PI / 180
            let c = Math.cos;
            let a = 0.5 - c((lat2 - lat1) * p)/2 + 
                    c(lat1 * p) * c(lat2 * p) * 
                    (1 - c((lon2 - lon1) * p))/2;
        
            return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
        };

        let aUserID;
        let bUserID;
        let distance = 0;
        let n = usersData.length;
        
        /*For loop checks every distance between every pair, and if it's greatest than previous, it saves users id and distance into variables */
        for (let i=0; i<n-1; i++)
            for (let j=i+1; j<n; j++) {
            let latA, longA, latB, longB;
            latA = parseFloat(usersData[i].address.geolocation.lat);
            longA = parseFloat(usersData[i].address.geolocation.long);
            latB = parseFloat(usersData[j].address.geolocation.lat);
            longB = parseFloat(usersData[j].address.geolocation.long);
            
            if(calculateDistance(latA, longA, latB, longB) > distance){
                aUserID = usersData[i].id;
                bUserID = usersData[j].id;
                distance = calculateDistance(latA, longA, latB, longB);
            }
        }
            
      
        console.log("Users living furthest away from each other are: " + getFullNameOfUser(findUserByID(aUserID)) + " and " + getFullNameOfUser(findUserByID(bUserID)) + ", distance between them is: " + distance + " km");
        return [findUserByID(aUserID), findUserByID(bUserID)]
    }

    console.log(allCategoriesAntTotalValues());
    console.log(findHighestValueCart());
    console.log(findFurthestLivingUsers());


    }



manageAPIDataProgram();




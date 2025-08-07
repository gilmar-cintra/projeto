function search() {
  //Get keyword value from input
  var keyword = document.getElementById("keyword").value.trim();

   if (!keyword) {
    alert("Please enter a keyword.");
    return;
  }
  //Generate URL to send request
  var url = "http://localhost:3000/api/scrape?keyword=" + keyword;

  var xhr = new XMLHttpRequest();

   // Show loading spinner
  document.getElementById("loading").style.display = "block";

  // Clear previous results
  document.getElementById("result").innerHTML = "";

  ///Callback function when request is complete
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {

      //Parse response to JSON
      var data = JSON.parse(xhr.responseText);

      // hide loading spinner
      document.getElementById("loading").style.display = "none";

      //Call function to Display products
      displayProducts(data.products);
    }
  };
  
  //Send request
  xhr.open("GET", url, true);
  xhr.send();
}

function displayProducts(products) {
  //Get result div
  const resultDiv = document.getElementById("result");

  // Clear previous results
  resultDiv.innerHTML = ''; 
  
  // Verify if there are no products
  if (!products || products.length === 0) {
    resultDiv.innerHTML = '<div class="alert alert-warning">No products found.</div>';
    return;
  }

 
  // Create a row container
  const rowDiv = document.createElement('div');
  rowDiv.className = 'row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4';
  
  // Loop through each product and create a column for each one
  products.forEach(product => {
    const colDiv = document.createElement('div');
    colDiv.className = 'col';
    
    colDiv.innerHTML = `
      <div class="card h-100">
        <img src="${product.imageUrl}" class="card-img-top p-3" alt="${product.title}" style="height: 200px; object-fit: contain;">
        <div class="card-body">
          <h5 class="card-title" style="font-size: 1rem;">${product.title}</h5>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge bg-warning text-dark">
              <i class="bi bi-star-fill"></i> ${product.rating}
            </span>
            <small class="text-muted">${product.reviewsCount} reviews</small>
          </div>
        </div>
      </div>
    `;
    
    rowDiv.appendChild(colDiv);
  });
  
  // Append the row container to the result div
  resultDiv.appendChild(rowDiv);
}
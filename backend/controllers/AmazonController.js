// Import necessary modules
const axios = require('axios');
const { JSDOM } =  require("jsdom");

exports.getProducts = async (req, res, next) => {
    const { keyword } = req.query;

    // Check if keyword is provided
    if (!keyword) {
        return res.status(400).json({
            success: false,
            error: 'The keyword is required'
        });
    }

    // Fetch products from Amazon, we need to use a user agent to avoid being blocked by Amazon
    await axios.get(`https://www.amazon.com/s?k=${keyword}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        }
    }).then(response => {
        
        // Parse the HTML response
        const dom = new JSDOM(response.data);

        // Select all product elements
        const products = dom.window.document.querySelectorAll('.s-result-item');
        
        // Initialize an empty array to store product information
        const productList = [];
        
        // Loop through each product element
        products.forEach(product => {
            // 1. Product Title
            /*
            Try to find the title element in one of the following structures:
            <h2><a href="/produto-x"><span>Nome do Produto</span></a></h2>
            or
            <div data-cy="title-recipe"><h2><span>Nome da Receita</span></h2></div>
            */
            const titleElement = product.querySelector('h2 a span, [data-cy="title-recipe"] h2 span');

            // Extract the title text
            const title = titleElement ? titleElement.textContent.trim() : null;
            
            // 2. Rating (stars out of five)
            /*
            Try to find the rating element in one of the following structures:
           <div class="a-icon-star-mini"><span class="a-icon-alt">4.3 de 5 estrelas</span></div>
            or
            <span class="a-icon-alt">4.3 out of 5 stars</span>
            */
            const ratingElement = product.querySelector('.a-icon-star-mini .a-icon-alt, .a-icon-alt');
            //start rating with null
            let rating = null;
            if (ratingElement) {
                const ratingText = ratingElement.textContent;
                // Extract the number from the string "4,6 out of 5 stars" or similar. Use regex to match the number
                const ratingMatch = ratingText.match(/(\d+[,.]?\d*)\s*de\s*5|(\d+[,.]?\d*)\s*out\s*of\s*5/i);
                if (ratingMatch) {
                    rating = parseFloat((ratingMatch[1] || ratingMatch[2]).replace(',', '.'));
                }
            }
            
            // 3. Number of reviews
            //Select any element that contains a attribute aria-label witch the text "classificações" or "ratings"
            const reviewsElement = product.querySelector('[aria-label*="classificações"], [aria-label*="ratings"]');
            let reviewsCount = null;
            if (reviewsElement) {
                const reviewsText = reviewsElement.getAttribute('aria-label');
                // Extract the number of reviews
                const reviewsMatch = reviewsText.match(/([\d.,]+)\s*(classificações|ratings)/i);
                if (reviewsMatch) {
                    // Replace all dots and commas with nothing and convert to integer
                    reviewsCount = parseInt(reviewsMatch[1].replace(/[.,]/g, ''));
                }
            }
            
            // 4. Product image URL
            // Select the image element
            const imageElement = product.querySelector('.s-image');
            const imageUrl = imageElement ? imageElement.getAttribute('src') : null;
            
            // Only add the product to the list if it has a title
            if (title) {
                productList.push({
                    title: title,
                    rating: rating,
                    reviewsCount: reviewsCount,
                    imageUrl: imageUrl,
                });
            }
        });
        
        // Return the list of products
        res.json({
            success: true,
            products: productList
        });
        
    }).catch(error => {
        // Log the error and return a generic error message
        console.error('Error fetching products from Amazon:', error);

        // Return a 500 error
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar produtos da Amazon'
        });
    });
};
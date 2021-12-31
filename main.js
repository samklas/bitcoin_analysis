
// Format UNIX timestamp to UTC date
function formatToUTC(timestamp) {
    const date = new Date(timestamp);
    const dayUTC = date.getUTCDate();
    const monthUTC = date.getUTCMonth();
    const yearUTC = date.getUTCFullYear();
    return `${dayUTC}.${monthUTC+1}.${yearUTC}`; 
}


function findBearishTrends(data){
    let trendCount = 0;
    const bearishTrends = [];
    for (let i = 0; i < data.length; i++){
        // Check if the array has values left. If not, push the trendCount value to the array and break the loop.
        if (data[i + 1] == undefined){
            bearishTrends.push(trendCount);
            break;
        } else {
            // Check if the price of day "N" is higher than "N + 1".
            if (data[i][1] > data[i+1][1]){
                trendCount++;
            } else {
                bearishTrends.push(trendCount);
                trendCount = 0;
            }
        }
    }
    // Find the longest bearish trend from the array
    const longestBearishTrend = Math.max(...bearishTrends);
    switch (longestBearishTrend) {
        case 0:
            document.getElementById('bearish-trend').innerHTML = 'The longest bearish trend: None';
            break;
        case 1:
            document.getElementById('bearish-trend').innerHTML = `The longest bearish trend: ${longestBearishTrend} day`;
            break;
        default:
            document.getElementById('bearish-trend').innerHTML = `The longest bearish trend: ${longestBearishTrend} days`;
    }
}


function findHighestVolume(data){
    const volumes = [];
        //  Loop through the data and push value of the volumes to a new array.
        for (let i = 0; i < data.length; i++) {
            volumes.push(data[i][1]);
        }
        //  Find the highest volume, index of it and the timestamp for it
        const highestVolume = Math.max(...volumes);
        const indexOfVolume = volumes.indexOf(highestVolume);
        const timestamp = data[indexOfVolume][0];
        // Format the timestamp to more readable format
        const formattedDate = formatToUTC(timestamp);
        document.getElementById('highest-volume').innerHTML = `The highest trading volume: ${formattedDate} - ${(Math.round(highestVolume).toLocaleString())}€`;
}


function findMaximumProfit(data){
    let priceDifference = 0;
    let buyDate = 0;
    let sellDate = 0;
    // Find the largest difference between all the prices
    for (let i = 0; i < data.length; i++) {
        for (let j = i; j < data.length; j++) {
            if (data[j][1] - data[i][1] > priceDifference) {
                priceDifference = data[j][1] - data[i][1];
                buyDate = data[i][0];
                sellDate = data[j][0];
            }
        }
    }
    // If the difference is unchanged the price has been only decreasing
    if (priceDifference == 0) {
        document.getElementById('dates').innerHTML = 'The price has been only decreasing in a given date range.';
    } else {
        const formattedBuyDate = formatToUTC(buyDate);
        const formattedSellDate = formatToUTC(sellDate);
        document.getElementById('dates').innerHTML = `The best date to buy: ${formattedBuyDate} - The best date to sell: ${formattedSellDate}`;
    }
}


function getDailyData(data) {
    const dailyData = [];
    // Get the first available datapoint and push it to the array
    dailyData.push(data[0])
    // Loop through the data and get the UTC date
    for (let i = 0; i < data.length; i++){
        // If there is no values left in the array, break the loop
        if (data[i+1] == undefined){
            break;
        } else {
            let date = new Date(data[i][0]);
            let dayUTC = date.getUTCDate();
            let nextDate = new Date(data[i+1][0]);
            let nextDayUTC = nextDate.getUTCDate();
            // If the day changes, get the first available datapoint from the next day (can be 00:00 UTC)
            if (dayUTC != nextDayUTC){
                dailyData.push(data[i + 1])
            }
        }
    }
    return dailyData;
}


// The "main" function is called when the user clicks the 'Search' button on the page
document.getElementById('search-button').addEventListener('click', function (){
    // 90 days in seconds
    const nintyDays = 90 * 24 * 60 * 60;
    // 1 hour in seconds
    const hourInSeconds = 3600;

    // Get start date and end date for the date range set by user. Then convert dates to UNIX timestamps in seconds
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const currentDate = new Date();
    const startDateUNIX = Date.parse(startDate) / 1000;
    const endDateUNIX = Date.parse(endDate) / 1000 + hourInSeconds;
    const currentDateUNIX = Date.parse(currentDate) / 1000;

    // Basic validation for the dates
    if (!startDate || !endDate) {
        alert('Invalid dates. Please try again!');
    } else if (startDateUNIX > endDateUNIX) {
        alert('Start date cannot be after the end date. Please try again!')
    } else if (startDateUNIX > currentDateUNIX || endDateUNIX > currentDateUNIX) {
        alert ('Dates cannot be in the future. Please try again!')
    } else {
        // Generate Coin Gecko API URL
        const apiURL = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from=${startDateUNIX}&to=${endDateUNIX}`;

        // Using fetch() to get data from the Coin Gecko API
        fetch(apiURL)
            .then(response => response.json())
            .then(data => {
                // If the date range is 90 days or less, the API will provide data hourly instead of daily. Check if the date range is 90 days or less. If it is true, use "getDailyData" function to get daily prices and daily volumes.
                if (endDateUNIX - startDateUNIX <= nintyDays){
                    const dailyPrices = getDailyData(data.prices);
                    const dailyVolumes = getDailyData(data.total_volumes);
                    findBearishTrends(dailyPrices);
                    findHighestVolume(dailyVolumes);
                    findMaximumProfit(dailyPrices);
                } else {
                    findBearishTrends(data.prices);
                    findHighestVolume(data.total_volumes);
                    findMaximumProfit(data.prices);
                }
            });
    }
});










   

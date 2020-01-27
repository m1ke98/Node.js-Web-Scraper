// LinkedIn Web Scraper

const fs = require('fs');
const puppeteer = require('puppeteer');

// My target url
const url = 'https://www.linkedin.com/jobs/search?keywords=Mechanical%20Engineering&location=Philadelphia%2C%20Pennsylvania%2C%20United%20States&trk=guest_job_search_jobs-search-bar_search-submit&redirect=false&position=1&pageNum=0&f_E=2';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // Check if the 'See More Jobs' button is visible
    const btnClass = '.see-more-jobs';
    const isElementVisible = async (page, btnClass) => {
        let visible = true;
        await page.waitForSelector(btnClass, { visible: true, timeout: 1500 })
            .catch(() => {
                visible = false;
            });
        return visible;
    };

    // Click 'See More Jobs' button until the button is no longer visible
    let loadMoreVisible = await isElementVisible(page, btnClass);
    while (loadMoreVisible) {
        await page.click(btnClass)
            .catch(() => {});
        loadMoreVisible = await isElementVisible(page, btnClass);
    }

    // Scrape the job information from the url
    let jobListings = await page.evaluate(() => {
        let jobs = [];

        // Find '.result-card' selector
        let jobElms = document.querySelectorAll('.result-card');
        jobElms.forEach((jobelement) => {
            let jobJson = {};

            // Take text infromation from their CSS selectors
            try {
                jobJson.Title = jobelement.querySelector('.result-card__title').innerText;
                jobJson.Company = jobelement.querySelector('.result-card__subtitle').innerText;
                jobJson.Location = jobelement.querySelector('.job-result-card__location').innerText;
            }
            catch (exception){
            }
            jobs.push(jobJson);
        });
        return jobs;
    });
    console.log(jobListings);

    // Create a json file to hold all colleted data
    fs.writeFile('jobs.json', JSON.stringify(jobListings),  (err) => {
        if (err) throw err;
        else {
            console.log('Scrape Complete'); 
        }
    });
})();
// LinkedIn Web Scraper

const fs = require('fs');
const puppeteer = require('puppeteer');

const url = 'https://www.linkedin.com/jobs/search?keywords=Mechanical%20Engineering&location=Philadelphia%2C%20Pennsylvania%2C%20United%20States&trk=guest_job_search_jobs-search-bar_search-submit&redirect=false&position=1&pageNum=0&f_E=2';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const btnClass = '.see-more-jobs';
    const isElementVisible = async (page, btnClass) => {
        let visible = true;
        await page
          .waitForSelector(btnClass, { visible: true, timeout: 1500 })
          .catch(() => {
            visible = false;
          });
        return visible;
      };
      let loadMoreVisible = await isElementVisible(page, btnClass);
      while (loadMoreVisible) {
        await page
          .click(btnClass)
          .catch(() => {});
        loadMoreVisible = await isElementVisible(page, btnClass);
    }


    let jobListings = await page.evaluate(() => {
        let jobs = [];

        let jobElms = document.querySelectorAll('.result-card');

        jobElms.forEach((jobelement) => {
            let jobJson = {};
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
    fs.writeFile('jobs.json', JSON.stringify(jobListings),  (err) => {
        if (err) throw err;
        else {
        console.log('Scrape Complete');
        console.log(jobListings);  
        }
    });
})();
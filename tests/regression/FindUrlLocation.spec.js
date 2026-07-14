import { test } from '@playwright/test';
import fs from 'fs';

test('Find Deleted URLs Across Entire Website', async ({ browser }) => {

    test.setTimeout(0);

    const BASE = 'https://www.abelini.com';
    const START = `${BASE}/sitemap`;

    //--------------------------------------------------
    // Read Deleted URLs
    //--------------------------------------------------

    const deletedUrls = fs
        .readFileSync('Urls.txt', 'utf8')
        .split(/\r?\n/)
        .map(x => x.trim())
        .filter(Boolean);

    console.log(`Deleted URLs : ${deletedUrls.length}`);

    //--------------------------------------------------
    // Browser
    //--------------------------------------------------

    const context = await browser.newContext({
        ignoreHTTPSErrors: true
    });

    const page = await context.newPage();

    //--------------------------------------------------
    // Crawl Queue
    //--------------------------------------------------

    const queue = [START];

    const visited = new Set();

    const results = [];

    //--------------------------------------------------
    // Crawl
    //--------------------------------------------------

    while (queue.length > 0) {

        const current = queue.shift();

        if (!current)
            continue;

        if (visited.has(current))
            continue;

        visited.add(current);

        console.log(
            `[${visited.size}] ${current}`
        );

        try {

            await page.goto(current, {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });

        } catch {

            continue;

        }

        //--------------------------------------------------
        // Find all href/src
        //--------------------------------------------------

        const pageLinks = await page.evaluate(() => {

            const arr = [];

            document
                .querySelectorAll(
                    'a[href],img[src],script[src],link[href]'
                )
                .forEach(el => {

                    const url =
                        el.getAttribute('href') ||
                        el.getAttribute('src');

                    arr.push({
                        tag: el.tagName.toLowerCase(),
                        url
                    });

                });

            //--------------------------------------------------

            const canonical = document.querySelector(
                'link[rel="canonical"]'
            );

            if (canonical) {

                arr.push({
                    tag: 'canonical',
                    url: canonical.href
                });

            }

            //--------------------------------------------------

            const og = document.querySelector(
                'meta[property="og:url"]'
            );

            if (og) {

                arr.push({
                    tag: 'og:url',
                    url: og.content
                });

            }

            return arr;

        });

        //--------------------------------------------------
        // Compare Deleted URLs
        //--------------------------------------------------

        for (const item of pageLinks) {

            if (!item.url)
                continue;

            let absolute;

            try {

                absolute = new URL(item.url, current).href;

            } catch {

                continue;

            }

            //--------------------------------------------------

            for (const deleted of deletedUrls) {

                if (
                    absolute === deleted ||
                    absolute.startsWith(deleted)
                ) {

                    results.push({

                        deleted,

                        foundOn: current,

                        tag: item.tag,

                        matched: absolute

                    });

                }

            }

            //--------------------------------------------------
            // Add Internal Links
            //--------------------------------------------------

            if (
                absolute.startsWith(BASE) &&
                !visited.has(absolute) &&
                !queue.includes(absolute)
            ) {

                const ignore = [

                    '.jpg',
                    '.jpeg',
                    '.png',
                    '.gif',
                    '.svg',
                    '.webp',
                    '.pdf',
                    '.zip',
                    '.xml',
                    '.ico',
                    '.css',
                    '.js'

                ];

                if (
                    !ignore.some(x =>
                        absolute.toLowerCase().includes(x)
                    )
                ) {

                    queue.push(absolute);

                }

            }

        }

        console.clear();

        console.log('===============================');
        console.log('Pages Crawled :', visited.size);
        console.log('Queue         :', queue.length);
        console.log('Matches       :', results.length);
        console.log('===============================');

    }

    //--------------------------------------------------
    // Save CSV
    //--------------------------------------------------

    let csv =
        'Deleted URL,Found On Page,Element,Matched URL\n';

    results.forEach(r => {

        csv += `"${r.deleted}","${r.foundOn}","${r.tag}","${r.matched}"\n`;

    });

    fs.writeFileSync(
        'Urls_Report.csv',
        csv
    );

    console.log('--------------------------------');
    console.log('Total Pages   :', visited.size);
    console.log('Matches Found :', results.length);
    console.log('CSV Generated : Deleted_URL_Report.csv');
    console.log('--------------------------------');

    await context.close();

});
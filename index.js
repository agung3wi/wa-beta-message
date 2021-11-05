const express = require('express')
const app = express()
const port = 3000

const { Builder, By, Key, until } = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');

const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

let session = {}


function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function qrGenerate(uuid) {
    return new Promise(async (resolve, reject) => {
        for (let i = 0; i < 120; i++) {
            try {
                let element = await session[uuid].findElement(By.className('_2UwZ_'))
                session[uuid].qr = await element.getAttribute("data-ref")
                console.log(session[uuid].qr)
            } catch (err) {

            }
            await timeout(1000);
        }

        resolve(null)
    });
}

app.get('/', async (req, res) => {

    // await driver.get("https://web.whatsapp.com")

    // await driver.wait(until.elementLocated(By.className('_30yMe')), 10000);
    // await timeout(2000);
    // let element = await driver.findElement(By.className('_2UwZ_'))
    // qr = await element.getAttribute("data-ref")
    // qrGenerate().then(res => { })

    res.send('Hello World!')
})

app.get('/qr', async (req, res) => {
    const uuid = "abc"

    if (session[uuid] === undefined) {

        let o = new chrome.Options();
        o.addArguments("user-data-dir=/Users/macbook/agung/wa-beta-message/Data/" + uuid + "/");
        session[uuid] = new webdriver.Builder()
            .forBrowser('chrome')
            .withCapabilities(webdriver.Capabilities.chrome())
            .setChromeOptions(o)
            .usingServer('http://localhost:4444/wd/hub')
            .build();
        session[uuid].qr = null
        session[uuid].connected = false

        await session[uuid].get("https://web.whatsapp.com")

        await session[uuid].wait(until.elementLocated(By.className('_30yMe')), 10000);

        await timeout(2000);
        let element = await session[uuid].findElement(By.className('_2UwZ_'))
        session[uuid].qr = await element.getAttribute("data-ref")
        qrGenerate(uuid).then(res => { })
    }
    res.send(session[uuid].qr)
});

app.get('/send', async (req, res) => {

    let phone = "6281337888522",
        text = "hello",
        uuid = "abc"
    try {
        await session[uuid].navigate().to('https://web.whatsapp.com/send?phone=' + phone)
    } catch (err) {
        let o = new chrome.Options();
        o.addArguments("user-data-dir=/Users/macbook/agung/wa-beta-message/Data/" + uuid + "/");
        session[uuid] = new webdriver.Builder()
            .forBrowser('chrome')
            .withCapabilities(webdriver.Capabilities.chrome())
            .setChromeOptions(o)
            .usingServer('http://localhost:4444/wd/hub')
            .build();
        session[uuid].qr = null
        session[uuid].connected = true

        await session[uuid].get('https://web.whatsapp.com/send?phone=' + phone)
    }
    let elem = await session[uuid].wait(until.elementsLocated(By.className("_13NKt")), 10000);
    while (true) {
        elem = await session[uuid].wait(until.elementsLocated(By.className("_13NKt")), 10000);
        if (elem.length < 2)
            await timeout(1000)
        else break;
    }
    await timeout(1000)
    text = text.replace("\n", Key.SHIFT + Key.ENTER + Key.SHIFT)
    await elem[1].sendKeys(text, Key.ENTER)
    res.send("ok")
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
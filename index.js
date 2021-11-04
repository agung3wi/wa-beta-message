const express = require('express')
const app = express()
const port = 3000

const { Builder, By, Key, until } = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');

const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

var o = new chrome.Options();
o.addArguments("user-data-dir=/Users/macbook/agung/wa-beta-message/Data/");

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let qr = ""

let driver = new webdriver.Builder()
    .forBrowser('chrome')
    .withCapabilities(webdriver.Capabilities.chrome())
    .setChromeOptions(o)
    .usingServer('http://localhost:4444/wd/hub')
    .build();

let scanned = false

function qrGenerate() {
    return new Promise(async (resolve, reject) => {
        for (let i = 0; i < 120; i++) {
            try {
                let element = await driver.findElement(By.className('_2UwZ_'))
                qr = await element.getAttribute("data-ref")
                console.log(qr)
            } catch (err) {

            }
            await timeout(1000);
        }

        resolve(null)
    });
}

app.get('/', async (req, res) => {


    await driver.get("https://web.whatsapp.com")

    await driver.wait(until.elementLocated(By.className('_30yMe')), 10000);
    await timeout(2000);
    let element = await driver.findElement(By.className('_2UwZ_'))
    qr = await element.getAttribute("data-ref")
    qrGenerate().then(res => { })

    res.send('Hello World!')
})

app.get('/qr', async (req, res) => {
    res.send(qr)
});

app.get('/send', async (req, res) => {
    let phone = "6281337888522"
    text = "hello"
    await driver.navigate().to('https://web.whatsapp.com/send?phone=' + phone)
    let elem = await driver.wait(until.elementsLocated(By.className("_13NKt")), 10000);
    while (true) {
        elem = await driver.wait(until.elementsLocated(By.className("_13NKt")), 10000);
        if (elem.length < 2)
            await timeout(1000)
        else break;
    }
    console.log("nilai", elem.length)
    await timeout(5000)
    text = text.replace("\n", Key.SHIFT + Key.ENTER + Key.SHIFT)
    await elem[1].sendKeys(text, Key.ENTER)
    res.send(qr)
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
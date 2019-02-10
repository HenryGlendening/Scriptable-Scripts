// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// always-run-in-app: true; icon-color: teal;
// icon-glyph: chart-line; share-sheet-inputs: plain-text;
// Takes a a stock symbol string as input. Uses that
// to fetch information on the symbol from Nasdaq's
// website regarding earnings and other analyst data.

let stockSymbol = args.plainTexts[0]


//let yearRegex = /wwdc(\d+)/
//let yearMatch = url.match(yearRegex)
//let year = "20" + yearMatch[1]
//let sessionRegex = /\d+$/
//let sessionMatch = url.match(sessionRegex)
//let session = sessionMatch[0]
let earningsDateUrl = "https://nasdaq.com/earnings/report/" + "twlo"//stockSymbol
let earningsDateRequest = new Request(earningsDateUrl)
let rawEarningsDateResponse = await earningsDateRequest.loadString()

let upcomingEarningsDateRegex = /<span id=".*?main_content_reportdata">(.*?)<\/span>/i
let upcomingEarningsDateHtml = rawEarningsDateResponse.match(upcomingEarningsDateRegex)[1]
console.log(upcomingEarningsDateHtml)

var parsedData = {}

parsedData["Company Info"] = parseCompanyInfo(upcomingEarningsDateHtml)
parsedData["Upcoming Earnings"] = parseUpcomingEarnings(upcomingEarningsDateHtml)
parsedData["Recent EPS History"] = parseRecentEpsHistory(rawEarningsDateResponse)

function parseCompanyInfo(unparsedHtmlData) {
  let companyNameRegex = /(.*?) (?:is expected|is estimated|hasn't provided us with)/
  var companyName = unparsedHtmlData.match(companyNameRegex)[1]
  
  if (companyName.includes("Our vendor")) { companyName = "UNKNOWN" }
  console.log(companyName)

  return {
    "Company Name": companyName
  }
}

function parseUpcomingEarnings(unparsedHtmlData) {
  var upcomingEarningsDate = "TBD"
  var timeOfDay = "-"
  var numOfAnalysts = "-"
  var currentQuarterEpsForecast = "-"

  if (unparsedHtmlData.includes("hasn't provided us with") == false) {
    let dateRegex = /((0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d) (.*?)\./i
    upcomingEarningsDate = unparsedHtmlData.match(dateRegex)[1]
    console.log(upcomingEarningsDate)
  
    timeOfDay = unparsedHtmlData.match(dateRegex)[5]
    console.log(timeOfDay)
  
    let numOfAnalystsRegex = /\d{1,} analyst(s?)/g
    numOfAnalysts = unparsedHtmlData.match(numOfAnalystsRegex)[0]
    console.log(numOfAnalysts)
  
    let currentQuarterEpsForecastRegex = /(?:forecast for the quarter is )(\$-?\d+\.\d{2})/i
    currentQuarterEpsForecast = unparsedHtmlData.match(currentQuarterEpsForecastRegex)[1]
    console.log(currentQuarterEpsForecast)
  }
  
  return {
    "Date": upcomingEarningsDate,
    "Time of Day": timeOfDay,
    "Number of Analysts": numOfAnalysts,
    "Expected EPS": currentQuarterEpsForecast 
  }
}

function parseRecentEpsHistory(unparsedHtmlData) {
  let recentEpsHistoryRegex = /Quarterly Earnings Surprise History(?:.|\n)*?(<table[^>]*>(?:.|\n)*?<\/table>)/is
  let recentEpsHistoryHtml = rawEarningsDateResponse.replace(/[\n\r\t]/g,' ').match(recentEpsHistoryRegex)[1]
  console.log(recentEpsHistoryHtml)
  return
}
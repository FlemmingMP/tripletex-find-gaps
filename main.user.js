// ==UserScript==
// @name         Find Tripletex Gaps
// @namespace    https://github.com/FlemmingMP/tripletex-find-gaps
// @version      0.1.2
// @description  Show gaps in time sheet
// @author       FlemmingMP
// @updateURL    https://github.com/FlemmingMP/tripletex-find-gaps/raw/main/main.user.js
// @downloadURL  https://github.com/FlemmingMP/tripletex-find-gaps/raw/main/main.user.js
// @match        https://tripletex.no/execute/updateHourlist*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
  'use strict'

  const siteValues = {
    weekdayID: '[id^="timeReportTableWeekdayRow"]',
    commentNum: 7
  }

  let delayCount = 0
  let maxDelay = 10

  // Run after site loads since it takes time
  // Set a limit on retries so it doesn't run forever
  runDelay()

  function runDelay() {
    setTimeout(() => {
      delayCount++
      main()
    }, "500")  
  }

  function main() {
    if (findDays() === -1 && delayCount < maxDelay) {
      runDelay()
    } else if (delayCount >= maxDelay) {
      console.log(`Tried to access the data ${maxDelay} times without success\nRefresh the site to try again`)
    }
  }

  function findDays() {
    const dayNodes = document.querySelectorAll(siteValues.weekdayID)

    if (dayNodes.length === 0) {
      return -1
    }

    dayNodes.forEach((node) => {

      let num = siteValues.commentNum
      let curNode = node
      let stringArr = []
      let startArr = []
      let endArr = []
      let dayText = node.innerText
      let text = ""

      // Find all strings with time
      while (curNode.nextSibling.nextSibling &&
        curNode.nextSibling.nextSibling.childNodes[num] &&
        node.nextSibling.nextSibling.childNodes[num].innerText !== '') {
        curNode = curNode.nextSibling.nextSibling
        curNode.childNodes[num].querySelectorAll("strong").forEach(node => stringArr.push(node.innerText))
      }

      // Sort and organize time strings
      stringArr = stringArr.map(string => string.trim())
      startArr = stringArr.filter(string => string.startsWith("(")).sort().slice(1).map(string => string.slice(1))
      endArr = stringArr.filter(string => !string.startsWith("(")).sort().slice(0, -1).map(string => string.slice(0, -1))

      // Build string
      for (let index = 0; index < startArr.length; index++) {
        if (!startArr[index].includes(endArr[index])) {
          if (startArr[index] > endArr[index]) {
            text = text + ` - Gap between ${endArr[index]} and ${startArr[index]}`
          } else if (startArr[index] < endArr[index]) {
            text = text + ` - Overlap between ${startArr[index]} and ${endArr[index]}`
          }
        }
      }

      // Add string to row
      node.innerHTML = 
      `<td colspan="4">
        <strong>${dayText}</strong>
        <span>${text}</span>
      </td>`
    })
    return 0
  }
})()
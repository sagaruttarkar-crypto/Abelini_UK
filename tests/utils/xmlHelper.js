function getLocUrlsFromXml(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  const locElements = xmlDoc.getElementsByTagName("loc");

  const urls = [];
  for (let i = 0; i < locElements.length; i++) {
    urls.push(locElements[i].textContent);
  }

  return urls;
}

module.exports = { getLocUrlsFromXml };

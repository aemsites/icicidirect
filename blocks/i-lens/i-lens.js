
async function makeAPICall() {
  const url = 'https://www.icicidirect.com/trendlyne/ScreenerDetails';
  const headers = new Headers();
  headers.append('Accept', '*/*');
  headers.append('Accept-Language', 'en-GB,en-US;q=0.9,en;q=0.8');
  headers.append('Cache-Control', 'no-cache');
  headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  headers.append('Origin', 'https://www.icicidirect.com');
  headers.append('Pragma', 'no-cache');
  headers.append('Sec-Fetch-Dest', 'empty');
  headers.append('Sec-Fetch-Mode', 'cors');
  headers.append('Sec-Fetch-Site', 'same-origin');
  headers.append('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
  headers.append('X-Requested-With', 'XMLHttpRequest');
  headers.append('sec-ch-ua', '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"');
  headers.append('sec-ch-ua-mobile', '?0');
  headers.append('sec-ch-ua-platform', '"macOS"');

  const body = 'screenpk=83415';

  const requestOptions = {
    method: 'POST',
    headers,
    body,
    redirect: 'follow',
  };

  try {
    const response = await fetch(url, requestOptions);
    const data = await response.text();
    console.log(data); // Logging the response data
  } catch (error) {
    console.error('Error occurred:', error);
  }
}
export default async function decorate(block) {
  block.textContent = '';
  await makeAPICall();
}

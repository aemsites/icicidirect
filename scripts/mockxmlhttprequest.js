/**
 * MockXMLHttpRequest class to mock the XMLHttpRequest object
 * to intercept and modify the request and response for specific URLs
 */
class MockXMLHttpRequest {
  constructor() {
    this.origXmlHttpRequest = new window.OrigXmlHttpRequest();
  }

  setRequestHeader(header, value) {
    this.origXmlHttpRequest.setRequestHeader(header, value);
  }

  open(method, url) {
    this.requestedUrl = url;
    this.method = method;
    this.origXmlHttpRequest.open(method, url);
  }

  send(params) {
    if (this.method === 'POST' && this.requestedUrl === 'https://icici-securities.allincall.in/chat/get-bot-image/') {
      // Custom JSON response
      const jsonResponse = {
        status: 200,
        bot_image_url: '/files/260039a4-3883-4647-a683-edd3994133df.png',
        is_auto_pop_allowed: false,
        is_auto_pop_allowed_desktop: true,
        is_auto_pop_allowed_mobile: true,
        auto_pop_timer: 3,
        auto_popup_type: '3',
        auto_popup_initial_messages: '["Statements", "IPOs"]',
        auto_pop_text: 'Need Help ?',
        bot_position: 'bottom-right',
        bot_theme: 2,
        bot_theme_color: 'E77817',
        bot_image_visible: true,
        form_assist_autopop_up_timer: 10,
        form_assist_inactivity_timer: 20,
        is_form_assist_auto_pop_allowed: false,
        is_minimization_enabled: true,
        font_style: 'Roboto',
        is_nps_required: true,
        last_bot_updated_time: '1690782884',
        allowed_hosts: [
          'icici-securities.allincall.in',
          '127.0.0.1',
          '0.0.0.0',
        ],
        maximize_text: 'Click here to maximize',
        minimize_text: 'Click here to minimize',
        selected_language: 'en',
        bot_hide_for_url: true,
        bot_hide_url_list: [
          'secure.icicidirect.com',
        ],
      };

      // Your custom logic here
      // eslint-disable-next-line no-console
      console.log('Custom send method called. Returning custom response:', jsonResponse);

      // Call the onload function with the custom response
      if (this.onload) {
        this.onload(jsonResponse);
      }

      // Call the onreadystatechange function if set
      if (this.onreadystatechange) {
        this.readyState = 4;
        this.status = 200;
        this.responseText = JSON.stringify(jsonResponse);
        this.onreadystatechange();
      }
    } else {
      this.origXmlHttpRequest.onload = this.onload;
      this.origXmlHttpRequest.onreadystatechange = this.onreadystatechange;
      this.origXmlHttpRequest.send(params);
    }
  }
}

window.OrigXmlHttpRequest = window.XMLHttpRequest;
// Override the global XMLHttpRequest with your custom class
window.XMLHttpRequest = MockXMLHttpRequest;

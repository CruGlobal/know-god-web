(function () {
  window.onload = function () {
    var knowGodEmbed = document.getElementById('knowGodEmbed');
    if (!knowGodEmbed) {
      console.log('Know God element not found.');
      return;
    }

    var baseUrl = '{appDomain}';
    var dataBook = knowGodEmbed.getAttribute('data-book');
    var dataLang = knowGodEmbed.getAttribute('data-lang');

    //build iframe element
    var iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.minHeight = '450px';
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('scrolling', 'no');
    iframe.src = [baseUrl, '#', dataLang, dataBook].join('/');

    knowGodEmbed.appendChild(iframe);

    //listen for iframe height changes
    var previousHeight = 0;
    var eventMethod = window.addEventListener
      ? 'addEventListener'
      : 'attachEvent';
    var eventer = window[eventMethod];
    var messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message';
    eventer(
      messageEvent,
      function (e) {
        if (isNaN(e.data) || previousHeight === e.data) return;

        iframe.style.height = e.data + 'px';

        //scroll to top of iframe
        var newiframeTop =
          document.getElementById('knowGodEmbed').getBoundingClientRect().top +
          window.scrollY;
        if (window.pageYOffset > newiframeTop) {
          window.scrollTo({
            top: newiframeTop
          });
        }

        previousHeight = e.data;
      },
      false
    );
  };
})();

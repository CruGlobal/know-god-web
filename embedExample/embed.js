var knowGodEmbed = document.getElementById('knowGodEmbed');
var dataLang = knowGodEmbed.getAttribute('data-lang');
var dataBook = knowGodEmbed.getAttribute('data-book');
var knowGodIframe = document.createElement('iframe');
var baseUrl = 'http://stage.knowgod.com/home/';
knowGodIframe.src = baseUrl + dataBook + '/' + dataLang;
knowGodIframe.id = 'knowGodIframe';
knowGodIframe.frameBorder = 0;
knowGodIframe.scrolling="no"
knowGodIframe.style.cssText = 'width: 100%; height: 100%; border:0;';
knowGodEmbed.appendChild(knowGodIframe);

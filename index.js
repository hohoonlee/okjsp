var self	= require('sdk/self'),
	data	= self.data;
var buttons = require('sdk/ui/button/action');
	
buttons.ActionButton({
	id: 'okky-btn',
	label: 'OKKY Block List',
	onClick: handleClick
});

function handleClick(state) {
	popup.show();
};

//POPUP///////////////////////////////////////////////////////////////////////////////
var popup = require('sdk/panel').Panel({
	contentURL: data.url('popup.html')
});

// a dummy function, to show how tests work.
// to see how to test this function, look at test/test-index.js
function dummy(text, callback) {
  callback(text);
}

exports.dummy = dummy;

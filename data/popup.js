const storage = chrome.storage.sync;

const blockList = cb  => {
	chrome.runtime.sendMessage({cmd:'blockList'}, cb);
};

const deleteBlocker = (id, cb) => {
	chrome.runtime.sendMessage({cmd:'deleteBlocker', data:id});
	if(cb) cb();
};

const displayList = () => {
	blockList(items => {
		const list = $('#list');
		list.html('');
		if(!items || items.length <= 0) return;
		items.forEach(info => {
			const li = '<li><a href="#" data-id="'+info.id+'">' + info.name + '</a></li>';
			list.append(li);
		});

		$('li a').on('click', function() {
			const id = $(this).data('id');
			deleteBlocker(id, () => {
				setTimeout(displayList, 500);
			});
		});
	});
};

const setType = () => {
	storage.get('type', items =>{
		if(items.type) {
			$('#' + items.type).prop('checked', true);
		}else {
			$('#hidden').prop('checked', true);
		}
	});
};

$(document).ready(function() {
	setType();
	displayList();

	$("input[name=hideType]").change(function() {
		storage.set({'type':$(this).val()});
	});
});

// var _gaq = _gaq || [];
// // _gaq.push(['_setAccount', 'UA-66870099-1']);
// // _gaq.push(['_trackPageview']);

// // (function() {
// //   var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
// //   ga.src = 'https://ssl.google-analytics.com/ga.js';
// //   var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
// // })();
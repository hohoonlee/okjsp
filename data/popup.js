var keys = ['list', 'list0', 'list1', 'list2', 'list3', 'list4'];
var storage = chrome.storage.sync;

function blockList(cb) {
	storage.get(keys, function(items) {
		var list = [];
		Object.keys(items).forEach(function(key) {
			list = list.concat(items[key]);
		});
		if(cb) cb(list);
	});
}

function saveBlocker(list, cb) {
	var quota = parseInt(list.length / keys.length, 10) + 1;

	keys.forEach(function(o) {
		if(list.length <= 0) return;
		var obj = {};
		obj[o] = list.splice(0, Math.min(list.length, quota));
		storage.set(obj);
	});
	
	if(cb) cb();
}

function displayList() {
	blockList(function(items) {
		var list = $('#list');
		list.html('');
		if(!items || items.length <= 0) return;
		items.forEach(function(info){
			var li = '<li><a href="#" data-id="'+info.id+'">' + info.name + '</a></li>';
			list.append(li);
		});
		$('li a').on('click', function() {
			var id = $(this).data('id');
			var newList = [];
			items.forEach(function(info) {
				if(info.id != id) newList.push(info);
			});
			if(newList && newList.length > 0) {
				saveBlocker(newList, displayList);
			}else {
				storage.clear();
				displayList();
			}
		});
	});
}

function setType() {
	storage.get('type', function(items) {
		if(items.type) {
			$('#' + items.type).prop('checked', true);
		}else {
			$('#hidden').prop('checked', true);
		}
	});
}

$(document).ready(function() {
	setType();
	displayList();
	
	$("input[name=hideType]").change(function() {
		storage.set({'type':$(this).val()});
	});
});

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-66870099-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
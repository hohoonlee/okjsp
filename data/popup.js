const storage = chrome.storage.sync;

const blockList = cb  => {
	chrome.runtime.sendMessage({cmd:'blockList'}, cb);
};

const reloadPage = cb  => {
	chrome.runtime.sendMessage({cmd:'reloadPage'}, cb);
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
				setTimeout(() => {
					displayList();
					//reloadPage();
				}, 500);
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
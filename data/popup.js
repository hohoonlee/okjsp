const storage = chrome.storage.sync;

const blockList = cb  => {
	chrome.runtime.sendMessage({cmd:'blockList'}, cb);
};

const reloadPage = cb  => {
	chrome.runtime.sendMessage({cmd:'reloadPage'}, cb);
};

const deleteBlocker = (id, cb) => {
	chrome.runtime.sendMessage({cmd:'deleteBlocker', data:id}, cb);
};

const displayList = () => {
	blockList(items => {
		const list = $('#list');
		list.html('');
		if(!items || items.length <= 0) return;
		items.forEach(info => {
			const li = '<li><span class="name">' + info.name + '</span><button class="del-btn" data-id="'+info.id+'">X</button></li>';
			list.append(li);
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

	$('#list').on('click', '.del-btn', function() {
		const id = $(this).data('id');
		deleteBlocker(id, () => {
			setTimeout(() => {
				displayList();
				reloadPage();
			}, 500);
		});
	});

	$("input[name=hideType]").change(function() {
		storage.set({'type':$(this).val()}, () => {
			reloadPage();
		});
	});
});
chrome.runtime.onMessage.addListener( ({cmd, data},sender,cb) => {
    switch (cmd) {
        case 'reloadPage':
			reloadPage(cb);
            break;
    }
	return true;
});

const hideUser = (isHide, info) => {
	if(!info) return;
	const key = ((info.type === 'c')?'/company/':'/users/') + info.id;
	const $target = $('a[href="' + key + '"]').parents('li');
	if(isHide) {
		$target.hide();
	}else {
		$target.css('font-style', 'italic').css('background-color', 'darkgray');
	}
}

const reloadPage = async cb => {
	const {type} = await chrome.storage.sync.get(['type']);
	const isHide = type !== 'italics';
	const func = info => hideUser(isHide, info);
	const list = await blockList();
	list.forEach(func);
	if(cb) cb();
};

const blockList = async () => {
	return await chrome.runtime.sendMessage({cmd:'blockList'});
};

const run = async () => {
	return await reloadPage();
};

run();
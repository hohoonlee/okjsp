chrome.runtime.onMessage.addListener( ({cmd, data},sender,cb) => {
    switch (cmd) {
        case 'reloadPage':
			reloadPage(cb);
            break;
    }
	return true;
});

const addObserver = cb => {
	const body = document.querySelector('#__next');
	if(!body) return;
	let oldHref = document.location.href;
	const observer = new MutationObserver(mutations => {
		if(oldHref === document.location.href) return;
		oldHref = document.location.href;
		if(cb) cb();
	});

	if(observer && observer.observe) observer.observe(body, {childList:true, subtree:true});
};

const hideUser = (isHide, info) => {
	if(!info) return;
	const key = ((info.type === 'c')?'/company/':'/users/') + info.id;
	const $target = $('a[href="' + key + '"]').parents('li,.space-x-1');
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
	document.querySelectorAll('button[id^=headlessui-disclosure-button]').forEach(i => i.click());
	if(cb) cb();
};

const blockList = async () => {
	return await chrome.runtime.sendMessage({cmd:'blockList'});
};

window.onload = () => {
	const run = () => setTimeout(reloadPage, 1_000);
	addObserver(mutation => {
		run();
	});
	run();
};
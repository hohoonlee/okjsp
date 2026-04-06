chrome.runtime.onMessage.addListener( ({cmd, data},sender,cb) => {
    switch (cmd) {
        case 'reloadPage':
			reloadPage(cb);
            break;
    }
	return true;
});

let loop;
const addObserver = cb => {
	const onNav = () => {
		clearTimeout(loop);
		loop = setTimeout(cb, 100);
	};
	navigation.addEventListener('navigate', onNav);
};

const normalizeId = id => String(id).replace(/\/.*$/, '');

const hideUser = (isHide, info) => {
	if(!info) return;
	const id = normalizeId(info.id);
	const key = ((info.type === 'c')?'/company/':'/users/') + id;
	const $target = $(`a[href="${key}"], a[href^="${key}/"]`).not('.group a, .group a *').closest('[data-slot="item"], li');
	if($target.length === 0) return false;
	if(isHide) {
		$target.hide().addClass('okjsp-hidden');
	}else {
		$target.css('font-style', 'italic').css('background-color', 'darkgray').addClass('okjsp-italic');
	}
	return true;
}

const resetUser = () => {
	$('.okjsp-hidden').show().removeClass('okjsp-hidden');
	$('.okjsp-italic').css({'font-style':'', 'background-color':''}).removeClass('okjsp-italic');
};

const reloadPage = async cb => {
	try {
		const {type} = await chrome.storage.sync.get(['type']);
		const isHide = type !== 'italics';
		resetUser();
		const list = await blockList();
		list.forEach(info => hideUser(isHide, info));

		if(cb) cb();
	}catch(e) {
		setTimeout(() => {
			reloadPage(cb);
		}, 1_000);
	}
};

const blockList = async () => {
	return await chrome.runtime.sendMessage({cmd:'blockList'});
};

let contentLoop;
let contentObserver;
const observeContent = () => {
	if(contentObserver) contentObserver.disconnect();
	const target = document.querySelector('main') || document.body;
	contentObserver = new MutationObserver(() => {
		clearTimeout(contentLoop);
		contentLoop = setTimeout(reloadPage, 300);
	});
	contentObserver.observe(target, { childList: true, subtree: true });
};

window.onload = () => {
	addObserver(() => {
		observeContent();
		reloadPage();
	});
	observeContent();
	reloadPage();
};

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
	const body = document.querySelector('#__next');
	if(!body) {
		setTimeout(()=>addObserver(cb), 1_000);
		return;
	}
	let oldHref = document.location.href;
	const observer = new MutationObserver(mutations => {
		if(oldHref === document.location.href) return;
		oldHref = document.location.href;
		if(cb) {
			clearTimeout(loop);
			loop = setTimeout(cb, 100);
		}
	});

	if(observer && observer.observe) observer.observe(body, {childList:true, subtree:true});
};

const hideUser = (isHide, info) => {
	if(!info) return;
	const key = ((info.type === 'c')?'/company/':'/users/') + info.id;
	const $target = $('a[href="' + key + '"]').closest('div').not('.group').parents('li,.space-x-1');
	if(isHide) {
		$target.hide();
	}else {
		$target.css('font-style', 'italic').css('background-color', 'darkgray');
	}
}

const isFirstPage = () => {
	const u = new URL(location.href);
	const page = u.searchParams.get("page");
	return (!page || page === '1');
};

const reloadPage = async cb => {
	try {
		const {type} = await chrome.storage.sync.get(['type']);
		const isHide = type !== 'italics';
		const func = info => hideUser(isHide, info);
		const list = await blockList();
		list.forEach(func);

		document.querySelectorAll('button[id^=headlessui-disclosure-button]').forEach(i => i.click());

		document.querySelectorAll('div.overflow-hidden li.bg-blue-50').forEach(i => {
			i.style.display = (isFirstPage())?'':'none';
		});

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

window.onload = () => {
	const f = () => {
		addObserver(mutation => {
			reloadPage();
		});
	};

	try {
		f();
	}catch(e) {
		console.error(e);
		setTimeout(f, 500);
	}

	setTimeout(reloadPage, 100);
};
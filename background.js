// background.js
const targetDomain = 'https://okky.kr';
const userUrl		= targetDomain + '/users/';
const companyUrl	= targetDomain + '/company/';

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){

    } else if(details.reason == "update"){
        // 버전 업데이트 또는 확장 프로그램에서 새로고침시
    }
});

// background.js
chrome.runtime.onMessage.addListener( ({cmd, data},sender,cb) => {
    switch (cmd) {
        case 'blockList':
			blockList(cb);
            break;
        case 'reloadPage':
			reloadPage(cb);
            break;
		case 'deleteBlocker':
			deleteBlocker(data, cb);
			break;
    }
	return true;
});

const reloadPage = cb => {
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		if(tabs && tabs.length > 0 && tabs[0].id) chrome.tabs.sendMessage(tabs[0].id, {cmd: 'reloadPage'}, null, cb);
	});
};

const onClickHandler = (info) => {
	if (info.menuItemId === "contextlink") {
		if(	info.linkUrl.indexOf(userUrl) !== 0 &&
			info.linkUrl.indexOf(companyUrl) !== 0) {
			return;
		}
		saveBlockUser(info);
	}
};

const saveBlockUser = (info, memo) => {
	var type	= 'u';
	var id		= info.linkUrl.replace(userUrl, '');
	if(info.linkUrl === id) {
		id		= info.linkUrl.replace(companyUrl, '');
		type	= 'c';
	}
	if(!info.selectionText) {
		info.selectionText = id;
		// info.selectionText = prompt('차단할 이름', id);
	}

	blockList(list => {
		saveBlocker(
			list,
			{"name":info.selectionText, id, type, memo},
			reloadPage);
	});
};

const saveBlocker = (list = [], o, cb) => {
	console.log('>>>', o);
	chrome.storage.sync.clear();
	if(o) list.push(o);
	const quota = parseInt(list.length / keys.length, 10) + 1;

	for(const o of keys) {
		const obj = {};
		obj[o] = list.splice(0, Math.min(list.length, quota));
		chrome.storage.sync.set(obj);
		if(list.length <= 0) break;
	};

	if(cb) cb();
};

const deleteBlocker = (id, cb) => {
	blockList(list => {
		list = list.filter(o => o.id != id);
		saveBlocker(list, null, cb);
	});
};

const keys = ['list', 'list0', 'list1', 'list2', 'list3', 'list4'];

const blockList = cb => {
	chrome.storage.sync.get(keys, items => {
		const list = [];
		Object.keys(items).forEach(key => {
			list.push(...items[key]);
		});
		list.forEach(obj => {
			if(obj && !obj.memo) delete obj.memo;
		});

		if(cb) cb(list);
	});
};

chrome.contextMenus.create({
	"title": `%s 를(을) 차단합니다.`,
	'id': 'contextlink',
	'contexts': ['link'],
	'targetUrlPatterns':[
		`${userUrl}*`,
		`${companyUrl}*`,
	]
});

chrome.contextMenus.onClicked.addListener(onClickHandler);

//noti ///////////////////////////////////////////////////////
const setAllRead = () => {
	setRead('0');
};

const setRead= (dis) => {
	chrome.action.setBadgeBackgroundColor({color: [0, 255, 0, 128]});
	chrome.action.setBadgeText({text: dis});
};

const setUnread = (unreadItemCount) => {
	chrome.action.setBadgeBackgroundColor({color: [255, 0, 0, 128]});
	chrome.action.setBadgeText({text: '' + unreadItemCount});
}

const getData = async (url) => {
	return await (await (fetch(url))).text();
};

const checkNoti = async alarm => {
	if('refresh' !== alarm.name && 'reload' !== alarm.name) return;

	const body = await getData(targetDomain + '/api/okky-web/notifications/count');
	if(!body) {
		setRead('?');
	}else {
		const count = parseInt(body, 10);
		if(count > 0) {
			setUnread(count);
		}else {
			setAllRead();
		}
	}
};

chrome.alarms.onAlarm.addListener(checkNoti);
chrome.alarms.create('refresh', {periodInMinutes: 5});
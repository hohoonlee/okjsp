var targetDomain = 'https://okky.kr';
var userUrl		= targetDomain + '/user/info/';
var companyUrl	= targetDomain + '/company/info/';
//tab이 열릴때
//.css('font-style', 'italic');
// var u0 = "$(\"a[href='/user/info/@ID@']\").parents('li,div.article-middle-block').hide();";
// var u1 = "$(\"a[href='/user/info/@ID@']\").parents('li,div.article-middle-block').css('font-style', 'italic').css('background-color', 'darkgray');";
// var c0 = "$(\"a[href='/company/info/@ID@']\").parents('li,div.article-middle-block').hide();";
// var c1 = "$(\"a[href='/company/info/@ID@']\").parents('li,div.article-middle-block').css('font-style', 'italic').css('background-color', 'darkgray');";
// var u0 = "$(\"a[href*='@ID@']\").parents('li,div.article-middle-block').hide();";
// var u1 = "$(\"a[href*='@ID@']\").parents('li,div.article-middle-block').css('font-style', 'italic').css('background-color', 'darkgray');";
// var c0 = "$(\"a[href*='@ID@']\").parents('li,div.article-middle-block').hide();";
// var c1 = "$(\"a[href*='@ID@']\").parents('li,div.article-middle-block').css('font-style', 'italic').css('background-color', 'darkgray');";
var u0 = "$(\"a[href^='/user/info/			@ID@']\").parents('li,div.article-middle-block').hide();";
var u1 = "$(\"a[href^='/user/info/			@ID@']\").parents('li,div.article-middle-block').css('font-style', 'italic').css('background-color', 'darkgray');";
var c0 = "$(\"a[href^='/company/info/@ID@']\").parents('li,div.article-middle-block').hide();";
var c1 = "$(\"a[href^='/company/info/@ID@']\").parents('li,div.article-middle-block').css('font-style', 'italic').css('background-color', 'darkgray');";

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	if(changeInfo.status !== 'complete') return;
	if(tab.url.indexOf(targetDomain) < 0) return;
	storage.get('type', function(items) {
		reloadPage(items.type);
	});
});

function reloadPage(type) {
	var u = u0, c = c0;
	if(type === 'italics') {
		u = u1;
		c = c1;
	}
	blockList(function(list) {
		if(!list || list.length === 0) return;

		list.forEach(function(info) {
			var execCode = (info.type === 'c')?c:u;

			chrome.tabs.executeScript({
				code: execCode.replace(/@ID@/g, info.id),
				runAt:'document_end'
			}, function(result){
			});
		});
		checkNoti({'name':'reload'});
	});
}

//<컨텍스트 메뉴///////////////////////////////////////////////////////////////////////////////////////////////////////////
function onClickHandler(info) {
	if (info.menuItemId === "contextlink") {
		if(	info.linkUrl.indexOf(userUrl) !== 0 &&
			info.linkUrl.indexOf(companyUrl) !== 0) {
			alert('Not User Link');
			return;
		}
		saveBlockUser(info);
	}
};

chrome.contextMenus.onClicked.addListener(onClickHandler);

chrome.runtime.onInstalled.addListener(function() {
//	chrome.contextMenus.create({
//		id: "contextlink",
//		title: "'%s'를(을) 차단합니다.",
//		contexts:["link"],
//		targetUrlPatterns:[urlKey + '*'],
//		onclick:onClickHandler
//	});
	var contexts = ["link"];
	contexts.forEach(function(context) {
		var title = "'%s'를(을) 차단합니다.";
//		console.log(urlKey, title, context);
		chrome.contextMenus.create({
			"title": title,
			"id": "context" + context,
			"contexts":[context],
			"targetUrlPatterns":[
				userUrl + "*",
				companyUrl +"*"
			]});
	});
});
//컨텍스트 메뉴>///////////////////////////////////////////////////////////////////////////////////////////////////////////

//<DATA 관련/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var keys = ['list', 'list0', 'list1', 'list2', 'list3', 'list4'];
var storage = chrome.storage.sync;

function blockList(cb) {
	storage.get(keys, function(items) {
		var list = [];
		Object.keys(items).forEach(function(key) {
			list = list.concat(items[key]);
		});
		list.forEach(function(obj) {
			if(!obj.memo) delete obj.memo;
		});

		if(cb) cb(list);
	});
}

function saveBlocker(list, o, cb) {
	list.push(o);

	var quota = parseInt(list.length / keys.length, 10) + 1;

	keys.forEach(function(o) {
		if(list.length <= 0) return;
		var obj = {};
		obj[o] = list.splice(0, Math.min(list.length, quota));
		storage.set(obj);
	});

	if(cb) cb();
}

function saveBlockUser(info, memo) {
	var type	= '';
	var id		= info.linkUrl.replace(userUrl, '');
	if(info.linkUrl === id) {
		id		= info.linkUrl.replace(companyUrl, '');
		type	= 'c';
	}
	if(!info.selectionText) {
		info.selectionText = prompt('차단할 이름', id);
	}

	blockList(function(list) {
		var o = {"name":info.selectionText, "id":id};
		if(memo) o.memo = memo;
		if(type) o.type = type;
		saveBlocker(list, o, function() {
			reloadPage();
		});
	});
}
//DATA 관련>/////////////////////////////////////////////////////////////////////////////////////////////////////////////


//<NOTI 관련/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var ba = chrome.browserAction;
function setAllRead() {
	setRead('0');
}

function setRead(dis) {
	ba.setBadgeBackgroundColor({color: [0, 255, 0, 128]});
	ba.setBadgeText({text: dis});
}

function setUnread(unreadItemCount) {
	ba.setBadgeBackgroundColor({color: [255, 0, 0, 128]});
	ba.setBadgeText({text: '' + unreadItemCount});
}

function getData(url, cb, err) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 || xhr.status === 401) {
			if(xhr.status === 401) {
				if(err) err(xhr.responseText);
			}else {
				try {
					if(cb) cb(JSON.parse(xhr.responseText));
				}catch(e) {
					if(err) err(e);
				}
			}
		}
	};
	xhr.open("GET", url, true);
	xhr.send();
}

function checkNoti(alarm) {
	if('refresh' !== alarm.name && 'reload' !== alarm.name) return;

	getData(targetDomain + '/notification/count.json', function(data){
		if(data && data.count > 0) {
			setUnread(data.count);
		}else {
			setAllRead();
		}
	}, function(err) {
		setRead('?');
	});
}

chrome.alarms.onAlarm.addListener(checkNoti);
chrome.alarms.create('refresh', {periodInMinutes: 5});
//NOTI 관련>/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-66870099-1']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
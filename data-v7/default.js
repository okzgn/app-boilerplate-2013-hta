/*
	Default 7 (c) by OKZGN
*/

var
FileSystem	= new ActiveXObject('Scripting.FileSystemObject'),
Shell		= new ActiveXObject("WScript.Shell"),
App		= $('application'),
AppStartVars	= {
	appName: App.attr('applicationname'),
	appDataPath: App.attr('applicationDataPath'),
	width: Number(App.attr('width')),
	height: Number(App.attr('height')),
	resizeWidth: Number(App.attr('resizeWidth')),
	resizeHeight: Number(App.attr('resizeHeight')),
	headerHeight: Number(App.attr('headerHeight'))
},
AppName		= AppStartVars.appName,
AppDataPath	= AppStartVars.appDataPath,
AppWidth	= AppStartVars.width,
AppHeight	= AppStartVars.height,
AppResizeWidth	= AppStartVars.resizeWidth,
AppResizeHeight = AppStartVars.resizeHeight,
AppHeaderHeight	= AppStartVars.headerHeight,
AppPosX = 0,
AppPosY = 0,
AppHeader = '',
AppHeaderTitle = '',
AppHeaderMenu = '',
AppHeaderControls = '',
AppBody = '',
AppBodyContent = '',
AppBackgroundInt = null,
AppPhantomFile = AppDataPath + 'phantom',
AppPhantom = [],

ScreenWidth	= screen.width,
ScreenHeight	= screen.height;

var Application = {

	tmp: {
		moveVelocity: 44,
		resizeVelocity: 77,
		resizeTitleLength: 12,
		resized: false,
		lastXPlace: 0,
		lastYPlace: 0,
		lastResizeXPlace: ScreenWidth - AppStartVars.resizeWidth,
		lastResizeYPlace: Math.round(Math.random() * (ScreenHeight - AppResizeHeight)),
		movement: false,
		dragging: false,
		resizing: false
	},

	move: function(lastX, lastY, velocity, fn){
		velocity = velocity || 16;

		var
		firstX		= Application.posXFilter(AppPosX),
		firstY		= Application.posYFilter(AppPosY),
		longX		= (lastX - firstX),
		longY		= (lastY - firstY),
		distance	= Math.round(Math.sqrt(Math.pow(longX, 2) + Math.pow(longY, 2))),
		point		= 0,
		counter		= 0;

		var
		fn_last_move	= function(){
			clearInterval(Application.tmp.movement);
			AppPosX = lastX;
			AppPosY = lastY;
			window.moveTo(AppPosX, AppPosY);
			if($.isFunction(fn)){ fn.call(); }
		};

		var
		fn_movement	= function(){
			AppPosX = (firstX + Math.round(point *  longX / distance));
			AppPosY = (firstY + Math.round(point * longY / distance));
			window.moveTo(AppPosX, AppPosY);
			point += velocity;
			counter++;
			if(counter >= Math.round(distance / velocity)){ fn_last_move.call(); }
		};

		Application.tmp.movement = setInterval(fn_movement, 1);
	},

	dimension: function(width, height, velocity, fn){
		velocity = velocity || 24;

		var
		firstWid	= AppWidth,
		firstHei	= AppHeight,
		longWid		= Math.max(firstWid, width) - Math.min(firstWid, width),
		longHei		= Math.max(firstHei, height) - Math.min(firstHei, height),
		distance	= Math.round(Math.sqrt(Math.pow(longWid, 2) + Math.pow(longHei, 2))),
		point		= 0,
		counter		= 0,
		sWid		= (firstWid > width ? -1 : 1),
		sHei		= (firstHei > height ? -1 : 1),

		AppBodyHei	 = AppBody.is(':hidden') ? 0 : AppBody.outerHeight(),
		AppBodyHeiOuters = AppBody.outerHeight() - AppBody.height(),
		AppBodyHeiResult,

		AppBodyWid	 = AppBody.outerWidth(),
		AppBodyWidOuters = AppBody.outerWidth() - AppBody.width(),
		AppBodyWidResult;

		var
		fn_last_resize = function(){
			clearInterval(Application.tmp.resizing);

			AppWidth = width;
			AppHeight = height;

			AppBodyWidResult = width - AppBodyWidOuters;
			AppBodyHeiResult = height - AppHeader.outerHeight() - AppBodyHeiOuters;

			AppBody.css('width', AppBodyWidResult);
			AppBody.css('height', AppBodyHeiResult);

			if(AppBodyHeiResult == 0){ AppBody.hide(); }

			window.resizeTo(width, height);

			if($.isFunction(fn)){ fn.call(); }
		};

		var
		fn_resizing = function(){
			AppBodyWidResult = Math.round((sWid * point) *  longWid / distance);
			AppBodyHeiResult = Math.round((sHei * point) * longHei / distance);

			AppWidth = (firstWid + AppBodyWidResult);
			AppHeight = (firstHei + AppBodyHeiResult);


			AppBody.css({
				width: AppBodyWid + AppBodyWidResult,
				height: AppBodyHei + AppBodyHeiResult
			});

			window.resizeTo(AppWidth, AppHeight);
			point += velocity;
			counter++;

			if(counter >= Math.round(distance / velocity)){ fn_last_resize(); }
		}

		Application.tmp.resizing = setInterval(fn_resizing, 1);

	},

	drag: function(){
		var counter = 0, firstX = AppPosX, firstY = AppPosY, doc = $(document);

		var
		fn_move = function(e){
			if(Application.tmp.dragging){
				clearInterval(Application.tmp.movement);
				if(counter == 0){
					firstX = e.pageX;
					firstY = e.pageY;
				}
				AppPosX += (e.pageX - firstX);
				AppPosY += (e.pageY - firstY);

				AppPosX = Application.posXFilter(AppPosX);
				AppPosY = Application.posYFilter(AppPosY);

				if(Application.tmp.resized){
					Application.tmp.lastResizeXPlace = AppPosX;
					Application.tmp.lastResizeYPlace = AppPosY;
				}
				else {
					Application.tmp.lastXPlace = AppPosX;
					Application.tmp.lastYPlace = AppPosY;
				}

				window.moveTo(AppPosX, AppPosY);
				counter++;
			}
			else {
				counter = 0;
			}
		};

		AppHeader.on('mouseup', function(){
			Application.tmp.dragging = false;
			doc.off('mousedown');
		});

		AppHeader.on('mousedown', function(){
			doc.on('mousedown', function(){ Application.tmp.dragging = true; });
		});

		AppBody.on('mouseover', function(){
			Application.tmp.dragging = false;
			doc.off('mousedown');
		});

		doc.on('mousemove', fn_move);
	},

	controls: {
		setPosition: function(){
			AppHeaderControls.hide().css({ top: 0, left: (AppWidth - AppHeaderControls.width()) }).fadeIn('fast');
		},

		close: function(){
			clearInterval(AppBackgroundInt);
			clearInterval(Application.tmp.movement);
			clearInterval(Application.tmp.resizing);

			AppHeader.find('*').fadeOut('fast');
			Application.dimension(1, 1, Application.tmp.resizeVelocity, function(){
				window.close();
			});
		},

		resize: function(){
			var resizeBtn = AppHeaderControls.find('.AppHeader-resizeBtn');

			if(Application.tmp.resized){
				AppBody.css('overflow', 'auto');
				Application.tmp.resized = false;
				resizeBtn.prop('title', 'Minimizar');
				resizeBtn.text('_');

				AppHeaderTitle.text(AppName);
				AppHeaderMenu.fadeIn('fast');
				AppHeaderControls.hide();

				var xPos = Application.tmp.lastXPlace == 0 ? Math.round((ScreenWidth - AppStartVars.width) / 2) : Application.tmp.lastXPlace;
				var yPos = Application.tmp.lastYPlace == 0 ? Math.round((ScreenHeight - AppStartVars.height) / 2) : Application.tmp.lastYPlace;

				Application.move(xPos, yPos, Application.tmp.moveVelocity);
				Application.dimension(AppStartVars.width, AppStartVars.height, Application.tmp.resizeVelocity, Application.controls.setPosition);

				AppBody.fadeIn('fast');
			}
			else {
				AppBody.css('overflow', 'hidden');
				Application.tmp.resized = true;
				resizeBtn.prop('title', 'Maximizar');
				resizeBtn.text('+');

				AppHeaderTitle.text(AppName.substring(0, Application.tmp.resizeTitleLength) + '...');
				AppHeaderMenu.fadeOut('fast');
				AppHeaderControls.hide();

				Application.move(Application.tmp.lastResizeXPlace, Application.tmp.lastResizeYPlace, Application.tmp.moveVelocity);
				Application.dimension(AppStartVars.resizeWidth, AppStartVars.resizeHeight, Application.tmp.resizeVelocity, Application.controls.setPosition);

				AppBody.fadeOut('fast');
			}
		}
	},

	errorHandler: function(){
		var logFile = AppDataPath + 'log';
		if(!File.exists(logFile)){ File.create(logFile, ''); }
		window.onerror = function(e){
			var
			closer	= Shell.Popup('Ha ocurrido un error: ' + e, 0, AppName, 4),
			log	= Rec.open(logFile);

			log[log.length] = AppDate.getTime() +':' + e;
			Rec.save(logFile, log);
			if(closer == 6){ $(window.close); }
			return true;
		}
	},

	background: function(){
		var
		AppId		= String($.now()),
		AppDate		= new Date(),
		AppFirstTime	= AppDate.getDate() + "/" + AppDate.getMonth() + "/" + AppDate.getFullYear() + "  " + AppDate.getHours() + ":" + AppDate.getMinutes() + ":" + AppDate.getSeconds(),
		AppPhantom	= Rec.open(AppPhantomFile),
		AppVisitedTimes	= (AppPhantom["visitedApp"] == null ? 0 : parseInt(AppPhantom["visitedApp"]) + 1),
		AppLastTimeOpen = AppPhantom["lastOpen"] || AppFirstTime;

		if(!File.exists(AppPhantomFile)){
			File.create(AppPhantomFile, '');
			AppPhantom = Rec.open(AppPhantomFile);
		}

		if(AppPhantom["isProgramOpen"] && AppId != AppPhantom["isProgramOpen"]){
			alert('Programa ya abierto');
			window.close();
		}
		else {
			AppPhantom["isProgramOpen"] = AppId;
			AppPhantom["visitedApp"] = AppVisitedTimes;
			AppPhantom["lastOpen"] = AppFirstTime;
			window.onunload = function(){
				clearInterval(AppBackgroundInt);
				try {
					Rec.deleteEntry(AppPhantomFile, "isProgramOpen");
				} catch(e) {}
			};

			function fn_background_rotator(){

				var _openPhantom = 1, _savePhantom = 1;

				try { AppPhantom = Rec.open(AppPhantomFile); }
				catch(e){ _openPhantom = false; }
				try {
					AppPhantom["isProgramOpen"] = AppId;
					Rec.save(AppPhantomFile, AppPhantom);
				}
				catch(e){ _openPhantom = false; }

				//alert(_openPhantom +'-'+ _savePhantom);
			}

			AppBackgroundInt = setInterval(fn_background_rotator, 2500);
			fn_background_rotator();
		}
	},

	posXFilter: function(x){
		x = x <= 0 ? 0 : x;
		x = (Number(x) + AppWidth) > ScreenWidth ? ScreenWidth - AppWidth : x;
		return x;
	},
	posYFilter: function(y){
		y = y <= 0 ? 0 : y;
		y = (Number(y) + AppHeight) > ScreenHeight ? ScreenHeight - AppHeight : y;
		return y;
	},

	perform: function(position){
		var width = AppWidth, height = AppHeight;
		AppPosX = Math.round((ScreenWidth - width) / 2);
		AppPosY = Math.round((ScreenHeight - height) / 2);
		window.resizeTo(width, height);
		window.moveTo(AppPosX, AppPosY);
	},

	activateMenu: function(){
		var menuContainer = $('#AppMenu');
		menuContainer.appendTo(AppHeaderMenu);

		var topMenuItems = menuContainer.find('.menu > .menu-item');
		var allSubmenus = $('.submenu');
		var closeTimer = null;

		function closeAllMenus(){
			allSubmenus.stop(true, true).fadeOut('fast');
			menuContainer.find('.menu-item, .submenu-item').removeClass('menu-item-selected');
		}

		function closeChildSubmenus(container){
			container.find('[item-ref]').each(function(){
				var childRef = $(this).attr('item-ref');
				if(childRef){
					var childBox = $(childRef);
					childBox.stop(true, true).fadeOut('fast');
					closeChildSubmenus(childBox);
				}
				$(this).removeClass('menu-item-selected');
			});
		}

		function openSubmenu(src, isTopLevel){
			var targetSelector = src.attr('item-ref');
			if(!targetSelector) return;
			var outBox = $(targetSelector);
			if(!outBox.length) return;

			if(isTopLevel){
				allSubmenus.not(outBox).stop(true, true).fadeOut('fast');
				topMenuItems.not(src).removeClass('menu-item-selected');
			} else {
				var parentSubmenu = src.closest('.submenu');
				parentSubmenu.find('.submenu-item').not(src).each(function(){
					var siblingRef = $(this).attr('item-ref');
					if(siblingRef){
						var sibBox = $(siblingRef);
						sibBox.stop(true, true).fadeOut('fast');
						closeChildSubmenus(sibBox);
					}
					$(this).removeClass('menu-item-selected');
				});
			}

			src.addClass('menu-item-selected');

			outBox.css({ display: 'block', visibility: 'hidden' });
			var docWid = $(window).width();
			var docHei = $(window).height();
			var targetWid = outBox.outerWidth();
			var targetHei = outBox.outerHeight();
			var srcPos = src.offset();
			var srcWid = src.outerWidth();
			var srcHei = src.outerHeight();

			var top = 0, left = 0;

			if(isTopLevel){
				top = srcPos.top + srcHei;
				left = srcPos.left;
				if(left + targetWid > docWid){
					left = srcPos.left + srcWid - targetWid;
				}
			} else {
				top = srcPos.top;
				left = srcPos.left + srcWid;

				if(left + targetWid > docWid){
					left = srcPos.left - targetWid;
				}

				if(top + targetHei > docHei){
					top = docHei - targetHei - 4;
				}
			}

			if(top < 0) top = 0;
			if(left < 0) left = 0;

			outBox.css({
				top: top + 'px',
				left: left + 'px',
				visibility: 'visible',
				display: 'none'
			}).stop(true, true).fadeIn('fast');
		}

		function cancelClose(){
			if(closeTimer){
				clearTimeout(closeTimer);
				closeTimer = null;
			}
		}

		function startCloseTimer(){
			cancelClose();
			closeTimer = setTimeout(function(){
				closeAllMenus();
			}, 300);
		}

		topMenuItems.on('click', function(e){
			e.stopPropagation();
			cancelClose();
			var target = $(this).attr('item-ref');
			if(target && $(target).is(':visible')){
				closeAllMenus();
			} else {
				openSubmenu($(this), true);
			}
		});

		topMenuItems.on('mouseenter', function(){
			cancelClose();
			if(allSubmenus.is(':visible')){
				openSubmenu($(this), true);
			}
		});

		menuContainer.find('.submenu-item').on('mouseenter', function(){
			cancelClose();
			var item = $(this);
			if(item.attr('item-ref')){
				openSubmenu(item, false);
			} else {
				var parentSubmenu = item.closest('.submenu');
				parentSubmenu.find('.submenu-item').not(item).each(function(){
					var sibRef = $(this).attr('item-ref');
					if(sibRef){
						var sibBox = $(sibRef);
						sibBox.stop(true, true).fadeOut('fast');
						closeChildSubmenus(sibBox);
					}
					$(this).removeClass('menu-item-selected');
				});
			}
		});

		menuContainer.find('.submenu-item').on('click', function(e){
			if(!$(this).attr('item-ref')){
				closeAllMenus();
			}
		});

		menuContainer.on('mouseenter', cancelClose).on('mouseleave', startCloseTimer);
		allSubmenus.on('mouseenter', cancelClose).on('mouseleave', startCloseTimer);

		menuContainer.on('mouseover mousedown', function(){
			Application.tmp.dragging = false;
		});

		$(document).on('click', function(e){
			if(!$(e.target).closest('#AppMenu, .submenu').length){
				closeAllMenus();
			}
		});
	},


	init: function(){

		Application.background();
		Application.errorHandler();

		if(App.length){
			var haveTitle		= $('title');
			$(document).prop('title', haveTitle.length ? haveTitle.text() : AppName);

			var AppInitPos		= Application.perform();
			App			= $('body');

			AppBodyContent = App.html();
			App.empty().css({ width: AppWidth, height: AppHeight });

			App.html('<div id="AppHeader"><div id="AppHeaderControls"><a title="Minimizar" class="AppHeader-resizeBtn">_</a><a title="Cerrar" class="AppHeader-closeBtn">X</a></div><div id="AppHeaderIcon"></div><div id="AppHeaderTitle">' + AppName + '</div><div id="AppHeaderMenu"></div></div><div id="AppBody">' + AppBodyContent + '</div>');

			AppHeader		= App.find('#AppHeader');
			AppHeaderTitle		= App.find('#AppHeaderTitle');
			AppHeaderMenu		= App.find('#AppHeaderMenu');
			AppHeaderControls	= App.find('#AppHeaderControls');
			AppBody			= App.find('#AppBody');

			AppHeader.css('height', AppHeaderHeight);

			var
			AppBodyBorders		= (AppBody.outerHeight() - AppBody.height()),
			AppHeaderBorders	= (AppHeader.outerHeight() - AppHeaderHeight);

			AppHeader.css('height',	AppHeaderHeight - AppHeaderBorders);
			AppBody.css('height',	AppHeight - AppHeaderHeight - AppBodyBorders);

			App.fadeIn('fast');

			Application.controls.setPosition();

			AppHeaderControls.find('.AppHeader-closeBtn').click(Application.controls.close);
			AppHeaderControls.find('.AppHeader-resizeBtn').click(Application.controls.resize);

			AppHeaderControls.mouseover(function(){ Application.tmp.dragging = false; });

			Application.drag();
			Application.activateMenu();
		}
	}
}


var File = {
	create: function(fileName, fileContent, fileOverwrite){
		try {
			var FileGen = FileSystem.CreateTextFile((fileName || 'untitled.blank'), fileOverwrite);
			FileGen.WriteLine(fileContent || '');
			FileGen.Close();
			return FileGen;
		} catch(e) {
			return false;
		}
	},
	exists: function(fileName){
		try { return FileSystem.FileExists(fileName); } catch(e) { return false; }
	},

	content: function(fileName, fileContent, fileAdditionType){
		if(File.exists(fileName)){
			var file, ForReading = 1, ForWriting = 2;

			if(fileContent === undefined || (fileContent === null && $.type(fileContent) != 'string')){
				try {
					file = FileSystem.OpenTextFile(fileName, ForReading);
					var data = file.AtEndOfStream ? "" : file.ReadAll();
					file.Close();
					return data;
				} catch(e) {
					if(file) try { file.Close(); } catch(err){}
					return "";
				}
			}
			else {
				try {
					file = FileSystem.OpenTextFile(fileName, ForWriting, true);
					file.Write(fileContent);
					file.Close();
					return true;
				} catch(e) {
					if(file) try { file.Close(); } catch(err){}
					return false;
				}
			}
		}
		return false;
	},

	destroy: function(fileName){
		if(File.exists(fileName)){
			try { return FileSystem.DeleteFile(fileName, true); } catch(e) { return false; }
		}
		return false;
	}
}


var Rec = {
	open: function(fileName){
		if(File.exists(fileName)){
			var content = File.content(fileName), output = [];
			if(content.length){
				content = content.split('|');
				for(var i = 0, line; i < content.length; i++){
					line = content[i].split('=');
					output[line[0]] = line.slice(1).join('');
				}
			}
			return output;
		}
		return false;
	},
	save: function(fileName, recContent){
		if(File.exists(fileName)){
			var file, type, content, output = '';
			for(var key in recContent){
				content = recContent[key];
				type	= $.type(content);

				if(key && type != 'undefined' && type != 'null'){
					output += ('|' + key + '=' + String(content.replace(/[\|\=]/gi, ' ')));
				}
			}
			file = File.content(fileName, (output.length > 0 ? output.slice(1) : ''));
			return file;
		}
		return false;
	},

	deleteEntry: function(fileName, entryName){
		if(File.exists(fileName)){
			var file = Rec.open(fileName);

			if(isNaN(Number(entryName))){ delete file[entryName]; }
			else { file.splice(Number(entryName), 1); }

			Rec.save(fileName, file);

			return true;
		}
		return false;
	}
}



$(Application.init);

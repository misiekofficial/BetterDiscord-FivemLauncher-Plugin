/**
 * @name FivemLauncher
 * @author Misiek
 * @version 1.0.0
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "FivemLauncher",
			"author": "Misiek",
			"version": "1.0.0",
			"description": "Connecting with server in FiveM"
		},
		"changeLog": {
			"added": {
				"Ikona": "[+] Dodano koło profilu przycisk [GAMEPAD] do połączenia z wybranym serwerem",
				"Tłumaczenie": "[+] Dodano Angielskie oraz Polskie tłumaczenie"
			},

			"fixed": {
				"Łączenie": "[/] fix łączenia z serwerem",
				"Shell": "[/] fix error z łączeniem przez shell/przeglądarkę"
			}
		},

		"ServerComponents": {
			"serverip": "IP TUTAJ"
		}
	};
	
	return (window.Lightcord || window.LightCord) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return "Do not use LightCord!";}
		load () {BdApi.alert("Attention!", "By using LightCord you are risking your Discord Account, due to using a 3rd Party Client. Switch to an official Discord Client (https://discord.com/) with the proper BD Injection (https://betterdiscord.app/)");}
		start() {}
		stop() {}
	} : !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {

		//MAIN CODE OF FIVEM LAUNCHER

		var _this;
		
		const FivemLauncherComponent = class FivemLauncher extends BdApi.React.Component {
			render() {
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.PanelButton, Object.assign({}, this.props, {
					tooltipText: _this.labels.connect_label + config.ServerComponents.serverip,
					icon: iconProps => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, Object.assign({}, iconProps, {
						nativeClass: true,
						width: 20,
						height: 20,
						foreground: BDFDB.disCN.accountinfobuttonstrikethrough,
						name: BDFDB.LibraryComponents.SvgIcon.Names.GAMEPAD
					})),

					onClick: _ => {
						if (BDFDB.LibraryRequires.electron.shell.openExternal("fivem://connect/" + config.ServerComponents.serverip));
					}
				}));
			}
		};
		
		var sounds = [];
		
		return class FivemLauncherToggle extends Plugin {
			onLoad () {
				_this = this;
				
				this.patchedModules = {
					after: {
						Account: "render"
					}
				};
			}
			
			onStart () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			processAccount (e) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "PanelButton"});
				if (index > -1) {
					e.returnvalue.props.className = BDFDB.DOMUtils.formatClassName(e.returnvalue.props.className, BDFDB.disCN._gameactivitytoggleadded);
					children.unshift(BDFDB.ReactUtils.createElement(FivemLauncherComponent, {}));
				}
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "pl":		// Polish
						return {
							connect_label:					"Połącz się z serwerem: ",
						};
					default:		// English
						return {
							connect_label:					"Connect with Server: ",
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();

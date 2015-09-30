
(function () {
	$.extend(Koukun, {
		PetStatus: {}
	});
})();

(function() {
	$.extend(Koukun.PetStatus, {
		ParamTable: {
			Monster_Type: {
				0: "アンデッド型",
				1: "人間型",
				2: "悪魔型",
				3: "動物型",
				4: "神獣型"
			},
			Monster_Lineage: {
				0: "一般1",
				1: "一般2",
				2: "一般3",
				3: "一般4",
				//4: "セミボス1",
				//5: "セミボス2",
				//6: "セミボス3",
				//7: "ボス1",
				//8: "ボス2",
				//9: "ボス3"
				"all": "全て"
			},
			Instruct_Type: {
				0: "攻撃命令",
				1: "防御命令",
				2: "警戒命令",
				3: "特技命令"
			},
			RebirthPet_List: [1332, 1335,1334,1333,1336,1331,1329,1337,1328,1330]
		},
		Resource: {
			select_init_group: "部類選択",
			select_init_monster: "モンスター選択",
			select_init_level: "Level",
			select_init_instruct: "スキル選択",
						
			message_search_result: "検索 <span class='search-result-count'>%d</span>件",
			type_search_monster: "検索",
			type_rebirth_monster: "転生P",
			type_group_others: "その他",
			error_read_file: "データの読み込みに失敗しました。",
			error_refer_monster: "モンスターの参照に失敗しました。"
		}
	});
})();

(function(undefined) {
	
	var _ParamTable = Koukun.PetStatus.ParamTable;
	var _Resource = Koukun.PetStatus.Resource;
	
	function MainManager() {
		// Constructor
		this.monsterDataPath = "./data/monsterData.json";
		this.monsterData = null;
		this.monsterIndexTable = {};
		
		this.selectGroup = null;
		this.selectMonster = null;
		this.selectInstructType = null;
		this.numinMonsterLevel = null;
		this.numinTamerStr = null;
		this.numinTamerAgi = null;
		this.numinSkillAll = null;
		this.numinSkillInstruct = null;
		this.numinSkillEncourage = null;
		this.numinSkillPraise = null;
		this.numinSkillPepper = null;
		this.numinSkillBlue = null;
		this.numinSkillStorm = null;
		this.numinSkillMild = null;
		this.numinSkillMobility = null;
		
		this.selectedMonster = null;
		this.selectedInstructType = null;
		this.pageMaxLength = 30;
	}
	
	MainManager.prototype = {
		// Instance members
		
		// Public
		initialize: function() {
			this._setEventHandler();
			this._createMonsterIndexTable();
			this._createSelect_group();
			this._createSelect_monster();
			this._createSelect_instructType();
			this._createNumin_level();
			this._createNumin_status();
			this._createNumin_skills();
		},
		loadDataSource: function() {
			var that = this;
			var $dfd_MonsterData = new $.Deferred();
			
			$.getJSON(this.monsterDataPath, function(response) {
				that.monsterData = response;
				$dfd_MonsterData.resolve();
			}).fail($dfd_MonsterData.reject);
			
			return $.when($dfd_MonsterData);
		},
		
		// Private
		_setEventHandler: function() {
			var that = this;
			
			$(".search-form input").on("keydown", function (evt) {
				if (evt.keyCode === 13) {
					that.onSearch();
				}
			});
			$(".search-form button").on("click", $.proxy(this.onSearch, this));
		},
		_createMonsterIndexTable: function() {
			var that = this;
			
			$.each(this.monsterData, function(index, _monster) {
				that.monsterIndexTable[_monster.Id] = index;
			});
		},
		_createSelect_group: function() {
			var that = this;
			var listData = [];
			
			$.each(_ParamTable.Monster_Type, function(typeIndex, typeName) {
				var optionsData = [];
				
				$.each(_ParamTable.Monster_Lineage, function(lineageIndex, lineageName) {
					optionsData.push({
						key: typeIndex + "-" + lineageIndex,
						value: lineageName
					});
				});
				
				listData.push({
					groupName: typeName,
					options: optionsData
				});
			});
			
			// その他 RebirthPet_List
			listData.push({
				groupName: _Resource.type_group_others,
				options: [{
					key: "search",
					value: _Resource.type_search_monster
				}, {
					key: "rebirth",
					value: _Resource.type_rebirth_monster
				}]
			})
			
			var selectOption = {
				selectWidth: 120,
				listWidth: 290,
				optionWidth: 50,
				initText: _Resource.select_init_group,
				openListenerType: "click",
				onClick_option: $.proxy(this.onClick_selectGroup, this)
			};
			
			this.selectGroup = new Koukun.cl.UI_Select(selectOption, listData);
			
			$(".select-group").append(this.selectGroup.getContainer());
		},
		
		_createSelect_monster: function() {
			var selectOption = {
				selectWidth: 140,
				listWidth: 390,
				optionWidth: 120,
				initText: _Resource.select_init_monster,
				openListenerType: "click",
				isPageView: true,
				isPageBtnOnTop: true,
				onClick_option: $.proxy(this.onClick_selectMonster, this)
			};
			
			this.selectMonster = new Koukun.cl.UI_Select(selectOption, []);
			
			$(".select-monster").append(this.selectMonster.getContainer());
		},
		
		_createSelect_instructType: function() {
			var that = this;
			var listData = [];
			var optionsData = [];
			
			$.each(_ParamTable.Instruct_Type, function(typeIndex, typeName) {
				optionsData.push({
					key: typeIndex,
					value: typeName
				});
			});
			
			listData.push({
				groupName: "",
				options: optionsData
			});
			
			var selectOption = {
				selectWidth: 90,
				listWidth: 95,
				optionWidth: 80,
				initText: _Resource.select_init_instruct,
				openListenerType: "click",
				onClick_option: $.proxy(this.onClick_selectInstructType, this)
			};
			
			this.selectInstructType = new Koukun.cl.UI_Select(selectOption, listData);
			this.selectInstructType.select(0);
			
			$(".select-instruct").append(this.selectInstructType.getContainer());
		},
		
		_createNumin_level: function() {
			this.numinMonsterLevel = new Koukun.cl.UI_NumberInput({
				selectWidth: 50,
				listMarginLeft: 0,
				initText: 600,
				maxLength: 4,
				selectIcon: "▼",
				openListenerType: "click", // click/hover
				onChange: $.proxy(this._setMonsterDetails, this)
			});
			
			$(".input-status-level").append(this.numinMonsterLevel.getContainer());
		},
		
		_createNumin_status: function() {
			var options = {
				selectWidth: 70,
				listMarginLeft: 0,
				initText: 0,
				maxLength: 7,
				selectIcon: "▼",
				openListenerType: "click", // click/hover
				onChange: $.proxy(this._setMonsterDetails, this)
			};
			this.numinTamerStr = new Koukun.cl.UI_NumberInput(options);
			this.numinTamerAgi = new Koukun.cl.UI_NumberInput(options);
			
			$(".input-status-str").append(this.numinTamerStr.getContainer());
			$(".input-status-agi").append(this.numinTamerAgi.getContainer());
		},
		
		_createNumin_skills: function() {
			var that = this;
			var options = {
				selectWidth: 45,
				listMarginLeft: 0,
				initText: 0,
				maxLength: 3,
				selectIcon: "▼",
				openListenerType: "click", // click/hover
				onChange: $.proxy(this._setMonsterDetails, this)
			};
			
			this.numinSkillAll = new Koukun.cl.UI_NumberInput($.extend({}, options, {
				onChange: function(value) {
					that.numinSkillInstruct.setValue(value);
					that.numinSkillEncourage.setValue(value);
					that.numinSkillPraise.setValue(value);
					that.numinSkillPepper.setValue(value);
					that.numinSkillBlue.setValue(value);
					that.numinSkillStorm.setValue(value);
					that.numinSkillMild.setValue(value);
					that.numinSkillMobility.setValue(value);
				}
			}));
			this.numinSkillInstruct = new Koukun.cl.UI_NumberInput(options);
			this.numinSkillEncourage = new Koukun.cl.UI_NumberInput(options);
			this.numinSkillPraise = new Koukun.cl.UI_NumberInput(options);
			this.numinSkillPepper = new Koukun.cl.UI_NumberInput(options);
			this.numinSkillBlue = new Koukun.cl.UI_NumberInput(options);
			this.numinSkillStorm = new Koukun.cl.UI_NumberInput(options);
			this.numinSkillMild = new Koukun.cl.UI_NumberInput(options);
			this.numinSkillMobility = new Koukun.cl.UI_NumberInput(options);
			
			$(".input-all-skill").append(this.numinSkillAll.getContainer());
			$(".input-skill-instruct").append(this.numinSkillInstruct.getContainer());
			$(".input-skill-encourage").append(this.numinSkillEncourage.getContainer());
			$(".input-skill-praise").append(this.numinSkillPraise.getContainer());
			$(".input-skill-pepper").append(this.numinSkillPepper.getContainer());
			$(".input-skill-blue").append(this.numinSkillBlue.getContainer());
			$(".input-skill-storm").append(this.numinSkillStorm.getContainer());
			$(".input-skill-mild").append(this.numinSkillMild.getContainer());
			$(".input-skill-mobility").append(this.numinSkillMobility.getContainer());
		},
		
		// 表示?
		_setMonsterDetails: function() {
			var _monster = this.selectedMonster;
			
			if (!_monster) {
				return;
			}
			
			var _floor = Math.floor;
			var skillEncourageBonus = this.numinSkillEncourage.getValue() * 0.8; // 励ます
			var skillPraiseBonus = Math.min(this.numinSkillPraise.getValue() * 0.8, 75); // 褒める
			var skillInstructLevel = this.numinSkillInstruct.getValue();
			var skillInstructAtk = 1;
			var skillInstructDef = 1;
			var skillPepperLevel = this.numinSkillPepper.getValue();
			var skillBlueLevel = this.numinSkillBlue.getValue();
			var skillStormLevel = this.numinSkillStorm.getValue();
			var skillMildLevel = this.numinSkillMild.getValue();
			var skillMobilityLevel = this.numinSkillMobility.getValue();
			var skillPepperBonus = 1;
			var skillBlueBonus = 1;
			var skillStormBonusDef = 1;
			var skillStormBonusSpeed = 1;
			var skillMildBonus = 1;
			var skillMobilityBonus = 1;
			
			// 唐辛子
			if (skillPepperLevel > 0) {
				skillPepperBonus = (skillPepperLevel * 1.5 + 115) / 100;
			}
			
			// 憂鬱
			if (skillBlueLevel > 0) {
				if (_monster.Type === 0) { // アンデッド型
					skillBlueBonus = (skillBlueLevel * 1 + 115) / 100;
				} else {
					skillBlueBonus = (skillBlueLevel * 0.5 + 107) / 100;
				}
			}
			
			// 風雨
			if (skillStormLevel > 0) {
				skillStormBonusDef = (skillStormLevel * 1 + 115) / 100;
				
				if (_monster.Type === 2) { // 悪魔型
					skillStormBonusSpeed = (skillStormLevel * 1.5 + 105) / 100;
				}
			}
			
			// のどか
			if (skillMildLevel > 0) {
				if (_monster.Type === 3) { // 動物型
					skillMildBonus = (skillMildLevel * 3 + 140) / 100;
				} else {
					skillMildBonus = (skillMildLevel * 2 + 120) / 100;
				}
			}
			
			// 気まぐれ
			if (skillMobilityLevel > 0) {
				if (_monster.Type === 4) { // 神獣型
					skillMobilityBonus = skillMobilityLevel * 3 + 10;
				} else {
					skillMobilityBonus = skillMobilityLevel * 1 + 5;
				}
			}
			
			// 命令
			switch(this.selectedInstructType) {
				case "0": // 攻撃命令
					skillInstructAtk = (skillInstructLevel * 3 + 100) / 100;
					break;
				case "1": // 防御命令
					skillInstructDef = (skillInstructLevel * 4 + 100) / 100;
					break;
				case "2": // 警戒命令
					skillInstructAtk = (skillInstructLevel * 2 + 110) / 100;
					skillInstructDef = (skillInstructLevel * 3 + 115) / 100;
					break;
				case "3": // 特技命令
					skillInstructAtk = 1;
					skillInstructDef = 1;
					break;
			};
			
			var level = this.numinMonsterLevel.getValue() + skillPraiseBonus;
			var charaStr = this.numinTamerStr.getValue();
			var charaAgi = this.numinTamerAgi.getValue();
			var defaultHp = _monster.StatusParam.Hp / 100;
			var levelBonus = _monster.StatusParam.LvBonus / 10;
			var conditionBonus = _monster.StatusParam.ConBonus / 10;
			var statusFactor = _monster.StatusParam.Factor / 100000;
			var statusStr = _floor((_monster.StatusParam.Str * statusFactor * (level - 1) + _monster.StatusParam.Str) * skillPepperBonus * (1 + charaStr / 10000));
			var statusAgi = _floor((_monster.StatusParam.Agi * statusFactor * (level - 1) + _monster.StatusParam.Agi) * skillPepperBonus * (1 + charaStr / 10000));
			var statusCon = _floor((_monster.StatusParam.Con * statusFactor * (level - 1) + _monster.StatusParam.Con) * skillPepperBonus * (1 + charaStr / 10000));
			var statusWis = _floor((_monster.StatusParam.Wis * statusFactor * (level - 1) + _monster.StatusParam.Wis) * skillPepperBonus * (1 + charaStr / 10000));
			var statusInt = _floor((_monster.StatusParam.Int * statusFactor * (level - 1) + _monster.StatusParam.Int) * skillPepperBonus * (1 + charaStr / 10000));
			var statusChs = _floor((_monster.StatusParam.Chs * statusFactor * (level - 1) + _monster.StatusParam.Chs) * skillPepperBonus * (1 + charaStr / 10000));
			var statusLuc = _floor((_monster.StatusParam.Luc * statusFactor * (level - 1) + _monster.StatusParam.Luc) * skillPepperBonus * (1 + charaStr / 10000));
			var atMinBonus = _monster.AtParam.MinBonus / 100;
			var atMaxBonus = _monster.AtParam.MaxBonus / 100;
			var defBonus = _monster.StatusParam.DefBonus / 100;
			var atSpeed = _monster.AtParam.Speed / skillStormBonusSpeed / 100;
			var hp = (levelBonus * level + defaultHp + conditionBonus * statusCon) * skillMildBonus;
			var atMin = (atMinBonus * (level - 1) + _monster.AtParam.Min + skillEncourageBonus) * (1 + statusStr / 200) * skillInstructAtk * skillBlueBonus;
			var atMax = (atMaxBonus * (level - 1) + _monster.AtParam.Max + skillEncourageBonus) * (1 + statusStr / 200) * skillInstructAtk * skillBlueBonus;
			var def = (defBonus * (level - 1) + _monster.StatusParam.Def + skillEncourageBonus + charaAgi / 10) * (1 + statusCon / 100) * skillInstructDef * skillStormBonusDef;
			var resFire = _monster.Resist.Fire + statusWis / 20 + skillMobilityBonus;
			var resWater = _monster.Resist.Water + statusWis / 20 + skillMobilityBonus;
			var resEarth = _monster.Resist.Earth + statusWis / 20 + skillMobilityBonus;
			var resWind = _monster.Resist.Wind + statusWis / 20 + skillMobilityBonus;
			var resLight = _monster.Resist.Light + statusWis / 20 + skillMobilityBonus;
			var resDark = _monster.Resist.Dark + statusWis / 20 + skillMobilityBonus;
			
			$(".result-table-level").text(_floor(level));
			$(".result-table-hp").text(_floor(hp));
			$(".result-table-attack").text(_floor(atMin) + "～" + _floor(atMax));
			$(".result-table-defense").text(_floor(def));
			$(".result-table-at-speed").text(_floor(atSpeed * 16) + " frame");
			
			$(".result-table-res-fire").text(_floor(resFire));
			$(".result-table-res-water").text(_floor(resWater));
			$(".result-table-res-earth").text(_floor(resEarth));
			$(".result-table-res-wind").text(_floor(resWind));
			$(".result-table-res-light").text(_floor(resLight));
			$(".result-table-res-dark").text(_floor(resDark));
			
			$(".retult-table-status-str").text(_floor(statusStr));
			$(".retult-table-status-agi").text(_floor(statusAgi));
			$(".retult-table-status-con").text(_floor(statusCon));
			$(".retult-table-status-wis").text(_floor(statusWis));
			$(".retult-table-status-int").text(_floor(statusInt));
			$(".retult-table-status-chs").text(_floor(statusChs));
			$(".retult-table-status-luc").text(_floor(statusLuc));
		},
		
		_search_of_MonsterType: function(key, value) {
			var that =this;
			var matchedMonsterList = [];
			var monsterCount = 0;
			var groupCount = -1;
			var groupMaxCount = 0;
			var listData = [];
			var optionData = [];
			
			$.each(this.monsterData, function(index, monster) {
				if (key === "rebirth") {
					if (_ParamTable.RebirthPet_List.indexOf(monster.Id) !== -1) {
						matchedMonsterList.push(monster);
					}
				} else {
					var keys = key.split("-");
					var monsterType = parseInt(keys[0]);
					var monsterLineage = keys[1] === "all" ? keys[1] : parseInt(keys[1]);
					
					if (monster.Type === monsterType) {
						if (monsterLineage === "all" || monster.Lineage === monsterLineage) {
							matchedMonsterList.push(monster);
						}
					}
				}
			});
			
			matchedMonsterList.sort(function(a, b) {
				if (a.Name < b.Name) {
					return -1;
				}
				if (a.Name > b.Name) {
					return 1;
				}
				return 0;
			});
			
			$.each(matchedMonsterList, function(index, monster) {
				if (monsterCount % that.pageMaxLength == 0) {
					groupCount++;
					
					if (monsterCount + that.pageMaxLength > matchedMonsterList.length) {
						groupMaxCount = matchedMonsterList.length;
					} else {
						groupMaxCount = (groupCount + 1) * that.pageMaxLength;
					}
					listData[groupCount] = {
						groupName: (groupCount * that.pageMaxLength + 1) + "～" + groupMaxCount,
						options: []
					}
				}
				
				listData[groupCount].options.push({
					key: monster.Id,
					value: monster.Name
				});
				
				monsterCount++;
			});
			
			this.selectMonster.reset({}, listData);
			this.selectMonster.select();
		},
		
		_search_of_MonsterName: function(key, value) {
			var that =this;
			var keyword = $(".search-form input").val();
			var r_keyword;
			var matchedMonsterList = [];
			var matchCount = 0;
			var monsterCount = 0;
			var groupCount = -1;
			var groupMaxCount = 0;
			var listData = [];
			var optionData = [];
			
			if (keyword !== "") {
				r_keyword = new RegExp("(" + keyword + ")");
				
				$.each(this.monsterData, function(index, monster) {
					var monsterName = monster.Name;
					if (r_keyword.test(monsterName)) {
						matchedMonsterList.push(monster);
					}
				});
			}
			
			matchedMonsterList.sort(function(a, b) {
				if (a.Name < b.Name) {
					return -1;
				}
				if (a.Name > b.Name) {
					return 1;
				}
				return 0;
			});
			matchCount = matchedMonsterList.length;
			
			$.each(matchedMonsterList, function(index, monster) {
				if (monsterCount % that.pageMaxLength == 0) {
					groupCount++;
					
					if (monsterCount + that.pageMaxLength > matchCount) {
						groupMaxCount = matchCount;
					} else {
						groupMaxCount = (groupCount + 1) * that.pageMaxLength;
					}
					listData[groupCount] = {
						groupName: (groupCount * that.pageMaxLength + 1) + "～" + groupMaxCount,
						options: []
					}
				}
				
				listData[groupCount].options.push({
					key: monster.Id,
					value: monster.Name.replace(r_keyword, "<span class='search-keyword'>$1</span>")
				});
				
				monsterCount++;
			});
			
			this.selectMonster.reset({}, listData);
			this.selectMonster.select();
			this.selectGroup.setSelectText(scanf(_Resource.message_search_result, matchCount));
		},
		
		_getMonster_by_Id: function(monsterId) {
			return this.monsterData[this.monsterIndexTable[monsterId]];
		},
		
		// Event
		onSearch: function() {
			this.selectGroup.select("search");
		},
		
		onClick_selectGroup: function(key, lineageName) {
			var keys, typeName;
			
			if (key === "search") {
				this._search_of_MonsterName();
			} else if (key === "rebirth") {
				this._search_of_MonsterType(key);
			} else {
				keys = key.split("-");
				typeName = _ParamTable.Monster_Type[keys[0]];
				this.selectGroup.setSelectText(typeName + " " + lineageName);
				this._search_of_MonsterType(key);
			}
		},
		
		onClick_selectMonster: function(monsterId, value) {
			var monster = this._getMonster_by_Id(monsterId);
			
			if (monster) {
				this.selectedMonster = monster;
				this._setMonsterDetails();
			} else {
				alert(_Resource.error_refer_monster);
			}
		},
		
		onClick_selectInstructType: function(key, value) {
			this.selectedInstructType = key;
			this._setMonsterDetails();
		}
	}
	
	function scanf(format) {
		var i;
		var output = format;
		
		for (i = 1; i < arguments.length; i++) {
			output = output.replace(/%[cdfosx]/, arguments[i]);
		}
		
		return output;
	}
	
	$.extend(Koukun.PetStatus, {
		MainManager: MainManager
	});
})();

(function() {
	$(document).ready(function() {
		var MainManager = new Koukun.PetStatus.MainManager();
		
		MainManager.loadDataSource().done(function() {
			console.time("Initialize");
			MainManager.initialize();
			console.timeEnd("Initialize");
		}).fail(function() {
			alert(Koukun.PetStatus.Resource.error_read_file);
		});
	});
})();

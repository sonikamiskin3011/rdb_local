// load options of Selects
function getSelectValues(sFrom) {
	if(!window.selects) {
        $("div[id='disPlay']").show();
        disactivateOrActiveFields(true);

		let selects = []
        let promises = []
        window.selects = []

		$("select:not(.exempt-select)").each(function(index, value){
          selects.push(value.name);
        });

        for(let sel in selects) {
			window.selects.push(new Promise((resolve, reject) => {
				$.getJSON('/_tables/', {
						message:"FORM",
						payload:selects[sel]
					},
					data => {}).fail((jqxhr, textStatus, error) => {
						var err = textStatus + ": " + error;
						reject(err);
					}).done(data => {
						if(data.message == "Success") {
							data.db2_data.unshift([0, ""]);
							resolve({[selects[sel]] : data});
						}
					})
				}));
        }
    }

	var counter = 0;
    // COMMENT THIS CODE FROM HERE
    Promise.all(window.selects).then(data => {
        // $("select[name=tower]").remove('<')
        for(let obj in data) {
            let sSelectName = Object.keys(data[ obj ]);

			if(sSelectName[0] === 'role') { window.oRoleSelect = data[obj][sSelectName[0]].db2_data; }
			if(sSelectName[0] === 'rep_country') { window.oMktSelect = data[obj][sSelectName[0]].db2_data; }

            for(let item in data[obj][sSelectName[0]].db2_data) {
                const aName = data[obj][sSelectName[0]].db2_data[item];

				if(typeof aName[ 1 ] == 'undefined') {
                    $("select[name = " + sSelectName[0] + "]").append($("<option>", {
                        text:aName[0],
                        value:aName[0],
                        always_hidden:''
                    }));
                } else {
                    var text_v = aName[1];
                    var value_v = aName[1];
                    $("select[name = " + sSelectName[0] + "]").append($("<option>", {
                        id_db:aName[0],
                        text:text_v,
                        value:value_v,
                        always_hidden:''
                    }));

                    // "<option id_db=" + aName[ 0 ] + ">" + aName[ 1 ] + "</option>")
                }
            }
        }

        $("#load-icon").removeClass();

        disactivateOrActiveFields(false);

        $("div[id='disPlay']").hide();

        if(sFrom === "new") { $("[name='status']").val("Active"); }

		// for view, put what was in document
        if(window.aSelectValues) {
            var aNameOfSelect = Object.keys(window.aSelectValues[0]);

			for(var i = 0; i < aNameOfSelect.length; i++) {
                $("select[name='" + aNameOfSelect[i] + "']").val(window.aSelectValues[0][aNameOfSelect[i]]);
            }

			setGeoMkt($("input[name='country_l']")[0].name, $("select[name='geo-mkt-mkt1']")[0].name);

            setSelectRelationship($("select[name='tower']"));
            delete window.aSelectValues;

			//Initial Checks after cloning
    		copyInitialSquadRelationship();
			checkTower();
			repopulateNewFields();
			dateLoad();
			statusCheckInit();
	    	checkOrg();
			squadNameDD();
			/*When EDIT button is clicked in View, mimic onChange Tower*/
			onEditButton();
			/*end mimic onChange Tower*/
			/*squadToDDInit();*/
			copyInitialSubdomain();
        }
        // $("option[value=---]").val("---")
    }).catch(data => {
        $("div[id='disPlay']").hide();
        swal({
            title:'Error!',
            text:'The client could not get data from server. "' + data + '"',
            icon:"error",
            buttons:{cancel:false, confirm:"Close"}
        })
        $("select:not(.exempt-select)").attr("disabled", true);
    })
}

function checkForm() {
	var result = "FTE not fully allocated!";
    var sClasses = $("i[name='icon-ver']")[0].getAttribute("class");
    if(sClasses) {
        var aClasses = sClasses.split(" ");
        for(var i = 0; i < aClasses.length; i++) {
            if(aClasses[i] === "green") { result = ""; }
        }
    }

    if($("select[name='tower']").val() == "") { result = "Tower is not selected!"; }
	return result;
}

function getInputData(DomRef) { // before Save, get Document information
    var array = [];
    var object = {};
    for (var i = 0; i < DomRef.length; i++) {
        sObjPropertyName = DomRef[i].getAttribute("name");
        sInputValue = $(DomRef[i]).val()
        object[sObjPropertyName] = sInputValue;
    }
    array.push(object)
    return array;
}

function getInputTable(DOMReftableData, oTableName) { // before Save, get Sub-Document information
    var array = [];

    var nTR_Length = DOMReftableData.find("tr").length;
    for (var i = 0; i < nTR_Length; i++) {
        var nTD_Length = $(DOMReftableData.find("tr")[i]).find("td").length
        var oRow = {};
        for (var j = 1; j < nTD_Length; j++) {
            var sTD_Element = $(DOMReftableData.find("tr")[i]).find("td")[j].innerHTML;
            var sObjPropertyName = oTableName[j].getAttribute("modal-name");
            if (sObjPropertyName === "o2o") {
                oRow[sObjPropertyName] = parseInt(sTD_Element);
            } else {
                oRow[sObjPropertyName] = sTD_Element;
            }
        }
        array.push(oRow);
    }
    return array;
}


function disactivateOrActiveFields(state) {
    $("input[name='email-load']").prop('disabled', state);
    // $("#clone").prop('disabled', state);
    //$("#add").prop('disabled', state);
    $("button[name='load-bp']").prop('disabled', state);
    $("select[name='tower']").prop('disabled', state);
    $("select[name='status']").prop('disabled', state);
    $("select[name='area']").prop('disabled', state);
}

// =================================================================== --- set one relationship PROCESS
function SelectInRelationship(parent_name, child_name) {
    var parent = $("select[name='" + parent_name + "'] option:selected").attr("id_db");
    $("select[name='" + child_name + "'] option").attr("selected", false).hide();
    if ($($("select[name='" + child_name + "'] option[id_db='" + parent + "']")).length === 1) {
        $("select[name='" + child_name + "'] option[id_db=''][always_hidden='']").show();
        $($("select[name='" + child_name + "'] option[id_db='" + parent + "']")[0])[0].selected = true
    } else {
        $("select[name='" + child_name + "'] option[id_db=''][always_hidden='']").show();
        $("select[name='" + child_name + "']")[0].selectedOptions[0].selected = false
    }

    $("select[name='" + child_name + "'] option[id_db='" + parent + "'][always_hidden='']").show();
    //checkSubRole();
}

// ==================================================== Set Relationship between Selects ( parent -> child )
function setSelectRelationship(theThis) {
    SelectInRelationship($(theThis).attr("name"), $(theThis).attr("child")); // --- set one relationship

	// --- set relationship if change "Tower"
    if($(theThis).attr("name") === "tower") {
        var sMasterName = $(".master").attr("name");
        var sChildName = $(".master").attr("child");
        var sOrganizationFieldValue = $(".master").val();
        selectRoleOption(sOrganizationFieldValue, sMasterName, sChildName);
		selectMktOptions(sOrganizationFieldValue, "rep_country");
    }
}

// ================================================= Set GEO/Mkt field, find this "Country Location" in GEO/Mkt Select List
function setGeoMkt(parent_name, child_name) { 
    var parent = $("input[name='" + parent_name + "']").attr("value") || $("input[name='" + parent_name + "']").val();
    $("select[name='" + child_name + "'] option").attr("selected", false).hide();
    var DomRefChildSelect = $("select[name='" + child_name + "']")[0].options;
    for(var i = 0; i < DomRefChildSelect.length; i++){
        var oId_Db_name = DomRefChildSelect[i].getAttribute("id_db");
        oId_Db_name = oId_Db_name.split(", ");
        for(var t = 0; t < oId_Db_name.length; t++){
            if(oId_Db_name[t] === parent){
                $(DomRefChildSelect[i]).show();
                $(DomRefChildSelect[i]).attr("selected", true);
                break;
            }
        }
    }
}

function read_table() { // ===================================================================
    var table = []
    for (var i = 0; i < $(".data-table tr").length; i++) {
        var tmp = []
        if($(".data-table tr")[i].cells[0].getAttribute("id") !== null && $(".data-table tr")[i].cells[0].getAttribute("old") !== null){ // if had id and attribute old=true
            tmp.push([parseInt($(".data-table tr")[i].cells[0].getAttribute("id")), 0, true]);
        }
        if($(".data-table tr")[i].cells[0].getAttribute("id") !== null && $(".data-table tr")[i].cells[0].getAttribute("old") === null){  // if had id
            tmp.push([parseInt($(".data-table tr")[i].cells[0].getAttribute("id")), 0]);
        }
        $('.data-table td[row-index="' + i + '"]').each(function () {
            var value = $(this).text();
            var col = $(this).attr("col-index");
            tmp.push([value, col]);
        });
        if (tmp.length !== 0) {
            table.push(tmp);
        }
    }
    return table;
}

function write_table(table) {
	$(".data-table").html("");
    $(".wait-radio").attr("disabled", true);

	var totalFTE = 0;
	var setId = "";

    for(i = 0; i < table.length; i++) {
        var start = 0;
        var plus = 1;
        $(".data-table").append("<tr row-index='" + i.toString() + "' > </tr>");
        // if has id
    	if(table[i][0][1] === 0) {
			setId += "id='" + table[i][0][0] + "'";
            start++;
            plus = 0;
            // if has attribute old=true
            if(!!table[i][0][2]) {
                setId += " old='" + table[i][0][2] + "'";
            }
        }

        $("tr[row-index='" + i.toString() + "']").append("<td style='width: 2%;' " + setId + "> <input type='radio' name='selected-row' row-index='" + i.toString() + "' col-index='0'></td>");
        setId = '';

		for(j = start; j < table[i].length; j++) {
            $("tr[row-index='" + i.toString() + "']").append("<td row-index='" + i.toString() + "' col-index='" + (j + plus).toString() + "'>" + table[i][j][0] + "</td>");
            if(j == table[i].length - 1) {
                totalFTE = (parseFloat(totalFTE) + parseFloat(table[i][j][0]))
                window.totalFTE = totalFTE;
            }
        }
    }

    $("input[type='radio']").bind("click", function(e){
        $(".wait-radio").attr("disabled", false);
    });

    checkFTE();
}

function checkFTE() {
	window.totalFTE = parseFloat(window.totalFTE).toFixed(2);
	var totalFTE = parseFloat($("input[name='total-fte']").val()).toFixed(2);

    if(window.totalFTE) {
        $("em[name='calc-fte']").text("Total FTE = " + window.totalFTE.toString() + " ");
        if(window.totalFTE === totalFTE) {
            $("em[name='calc-ver']").text("");
            $("i[name='icon-ver']").removeClass().addClass("fa fa-check-circle green");
            $("button[name='exit'][value='save']").removeAttr("type");
        } else {
            if(window.totalFTE < totalFTE) {
                $("em[name='calc-ver']").text("Full FTE not allocated!");
            } else {
                $("em[name='calc-ver']").text("Allocated more FTE then available!");
            }

            $("i[name='icon-ver']").removeClass().addClass("fa fa-minus-circle red");
            $("button[name='exit'][value='save']").attr("type", "button");
        }
    }
}

function read_modal() {
	var row = [];
    $("th").each(function(e) {
        if($("[name='" + $(this).attr("modal-name") + "']").length > 0) {
            row.push([$("[name='" + $(this).attr("modal-name") + "']").val(), $(this).attr("col-index")]);
        }
    });
	var totalFTE = parseFloat($("input[name='total-fte']").val()).toFixed(2);
    totalFTE = totalFTE * (Number(row[row.length - 10][0].replace("%", "")) / 100).toFixed(2);
    row.push([totalFTE.toString()]);
    return row;
}

function selectRoleOption(sValue, sMasterName, sChildName) {
	$("select[name='" + sChildName + "'] option").attr("selected", false).hide();
    for(var i = 0; i < window.oRoleSelect.length; i++) {
        if(window.oRoleSelect[i][2] === sValue) {
            $("select[name='" + sChildName + "'] option[id_db='" + window.oRoleSelect[i][0] + "'][always_hidden='']").show();
        }
        if(sValue === "") { $("select[name='" + sChildName + "'] option[id_db=''][always_hidden='']").show(); }
    }
}

function selectMktOptions(sValue, sName) {
	if(sValue != "") {
		$("select[name='" + sName + "'] option").attr("selected", false).hide();
		for(var i = 0; i < window.oMktSelect.length; i++) {
			if(window.oMktSelect[i][2] === sValue || window.oMktSelect[i][2] === "" 
                || typeof window.oMktSelect[i][2] == "undefined" || window.oMktSelect[i][2] == null) {
				if(typeof window.oMktSelect[i][1] == "undefined") {
                    $("select[name='" + sName + "'] option[value='" + window.oMktSelect[i][0] + "'][always_hidden='']").show();
                } else {
                    $("select[name='" + sName + "'] option[value='" + window.oMktSelect[i][1] + "'][always_hidden='']").show();
                }
			}
		}
	}
}

function checkModal(row) {
    for (var i = 0; i < row.length; i++) {
        if(row[i][0] !== null){
            var sFindDash = row[i][0].search("- -");
            var sFindDashTwo = row[i][0].search("--");
            if (sFindDash >= 0 || sFindDashTwo >= 0 || row[i][0] === "") {
                return false;
            }
        }else{
            return false;
        }

    }
    return true;
}

// 0,1 ..... = 1
function checkLimitPCT(DOMRefName) {
    var field = DOMRefName.val() //|| DOMRefName.val().replace("%","");
    var parseField = parseFloat(field);

    if (parseField < 0 || parseField > 100 || parseField == null || field.search("%") !== -1) {
        swal({
            title: 'Warning!',
            text: DOMRefName[0].getAttribute("name").toUpperCase() + ",  must be a number between 0 and 100 (included)",
            icon: "warning",
            buttons: { cancel: false, confirm: "Close" }
        })
        $("button[model-button='changing']").prop('disabled', true);
        DOMRefName.val("")
    } else {
        $("button[model-button='changing']").prop('disabled', false);
    }
}

// 0,1 ..... = 1
function checkLimitO2O(DOMRefName) {
    var field = DOMRefName.val();
    var parseField = parseFloat(field);

    if (parseField < 0 || parseField > 100 || parseField == null || field.search("%") !== -1) {
        swal({
            title: 'Warning!',
            text: DOMRefName[0].getAttribute("name").toUpperCase() + ",  must be a number between 0 and 100 (included)",
            icon: "warning",
            buttons: { cancel: false, confirm: "Close" }
        })
        $("button[model-button='changing']").prop('disabled', true);
        DOMRefName.val("")
    } else {
        $("button[model-button='changing']").prop('disabled', false);
    }
}

function checkLimitNonSOM(DOMRefName) {
    var field = DOMRefName.val();
    var parseField = parseFloat(field);

    if (parseField < 0 || parseField > 100 || parseField == null || field.search("%") !== -1) {
        swal({
            title: 'Warning!',
            text: DOMRefName[0].getAttribute("name").toUpperCase() + ",  must be a number between 0 and 100 (included)",
            icon: "warning",
            buttons: { cancel: false, confirm: "Close" }
        })
        $("button[model-button='changing']").prop('disabled', true);
        DOMRefName.val("")
    } else {
        $("button[model-button='changing']").prop('disabled', false);
    }
}

function tableResult(state, table, e) {
    if(state === true) {
		write_table(table);
		clearModal();
    } else {
        e.stopImmediatePropagation();
        e.stopPropagation();
        swal({
            title: 'Warning!',
            text: 'The field must not be empty!',
            icon: "warning",
            buttons: {
                cancel: false,
                confirm: "Close"
            }
        })
    }
}

function clearModal() {
    $("select[use='modal']").val("");
    $("button[value='save']").attr("disabled", false);
    $("input[use='modal']").val("");
    $("input:checked").prop("checked", false)
}

// History of Saves Block
function setViewHistoryOfSaves(LOG) {
    // $("#last-save").append("<p>" + LOG.stamp + " : " +  LOG.noteID + " : <br><div class='fieldTables'>" + splitFieldToArray(LOG.fields)  + "</div></p>\n");
    $("#last-save").append("<p>" + LOG.stamp + " : " +  LOG.noteID + " : <br><div class='fieldTables'> New Document </div></p>\n");
}

function splitFieldToArray(sText) {
    var aLastBlock = sText.split(". ") // for split actions
    var mapData = [];
    var sKeyName, sValue;
    for (var i = 0; i < aLastBlock.length; i++) {
        if (aLastBlock[i].search(":-") !== -1) { // split action from information field
            aLastBlock[i] = aLastBlock[i].replace(":-", ",")
        }
        while (aLastBlock[i].search(" :- ") !== -1) { // replace for Column names from values
            aLastBlock[i] = aLastBlock[i].replace(" :- ", ",")
        }
        var aStep = aLastBlock[i].split(",")  // split Column name from value
        var numForColspan = (aStep.length - 1) / 2;
        aData = []; // here will be all information in array 2-dimensional

        sValue = aStep[0];
        aData.push(["sAction", sValue, numForColspan]); // but first 3-dimensional (for colspan)

        for (var j = 1; j < aStep.length; j += 2) {
            sKeyName = aStep[j];
            sValue = aStep[j + 1];
            aData.push([sKeyName, sValue])
        } // for

        mapData.push(aData);
    }
    return createInformationTable(mapData);
}

function createInformationTable(mapData) {  // Render Table
    var sTable = '';
    var nColumn = 0;

    for (i in mapData) {
        if(mapData[i][0][2] === 0){ // if only text
            sTable += "<p>" + mapData[i][0][1] + "</p>";
            continue;
        }
        sTable += '<table style="border:1px solid;">';

        for (aValues = 0; aValues < mapData[i].length; aValues++) {
            if (aValues === 1) { // start line
                sTable += "<tr>"
            }

            if (aValues === 0) { //Action
                sTable += '<tr><th style="color: lightgoldenrodyellow;" colspan="' + mapData[i][aValues][2] + '"> ' + mapData[i][aValues][1] + ' </th> </tr>';
            } else {
                if (nColumn === 0) { // <th>
                    sTable += "<th>" + mapData[i][aValues][nColumn] + " </th>"
                } else { // <td>
                    sTable += "<td>" + mapData[i][aValues][nColumn] + " </td>"
                }
                if (aValues === mapData[i].length - 1 && nColumn < 1) { // finish line and go to next line
                    aValues = 0;
                    nColumn++;
                    sTable += "</tr>";
                }
            }
        } // for(aValues) ==== END
        sTable += '</table><br>'
        nColumn = 0;
    }

    return sTable;
}

function getNoteID(sEmail) {
    data = '';
    jQuery.ajax({
        url: "https://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmperson/mail="+ sEmail + ".list/byjson?*",
        async: false,
        success: function (bpAnswer) {
            console.log(bpAnswer)
            data = bpAnswer;
        }
    })
    return data;
}
    
var el = document.getElementById("fteDisplay");
if (el)
    el.addEventListener("change", checkTimeIndicator);

function checkTimeIndicator() {
	var timeIndicator = document.getElementById('time_indicator');
	var totFTE = document.getElementById('fteDisplay');
	if (totFTE.value == 1) {
		timeIndicator.value = "Full Time";
	} else if (totFTE.value > 1 || totFTE.value <= 0) {
		timeIndicator.value = "ERROR";
	} else {
		timeIndicator.value = "Part Time";
	}
}

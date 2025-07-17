
$(document).ready(function(){
    window.exit = true;

	var oSendEmployeeInformation = [];
    var oSendDetails = [];
    var oRoleSelect = [];
    var totalFTE;

	//Clear Textarea
    $('textarea').val('')

	// Write text to value attribute
    $('textarea').bind("input text", function(){
        $(this).attr("value", this.value);
    });
    $('input').bind("input text", function(){
        $(this).attr("value", this.value);
    });

    getSelectValues("new");

    $("[name='hide']").hide();
    disactivateOrActiveFields(true);

    // Events
    //filter select options on change
    $("select[child]").change(function(e){
        setSelectRelationship(this);
    });

    $('#tower-select').val("");
    $('#add').prop("disabled", true);

    $('#tower-select').change(function () {
      selectVal = $('#tower-select').val();

      if (selectVal == 0 || selectVal == "" || selectVal.length <= 0) {
         $('#add').prop("disabled", true);
      }
      else {
        $('#add').prop("disabled", false);
      }
    })


    // Put value in input TAG & check Country(location) and select GEO/Mkt
    document.addEventListener("dataload", function(){
        if($("button[name='show-more']")[0].textContent == "More"){
            $("button[name='show-more']").click(); // unwrap all information fields
        }

        $("input").each(function(){
            $(this).attr("value", $(this)[0].value);
        });

        setGeoMkt($("input[name='country_l']")[0].name, $("select[name='geo-mkt-mkt1']")[0].name);
        $("select").each(function(){
            option_length = $(this).find('option').length
            if(option_length > 0)
                getSelectValue($(this));
        });
    });

    $("button[name='exit']").click(function (event) { // exit
        event.preventDefault()
        window.location.href = '/'
    })

    $("button[name='save']").click(function (event) { // Save btn
    event.preventDefault()
    var state = checkForm();

    var timeIndicator = document.getElementById('time_indicator');
    if (timeIndicator.value == "ERROR") {
      swal({
        title:'Error!',
        text:"Invalid Total FTE",
        icon:'warning',
        buttons:{cancel:false, confirm:"Close"}
      })
    }

		else if(state == ""){
            saveOperation(false);
        } else {
			swal({
                title:'Error!',
                text:state,
                icon:'warning',
                buttons:{cancel:false, confirm:"Close"}
            })
        }
    })

    $("button[name='save_exit']").click(function (event) { // Save and Exit btn
        event.preventDefault()
        var state = checkForm();
        var timeIndicator = document.getElementById('time_indicator');
        if (timeIndicator.value == "ERROR") {
            swal({
                title:'Error!',
                text:"Invalid Total FTE",
                icon:'warning',
                buttons:{cancel:false, confirm:"Close"}
            })
        } else if(state == "") {
            window.exit = false;
            saveOperation(true);
            document.addEventListener('done', function () {
                window.location.href = '/'
            })
        } else {
            swal({
                title:'Error!',
                text:state,
                icon:'warning',
                buttons:{cancel:false, confirm:"Close"}
            })
        }
    })

    function checkForm(){
		var result = "FTE not fully allocated!";
        var sClasses = $("i[name='icon-ver']")[0].getAttribute("class");
        if(sClasses) {
            var aClasses = sClasses.split(" ");
            for(var i = 0; i < aClasses.length; i++) {
                if(aClasses[i] === "green"){
                    result = "";
                }
            }
        }

		if($("select[name='tower']").val() == ""){
            result = "Tower is not selected!";
        }
        if($("input[name='email']").val() == ""){
            result = "Invalid Email!";
        }
		return result;
    }

    function saveOperation(bAnswerToExit) {
        var aInputs = $("[SaveID]");
        oSendEmployeeInformation = getInputData(aInputs);
        var DOMReftableData = $(".data-table");
        var oTableName = $("[modal-name]");
        var totalFTE = parseFloat($("#fteDisplay").val());
        oSendDetails = getInputTable(DOMReftableData, oTableName);
        user_email = user_email.replace('kyndryl.com','ocean.ibm.com')
        var sActiveNotesID = getNoteID(user_email);
        // var sActiveNotesID = "aleksejs.umanskis@ibm.com";

        //look for user in Dictionary
        var user;
        var x;
        var userDict = sActiveNotesID.search.entry[0].attribute;

        for (x=0; x < userDict.length - 1; x++){
          if (String(userDict[x].name).toLowerCase() == 'emailaddress'){
            user = userDict[x].value[0];
          }
        }

        // --- Send to back-End Form
        $("div[id='disPlay']").show();
        $.getJSON('/_time_form/', {
            action: "INSERT",
            document: JSON.stringify(oSendEmployeeInformation),
            subdocument: JSON.stringify(oSendDetails),
            user: user,
            total_FTE: totalFTE
            // user: sActiveNotesID,
        }).done(function(data){
            if(bAnswerToExit === true){
                var oEvent = new Event('done');
                document.dispatchEvent(oEvent);
            }

			setViewHistoryOfSaves(data.editor); /// see historu LOG
            $("div[id='disPlay']").hide();

			swal({
                title:'Successfully!',
                text:'New form was saved successfully!!',
                icon:"success",
                buttons:{cancel:false, confirm:"Close"}
            })

            $("button[name='save']").prop("disabled", true);
            $("button[name='save_exit']").prop("disabled", true);
        });
    }

    $("select:not(.doNotCheck-select)").change(function () {
        // $("select").each(function () {
            getSelectValue($(this));
        // });
        //checkOrg();
    })

    function getSelectValue(DomRefSelect) {
        return DomRefSelect.attr("value", DomRefSelect[0].selectedOptions[0].value);
    }

    // Disable Enter key in Form
    $("form").bind("keypress", function (e) {
        if (e.keyCode == 13) {
            return false;
        }
    });

    //add, modify or clone entry
    $("button[data-toggle='modal']").click(function(e){
        $("button[model-button='changing']").attr("name", $(this).attr("button-name"));
        if($(this).attr("name") == "modify-entry")
		        {
            checkOrg();
            // $("select option").attr("selected", false);
            $('td[row-index="' + $('.data-table input:checked').attr("row-index") + '"]').each(function(){
                var modal_name = $("th[col-index=" + $(this).attr("col-index") + "]").attr("modal-name");
                var value = $(this).text();
                if (modal_name == "unit") {
                  unitRelationship();
                } else if (modal_name == "subunit") {
                  subunitRelationship();
                }
                $("[name='" + modal_name + "']").val(value);
            });
            checkSubRole();
            copyOnModify();
        }
        else {
          checkOrg();
        }
    });

    //save changes
    $("button[model-button='changing']").click(function(e){
        var table = read_table();

        if($(this).attr("name") == "add-entry")
		{
            var row = read_modal();
            table.push(row);
            var state = checkModal(row);
            tableResult(state, table, e);
        }
		else if(($(this).attr("name") == "modify-entry"))
		{
            var row = read_modal();
            table[parseInt($('.data-table input:checked').attr("row-index"), 10)] = row;
            var state = checkModal(row);
            tableResult(state, table, e);
        }
    checkTower();
    checkOrg();
    });

    //close modal
    //$("button[data-dismiss='modal']").click(function (e) {
    //    $("select[use='modal']").val("");
    //    $("input[use='modal']").val("");
    //});

    //delete entry
    $("[button-name='delete-entry']").click(function (e) {
        var table = read_table();
        table.splice(parseInt($('.data-table input:checked').attr("row-index"), 10), 1);
        write_table(table);
    });

    //More/less
    $("[name='show-more']").click(function (e) {
        if ($(this).text() == "More") {
            $(this).text("Less");
            $("[name='hide']").show()
        } else {
            $(this).text("More");
            $("[name='hide']").hide()
        }
        hideElements();
    });

    $("input[name='total-fte']").change(function (e) {
        checkFTE();
    });

    //Validation
    //change center-flag depending on Center name
    $("select[name='center_name']").change(function (e) {
        if ($("select[name='center_name'] option:selected").val() != "") {
            $("input[name='center_flag']").val("YES");
            $("input[name='center_flag']").attr("value", "YES")
        } else {
            $("input[name='center_flag']").val("NO");
            $("input[name='center_flag']").attr("value", "NO")
        }
    });

    //Validations for Total FTE field
    $("input[name='total-fte']").focusout(function (e) {

        if (isNaN($(this).val()) || $(this).val() <= 0 || $(this).val() > 1) {
            $("a[name='error-fte']").text("FTE changed, must be a number between 0 and 1(included)");
            //$(this).val("1.00");
        } else {
            $("a[name='error-fte']").text("");
        }
        checkTimeIndicator()
    });

    //Validations for PCT
    $("input[name='pct']").focusout(function (e) {
        checkLimitPCT($(this));
    });

    $("input[name='o2o']").focusout(function (e) {
        checkLimitO2O($(this));
    });

    $("input[name='nonsom']").focusout(function (e) {
        checkLimitNonSOM($(this));
    });

    // Open History of Saves
    $("button[name='UnwrapHistory']").click(function (event) {
        if ($(".last-time").css('display') === 'none') {
            $(".last-time").fadeIn();
        } else {
            $(".last-time").fadeOut();
        }
    })

    //window.onbeforeunload = function (e) { // check if reload page
    //    if(window.exit === true){
    //        var e = e || window.event;
    //        // For IE and Firefox
    //        if (e) {
    //            e.returnValue = 'Leaving the page';
    //        }
    //        // For Safari
    //        return 'Leaving the page';
    //    }
    //};

    //hides new details columns
    hideDetailCols();

    //if Org changed
    document.getElementById("org-select").addEventListener("change", checkOrg);

});

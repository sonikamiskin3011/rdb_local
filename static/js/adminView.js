
    $.getJSON(
        "/_adminView/",
        {
          action: "GET columns"
        })
        .done(data => {
            // console.log(data)
        window.aAllColumnNames = data.answer; // get all column names
        });

    $.getJSON(
        "/_adminView/",
        {
            action: "GET views"
        })
        .done(data => {
            //console.log(data);
            if(data.message === "Error!"){
                swal({
                    title: 'Error!',
                    text: 'The server is not responding',
                    icon: "error",
                    buttons: {
                      cancel: false,
                      confirm: "Close"
                    }
                  })
                  $("#new-view").hide();
            }else{
                AdminView(data.answer);  // get existing views

            }
            $("div[id='disPlay']").hide();
        });

    function AdminView(oData) {
        window.oData = oData;
        renderTable();
    };

function preprocessingInputData(data) {
    var oUserNames = getPropertyName(data);
    var oUserNamesNEW = [];
    for (var i = 0; i < oUserNames.length; i++) {
        oUserNamesNEW[i] = preprocessingUsers(oUserNames[i]);
        data[oUserNamesNEW[i]] = data[oUserNames[i]];
        delete data[oUserNames[i]];
    }
    return data;
}
function preprocessingUsers(string) { // Normaluser --> Normal user
    return string.replace("user", "") + " user";
}
function preprocessingUsersBack(string) { // Normaluser --> Normal user
    return string.replace(" user", "user");
}

function renderTable(oObjData) {
      if(oObjData !== undefined){
        window.oData =  oObjData
        clearSelectToDefaultStatus($("#user-show"));clearSelectToDefaultStatus($("#user-show"));
        $("tbody").remove()
      }
      window.oData = preprocessingInputData(window.oData);
    var aObjectPropName = getPropertyName(window.oData);

    for(var i = 0; i < aObjectPropName.length; i++){
        makeTbody(aObjectPropName[i]);
    }
};

function getPropertyName(oObject) {
    return Object.keys(oObject);
};

function makeTbody(sName) {
        var DomRefTable = document.getElementsByTagName("table");
        var DomRefTbody = document.createElement("tbody");
        DomRefTbody.setAttribute("name", sName);

        DomRefTbody.innerHTML = this.renderRow(sName);

        DomRefTable[0].appendChild(DomRefTbody);

        stickEvents_Buttons();
};

function createOptionInSelect_WithoutAttribute(sSelectID, sText) {

    var DomRefSelect = document.getElementById(sSelectID);
    var option = document.createElement("option");
        option.text = sText;
        DomRefSelect.add(option);
}

function createOptionInSelect_WithAttribute(sSelectID, sText, attrIndex) {

    var DomRefSelect = document.getElementById(sSelectID);
    var option = document.createElement("option");
        option.text = sText;
        option.setAttribute("index", attrIndex);
        DomRefSelect.add(option);
}

function renderRow(sName) {
    var sNameForTable = upperFirstLetter(sName);
    createOptionInSelect_WithoutAttribute("user-show", sNameForTable);

    var sTag = "<tr><td colspan='2' style='font-size: 15px; font-weight: 900; width: 100%; background: black;'>"+ sNameForTable +"</td></tr>";
        var sViewName = getPropertyName(this.oData[sName]);
      for(var i = 0; i < sViewName.length; i++){
        sTag += "<tr class='view' row-index='"+i+"'>";
        sTag += "<td  style='width: 90%'>"+sViewName[i]+"</td>"+  inputButtons(sName);
        sTag += "</tr>";
      }
      return sTag;

};

function inputButtons(sName) {
    var sButtons = "<td style='width: 10%; display: flex;'>";
    sButtons += "<span><button class='btn btn-primary' name='edit' user='"+sName+"'>Edit</button> </span>";
    sButtons += "<span><button class='btn btn-danger' name='delete' user='"+sName+"' style='margin-left: 10px;'>Delete</button> </span>";
    sButtons += "</td>";

    return sButtons
};

function SelectSelectedDOMElements(whichCheckbox, aColumnNames, aDisplayColumnNames) {

    var checkboxes = $("input[see-group='"+whichCheckbox+"']");
    var sDisplayNameIfExist = "";
    var sDisplayNameForLI = "";

    for(var i = 0; i < aColumnNames.length; i++){
        var sUpperColumnName = aColumnNames[i].toUpperCase();

        for(var j = 0; j < checkboxes.length; j++){

            if(sUpperColumnName === checkboxes[j].value){

                checkboxes[j].setAttribute("checked", true);
                var nIndexThis = checkboxes[j].getAttribute("index");
                $($("input[index='"+nIndexThis+"']")[1]).show();  // show Display Name

                if(aDisplayColumnNames[i] !== sUpperColumnName){
                    $($("input[index='"+nIndexThis+"']")[1]).val(aDisplayColumnNames[i]);
                    sDisplayNameIfExist = aDisplayColumnNames[i];
                    sDisplayNameForLI = "<small>Display Name:</small> "+ aDisplayColumnNames[i];
                }
                sDisplayNameIfExist = "";
                sDisplayNameForLI = "";
                break;
            }
        }
    }
};

function stickEvents_Buttons() {

    $("button[name='edit']").unbind();
    $("button[name='edit']").bind("click", function(e) {
        e.preventDefault();

        var sUserView = this.getAttribute("user");
        var sViewName = $(this).closest("tr")[0].cells[0].innerHTML;

        var nCol_group= [];
        var oCol_dict = spliteString(window.oData[sUserView][sViewName].col_dict);
        var oCol_names = spliteString(window.oData[sUserView][sViewName].col_names);
        nCol_group.push(window.oData[sUserView][sViewName].col_group);
        var sCol_sum = spliteString(window.oData[sUserView][sViewName].col_sum);
        var sViewSource = window.oData[sUserView][sViewName].view_source;
        var sViewFilter = window.oData[sUserView][sViewName].view_filter;

        window.nOpenedViewID = window.oData[sUserView][sViewName].view_id;

        for(var i = 0; i < oCol_dict.length; i++){ // replace in col_dict "" --> "Nmbr"
            if(oCol_dict[i] === ""){
                oCol_dict[i] = "Nmbr";
            }
        }
        var aCol_groupName = findName(oCol_dict, nCol_group); // find Name wich column group
        sCol_sum = findName(oCol_dict, sCol_sum);// find Name wich column sum

        var aCol_groupIndex = findIndexOfAllNames(aCol_groupName) // find index of all names (window.aAllColumnNames)
        sCol_sum = findIndexOfAllNames(sCol_sum);
        var aCol_dictIndexFromAllNames = findIndexOfAllNames(oCol_dict);

        window.oSortedNames = [];

        for(var i = 0; i < oCol_dict.length; i++){ // create oSorted List Model
            window.oSortedNames[i] = {"col_dict": oCol_dict[i].toUpperCase(), "col_names": oCol_names[i], "index": aCol_dictIndexFromAllNames[i]};
        }

        window.sOldViewName = sViewName;
        $("#user-show").val(sUserView)
        $("#view-name-open").val(sViewName);
        $("#view-source").val(sViewSource);
        $("#view_filter").val(sViewFilter);
        $("#action").attr("name", "save-edit");
         modalDetails("Edit view");  // Open & render modal with all Column Names

         SelectSelectedDOMElements(true, oCol_dict, oCol_names); // for column-names & for sequense
        //   bindOn_oSortedNames(); // bind display name
          bindOn_allNames()

         //  Option in Column Group --- START
        for(var i = 0; i < window.oSortedNames.length; i++){
            createOptionInSelect_WithAttribute("on-group", window.oSortedNames[i].col_dict, window.oSortedNames[i].index);
        }
        var DomRefSelect = $("#on-group")[0];                   // it is col-group set
        for(var i = 1; i < DomRefSelect.options.length; i++){
            if(parseInt(DomRefSelect.options[i].getAttribute("index")) == aCol_groupIndex){
             DomRefSelect.options[i].selected = true;
            }
        }
        // Create Option in Column Group --- END

         // Checkbox in Column Group --- START
         for(var i = 0; i < window.oSortedNames.length; i++){
            $(".checkBox-position-sum").append(createCheckbox(window.oSortedNames[i].col_dict, window.oSortedNames[i].col_names, window.oSortedNames[i].index));
         }
         var DomRefCheckbox = $("input[see-group='false']");     // it is col-sum set
         for(var i = 0; i < DomRefCheckbox.length; i++){
             for(var j = 0; j < sCol_sum.length; j++){
                 if(parseInt($("input[see-group='false']")[i].getAttribute("index")) == sCol_sum[j]){
                     $("input[see-group='false']")[i].checked = true;
                 }
             }
         }
         // Checkbox in Column Group --- END

        $("button[name='save-edit']").unbind();
        $("button[name='save-edit']").bind("click", function() { // btn Save in modal (Edit) method

            var ReadData =  readModal();
            var state = checkData(ReadData);

            if(state === true){
                $("div[id='disPlay']").show();
                $.getJSON(
                    "/_adminView/",
                    {
                      action: "EDIT",
                 user_type: ReadData[0],
                 view_name: ReadData[1],
                 col_names: ReadData[3],
                 col_dict: ReadData[2],
                 col_group: ReadData[4],
                 col_sum: ReadData[5],
                 view_source: ReadData[6],
                 view_filter: ReadData[7],
                 view_id: window.nOpenedViewID
                    })
                    .done(data => {
                        $("#form-modal").hide();
                        $("div[id='disPlay']").hide();

                        if (data.message === "Success"){

                            var sUserDisplay = $("#user-show").val();

                            delete window.oData[sUserDisplay][window.sOldViewName]; // delete old, write new
                            delete window.sOldViewName;

                           window.oData[sUserDisplay][ReadData[1]] = {"col_dict": ReadData[2], "col_group": ReadData[4], "col_names": ReadData[3], "col_sum": ReadData[5], "view_source": ReadData[6], "view_id": window.nOpenedViewID };
                           preprocessing_oData_users();

                          // alert("View was updated successfully!");
                           swal({
                            title: 'Successfully!',
                            text: 'View was updated successfully!',
                            icon: "success",
                            icon: "success",
                            buttons: false,
                            timer: 2000,
                          })
                            renderTable(window.oData);
                            clearModal();
                        }else{
                            swal({
                                title: 'Error!',
                                text: 'The server is not responding',
                                icon: "error",
                                buttons: {
                                  cancel: false,
                                  confirm: "Close"
                                }
                              })
                        }
                    })
            } // if (state ===true)

        });

    });

    $("button[name='delete']").unbind();
    $("button[name='delete']").bind("click", function(e) {
        e.preventDefault();
        var sUserView = this.getAttribute("user");
        var sViewName = $(this).closest("tr")[0].cells[0].innerHTML;
        var sViewNameThisUser = getPropertyName(window.oData[sUserView]);
        window.nOpenedViewID = window.oData[sUserView][sViewName].view_id;
        for(var i = 0; i < sViewNameThisUser.length; i++){
            if (sViewNameThisUser[i] === sViewName){
                delete window.oData[sUserView][sViewName] // remove in Model
                // ============================================================================ send DELETE to back-end
                $("div[id='disPlay']").show();
                $.getJSON(
                    "/_adminView/",
                    {
                      action: "DELETE",
                      view_id: window.nOpenedViewID
                    }
                  )
                    .done(data => {
                        console.log(data);
                        $("div[id='disPlay']").hide();
                         // back usersName (connect word, for rendering)
                        preprocessing_oData_users();
                        renderTable(window.oData);   // re-render tbody - s
                    })
            }
        }
    });
}


function preprocessing_oData_users(){

    var oUserNames = getPropertyName(window.oData);
    var oUserNamesNEW = [];
   for(var i = 0; i < oUserNames.length; i++){
       oUserNamesNEW[i] = preprocessingUsersBack(oUserNames[i]);
       window.oData[oUserNamesNEW[i]] = window.oData[oUserNames[i]];
       delete window.oData[oUserNames[i]];
   }
};

function setCellOfValue(state, col_names, i) {
   var sTag = "<div class='for-input' style='display:flex; width:80%; align-items: center;' ><input type='checkbox' name='col-dict' index='"+i+"' value='"+col_names[i]+"' see-group='"+state+"' style='transform: scale(1.5);'>"+
    "<label style='margin-top:2%; min-width:55%; margin-left:2%'>"+ col_names[i] +"</label><input name='col-names' index='"+i+"' column-name='"+state+"' placeholder='Set display name' style='display: none;'></div>"
    return sTag;
};

function createColumnNamesBox(state, col_names, sNameID) {
    var rowInColumn = 20;
    var RefTable = document.getElementById(sNameID);
    var nRow = 0;
    var nNextColumn = 1;

    for(var i = 0; i < col_names.length; i++){

        if (i >=( rowInColumn) ){
            td = RefTable.rows[nRow].insertCell(nNextColumn);
            tr = td.closest("tr");
            nRow++;
            if(nRow === rowInColumn) {
                nRow = 0;
                nNextColumn++;
            }
        }else{
            var tr = document.createElement("tr");
            var td = document.createElement("td");
        }

        $(td).append(setCellOfValue(state, col_names, i));
        tr.append(td);

        if(i < rowInColumn) {
            RefTable.append(tr);
        }
    }
};

function renderCheckBox_forSum(DomLi) {

    aOriginalCol_dict = [];  // original name
    aDisplayCol_dict = [];
    aIndex = [];
    for(var i = 0; i < DomLi.length; i++){
        aOriginalCol_dict.push(DomLi[i].getAttribute("value"));
        var nIndex = $("#sorted-names")[0].children[i].getAttribute("index");
        aIndex.push(nIndex);
        var sValue = $("div[d-index='"+nIndex+"']")[0].getAttribute("value");
        if(sValue === null){ sValue = "";}
        aDisplayCol_dict.push(sValue);
    }

    delete window.oSortedNames;
    window.oSortedNames = [];
    for(var i = 0; i < aOriginalCol_dict.length; i++){
        $(".checkBox-position-sum").append(createCheckbox(aOriginalCol_dict[i], aDisplayCol_dict[i], aIndex[i]));

            window.oSortedNames[i] = {"col_dict": aOriginalCol_dict[i], "col_names": aDisplayCol_dict[i], "index": aIndex[i]}; // save sorted names in Model (sequence)
        createOptionInSelect_WithAttribute("on-group", aOriginalCol_dict[i], aIndex[i]);
    }
};

$( function() {
    $( "#sorted-names" ).sortable();
    $( "#sorted-names" ).disableSelection();
  } );

function createCheckbox(sOriginalName, sDisplayName, index) {
      var sTag = sOriginalName
      if(sDisplayName){ // empty
        sTag += " ("+sDisplayName+")";
      }
    return "<div class='sorted-sum-box'><input type='checkbox' see-group='false' index='"+index+"' style='zoom: 1.5; margin: 2%'><label>"+ sTag + "</label></div><br>";
};


function modalDetails(sTitel) {  //  set 2 parametr - col names
    $("#formModalLabel").html(sTitel)
    $(".modal-background").show();
    $("html").css("overflow-y", "hidden")
    createColumnNamesBox(true, window.aAllColumnNames, "Names");


     window.oObjectNames = [];
     $("input[see-group='true']").change(function() {

        if($(this)[0].checked === true){ //  ===================== When chose Name
            var nIndexThis = this.getAttribute("index");
            var sOriginalName = $(this).val();
            var sDisplayName = $("input[index='"+nIndexThis+"']")[1].value;
            if(window.oObjectNames === undefined){window.oObjectNames = []; }
            $($("input[index='"+nIndexThis+"']")[1]).show() // show Display Name input
            window.oObjectNames[nIndexThis] =  {"col_dict": sOriginalName, "col_names": sDisplayName, "index": nIndexThis};
            // bind inputs
            bindOn_allNames();
        }
        else{   //  ===================== When UNchosen Name
                $($("input[index='"+this.getAttribute("index")+"']")[1]).hide();  // hide Display name
                $($("input[index='"+this.getAttribute("index")+"']")[1])[0].value = ""; // clear Display name
                if(window.oObjectNames !== undefined){
                    delete window.oObjectNames[this.getAttribute("index")]; // delete from Model
                }
                if(window.oSortedNames !== undefined){
                    for(var i in window.oSortedNames){
                        if(parseInt(window.oSortedNames[i].index) === parseInt(this.getAttribute("index")))
                        delete window.oSortedNames[i];
                        break;
                    }
                }
                 // need delete form Sequents
                 for(i in window.oSortedNames){
                     if(parseInt(window.oSortedNames[i].index) === parseInt(this.getAttribute("index")+"']")){
                        oSortedNames.splice(i, 1);
                        break;
                     }
                 }
                // $("li[index='"+this.getAttribute("index")+"']").remove(); // remove from Sequence modal
                $(".checkBox-position-sum").empty();
                clearSelectToDefaultStatus($("#on-group"));
        }
    });

};

function bindOn_allNames() {
    $("input[column-name='true']").unbind();
    $("input[column-name='true']").bind("input text", function() {
        if(window.oSortedNames !== undefined){
            for(var j in window.oSortedNames){
                if(window.oSortedNames[j].index == parseInt(this.getAttribute("index"))){
                    window.oSortedNames[j].col_names = this.value;
                }
            }
        }
       if(window.oObjectNames !== undefined){
        for(i in window.oObjectNames){
            if(window.oObjectNames[i].index == parseInt(this.getAttribute("index"))){
                window.oObjectNames[i].col_names = this.value;
              }
        }
       }
      });
};

function preprocessingLiTag(sOriginalName, nIndexThis, sDisplayName, DomRefLI) {

    var liString =  $('<li>').append("<small>Original name:</small> "+sOriginalName
    ).addClass("target").attr({"value": sOriginalName, "index":nIndexThis}).append("<div><span class='d-name'><div d-index='"+nIndexThis+"' " + sDisplayName +"</span></div>");

    // ----------- put in Not sorted field ---------------
    // liTargetSelected(liString);
    $(DomRefLI).append(liString);

    liString.click( function (event) {
        var current = document.getElementsByClassName("chosen");
        if(current.length !== 0 ){
            current[0].className = current[0].className.replace(" chosen", "");
        }
        this.classList.add("chosen");
        window.DOM_chosenLi = this;
    });
};


$("button[action='close']").click(function() { // btn close in Modal
    clearModal();
});

$("#new-view").click(function(e) { // btn Create new view
    e.preventDefault();
    $("#user-show").val("");
    $("#view-source").val("");
    $("#action").attr("name", "save-new")

     modalDetails("Creating new view"); // all column names

    $("button[name='save-new']").unbind();
    $("button[name='save-new']").bind("click", function() { // btn Save in modal (Create New) method

       var ReadData =  readModal();
       var state = checkData(ReadData);

       if(state === true){
      $("div[id='disPlay']").show();
       $.getJSON(
        "/_adminView/",
        {
          action: "INSERT",
         user_type: ReadData[0],
        view_name: ReadData[1],
        col_names: ReadData[3],
        col_dict: ReadData[2],
        col_group: ReadData[4],
        col_sum: ReadData[5],
        view_source: ReadData[6],
        view_filter: ReadData[7]
        }
      )
        .done(data => {
            console.log(data)
             // render in table and Model
             $("#form-modal").hide();
             if(data.message === "Success"){
                var sUserDisplay = $("#user-show").val();
                window.oData[sUserDisplay][ReadData[1]] = { "col_dict": ReadData[2], "col_group": ReadData[4], "col_names": ReadData[3], "col_sum": ReadData[5], "view_id": data.answer, "view_source": ReadData[6] };
                preprocessing_oData_users();
                $("div[id='disPlay']").hide();
                swal({
                   title: 'Successfully!',
                   text: 'New view was created successfully!',
                   icon: "success",
                   buttons: false,
                   timer: 2000
                 })
                renderTable(window.oData);
                clearModal();
             }else{
                swal({
                    title: 'Warning!',
                    text: 'View not saved, server Error! ' + data.message,
                    icon: "warning",
                    buttons: {
                      cancel: false,
                      confirm: "Close"
                    }
                  })
             }

         })
       }  // if (state === true)  ====
    });
});

$("#sequence-modal").click(function(e) {
    e.preventDefault();
    $(".checkBox-position-sum").empty();
    clearSelectToDefaultStatus($("#on-group"));
    $(".modal-background-addition").show();

    if(window.oObjectNames !== undefined){

        for(i in window.oObjectNames){
            var sDisplayName = window.oObjectNames[i].col_names;
            if(sDisplayName !== "" ){
                sDisplayName = "value='"+sDisplayName+"'></div><small>Display Name:</small> "+ sDisplayName;
            }
            else{
                sDisplayName = "></div>";
            }
            preprocessingLiTag(window.oObjectNames[i].col_dict, i, sDisplayName, "#chosen-names");
        }
    }
    if(window.oSortedNames !== undefined){
        for(i in window.oSortedNames){

            var sDisplayName = window.oSortedNames[i].col_names;
            if(sDisplayName !== ""){
                sDisplayName = "value='"+sDisplayName+"'></div><small>Display Name:</small> "+ sDisplayName;
            }
            else{
                sDisplayName = "></div>";
            }
            preprocessingLiTag(window.oSortedNames[i].col_dict, window.oSortedNames[i].index, sDisplayName, "#sorted-names");
        }
    }
});

$("button[action='close-addition']").click(function() { // btn close in Modal
    $(".modal-background-addition").hide();
    $("#chosen-names").empty();
    $("#sorted-names").empty();
});

 function readModal() {

        var sCol_dict = ''
        var sCol_names = '';
    if(window.oSortedNames){

        for(var i = 0; i < window.oSortedNames.length; i++){
            if(window.oSortedNames[i].col_dict === "NMBR"){
                window.oSortedNames[i].col_dict = "";
            }
            sCol_dict += window.oSortedNames[i].col_dict + ",";

            if(window.oSortedNames[i].col_names === null || window.oSortedNames[i].col_names === ""){ //       if not exist Display Name
                sCol_names +=window.oSortedNames[i].col_dict + ",";
            }else{
                sCol_names += window.oSortedNames[i].col_names + ","
            }
        }

        var sCol_sum = "";
        var nInputNameLength = $("[see-group='false']").length;
        var aInputNames = $("[see-group='false']");
        for (var i = 0; i < nInputNameLength; i++) {
            if (aInputNames[i].checked === true) {
                var realIndex = aInputNames[i].getAttribute("index");
                for (var j = 0; j < window.oSortedNames.length; j++) {
                    if (parseInt(window.oSortedNames[j].index) === parseInt(realIndex)) {
                        sCol_sum += j + ",";
                        break;
                    }
                }
            }
        }

    var nOptionLength = $("#on-group")[0].options.length;
    var aOption = $("#on-group")[0].options;
        for (var i = 0; i < nOptionLength; i++) {
            if (aOption[i].selected === true) {
                var realIndex = aOption[i].getAttribute("index");
                for (var j = 0; j < window.oSortedNames.length; j++) {
                    if (parseInt(window.oSortedNames[j].index) === parseInt(realIndex)) {
                        var nCol_group = parseInt(j);
                        break;
                    }
                }
            }
        }

    var sUserSend = $("#user-show").val();
    sUserSend = deleteSpace(sUserSend);
    var sViewName = $("#view-name-open").val();
    var sViewSource = $("#view-source").val();
    var sViewFilter = $("#view_filter").val();

    sCol_dict = deleteComma(sCol_dict);
    sCol_names = deleteComma(sCol_names);
    sCol_sum = deleteComma(sCol_sum);
    }
    return [sUserSend, sViewName, sCol_dict, sCol_names, nCol_group, sCol_sum, sViewSource, sViewFilter]
};


$("button[name='to-right']").click(function() {
    if(window.DOM_chosenLi){
        if(window.DOM_chosenLi.closest("div").getAttribute("id") === "chosen-names"){
            window.DOM_chosenLi.classList.toggle("chosen")
            $("#sorted-names").append(window.DOM_chosenLi);
        }
    }
});
$("button[name='to-left']").click(function() {
    if(window.DOM_chosenLi){
        if(window.DOM_chosenLi.closest("div").getAttribute("id") === "sorted-names"){
            window.DOM_chosenLi.classList.toggle("chosen");
            $("#chosen-names").append(window.DOM_chosenLi);
        }
    }
});
$("button[name='all-to-left']").click(function() {
    $("#chosen-names").append($("#sorted-names")[0].children);
    if(window.DOM_chosenLi) window.DOM_chosenLi.setAttribute("class", "target");
});
$("button[name='all-to-right']").click(function() {
    $("#sorted-names").append($("#chosen-names")[0].children);
    if(window.DOM_chosenLi) window.DOM_chosenLi.setAttribute("class", "target");
});

$("button[name='save-addition']").click(function() { // save this sequence, add chossen in "Witch column sum"

    renderCheckBox_forSum($("#sorted-names")[0].children);
    saveModelChoosen($("#chosen-names")[0].children); // save choosen names in Model (NOT sorted) if exist

    bindOn_allNames();

    $("#chosen-names").empty();
    $("#sorted-names").empty();
    $(".modal-background-addition").hide();
});

function saveModelChoosen(DomRefLiChosen) {
    delete window.oObjectNames;
    if(DomRefLiChosen.length != 0){
        window.oObjectNames = [];
        for(var i = 0; i < DomRefLiChosen.length; i++){
            var sDisplayName = $("div[d-index='"+DomRefLiChosen[i].getAttribute("index")+"']")[0].getAttribute("value");
            if(sDisplayName === null){sDisplayName = "";}
            window.oObjectNames[DomRefLiChosen[i].getAttribute("index")] =  {"col_dict": DomRefLiChosen[i].getAttribute("value"), "col_names": sDisplayName, "index": DomRefLiChosen[i].getAttribute("index")};
        }
    }
};

function clearModal() {
    $("html").css("overflow-y", "")
    $(".modal-background").hide();  // modal-background
    $("#Names").empty();
    $(".checkBox-position-sum").empty();
    $("#view-name-open").val("");
    $("#action").attr("name", "save");

    $("#chosen-names").empty();
    $("#sorted-names").empty();
    delete window.oObjectNames;
    delete window.nOpenedViewID;
    delete window.oSortedNames;

    clearSelectToDefaultStatus($("#on-group"))
    $("#on-group").val("");
}

function clearSelectToDefaultStatus(DomRefSelect) {
    var len = DomRefSelect[0].options.length-1;
    for(var i = len; i > 0 ; i--){
        DomRefSelect[0].options[i].remove();
    }
};

function upperFirstLetter(string) {
    string = string.replace("_", " ");
  return string.charAt(0).toUpperCase() + string.slice(1);
};

function findName(aNames, aNumber) {
    var array = [];
    for(var i = 0; i < aNumber.length; i++){
        for(var j = 0; j < aNames.length; j++){
            if(parseInt(aNumber[i]) === j){
                array.push(aNames[j]);
                break;
            }
        }
    }
    return array;
};

function findIndexOfAllNames(oName) {
    var array = [];
    for(var i = 0; i < oName.length ; i++){
        for(var j = 0; j < window.aAllColumnNames.length; j++){
            if((oName[i].toUpperCase()) === window.aAllColumnNames[j]){
                array.push(j);
                break;
           }
        }
    }
    return array;
};

function deleteSpace(string) {
    return string.replace(" ","")
};

function deleteComma(string){
    if(string[string.length-1] === ",")
    return string.slice(0,string.length-1);
};

function spliteString(string) {
    return string.split(",")
};

function checkData(ReadData) {
        if(ReadData[0] === undefined || ReadData[0].length === 0 ){
            swal({
                title: 'Warning!',
                text: 'User Not chosen!',
                icon: "warning",
                buttons: {
                cancel: false,
                confirm: "Close"
                }
            })
            return false;
        }
        if(ReadData[1] === ""){
            swal({
                title: 'Warning!',
                text: 'View name not set!',
                icon: "warning",
                buttons: {
                cancel: false,
                confirm: "Close"
                }
            })
            return false;
        }
        if(ReadData[4] === undefined){
            swal({
                title: 'Warning!',
                text: 'Column Group not set!',
                icon: "warning",
                buttons: {
                cancel: false,
                confirm: "Close"
                }
            })
            return false;
        }
        if(ReadData[6] === undefined || ReadData[6].length === 0 ){
            swal({
                title: 'Warning!',
                text: 'View Source Not chosen!',
                icon: "warning",
                buttons: {
                cancel: false,
                confirm: "Close"
                }
            })
            return false;
        }
    return true;
};

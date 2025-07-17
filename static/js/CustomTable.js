function CustomTable(sTableName, oTableDomRef){
    this._constructor(sTableName, oTableDomRef);
}

const recordsInPage = 7;

CustomTable.prototype._constructor = function(sTableName, oTableDomRef) {
    this.sTableName = sTableName;
    this.oTableDomRef = oTableDomRef;
    this.oData = null;
    this.isDataLoaded = false;
    this._loadData();

}

CustomTable.prototype._loadData = function() {
    $("div[id='disPlay']").hide();
    // $("div[id='personal-style-spin']").css("display", "block");
    // $($("div[name='loading-icon'][table-name='"+this.sTableName+"']")[0].getAttribute("id")).css("display", "block");
    $("div[name='loading-icon'][table-name='"+this.sTableName+"']").addClass("fa fa-spinner fa-spin icon ");
    $("button[name='add']").prop('disabled', true);
    $.getJSON('/_tables/', {
        message : "ADMIN",
        payload :  this.sTableName,
    }).done( function(data){
        if(data.message === "Error!"){
            swal({
                title: 'Error!',
                text: 'The server is not responding!',
                icon: "error",
                buttons: {
                  cancel: false,
                  confirm: "Close"
                }
              })
        }else{
            this.oData = data.db2_data;
            this.isDataLoaded = true;
            this.pageFunctionality(this.oData, this.oTableDomRef);

            $("div[name='loading-icon'][table-name='"+this.sTableName+"']").removeClass("fa fa-spinner fa-spin icon");
            $("div[id='personal-style-spin']").css("display", "none");
            $("button[name='add']").prop('disabled', false);
        }
    }.bind(this)).fail(function(){
        $("div[name='loading-icon'][table-name='"+this.sTableName+"']").removeClass("fa-spinner fa-spin");
        $("div[name='loading-icon'][table-name='"+this.sTableName+"']").removeClass("fa-minus-circle red");
    });
}


CustomTable.prototype.pageFunctionality = function(oDataTable, DomRefActiveTable, nPage) {

    if(oDataTable){
        var nTableLength = oDataTable.length;
        var nOfPages = this.getNumberOfPage(nTableLength)

        if(nPage <= nOfPages || !nPage) {
            $(DomRefActiveTable).empty();

            if(!nPage){
                nPage = 1;
            }

            for(var i = 0; i < $(".input-group").length; i++){
                    if(DomRefActiveTable.getAttribute("table-name") === $($(".input-group[table-name]")[i]).attr("table-name")){
                        $($(".input-group[table-name]")[i].children[3]).attr("value" , nPage +" of "+nOfPages);  // label
                        $($(".input-group[table-name]")[i].children[3]).text( nPage +" of "+nOfPages);
                        $($(".input-group[table-name]")[i].children[1]).attr("value" , nPage); // input
                        $($(".input-group[table-name]")[i].children[1]).text( nPage);
                        $($(".input-group[table-name]")[i].children[1]).val( nPage);
                        break;
                    }
            }
            this.renderTable(oDataTable, DomRefActiveTable, nPage);
        }
        else  {
            alert("Not exist this page")
        }
    }

}

CustomTable.prototype.renderTable = function(oDataTable, DomRefActiveTable, nPage) {

     if(nPage){
        var start = recordsInPage * (nPage-1);
     }
    if (oDataTable){

        for(var i = start; i < start + recordsInPage; i++){
            if(oDataTable[i]){
                $(DomRefActiveTable).append('<tr row-index="'+i+'"></tr>');
                this.renderRow(oDataTable[i], i, DomRefActiveTable);
            }
        }
        stickEvent();
    }
}

CustomTable.prototype.renderRow = function(row, i, oActiveTable){

    var oTable = this.oTableDomRef || oActiveTable;
    var sTname = this.sTableName || oActiveTable.getAttribute("table-name");
    var DomRefRow = $(oTable).find("tr[row-index='"+i+"']") || $(oTable).find("tr[row-index='"+i+"']");
    $.each(row, function(j, item){
        DomRefRow.append("<td col-index='"+j+"' value='"+item+"'>"+item+"</td>");
    });

        $(oTable).find("tr[row-index='"+i+"']").append("<td col='buttons'style='display: flex; width: auto;' ></td>");
        $(oTable).find("tr[row-index='"+i+"'] td[col='buttons']").append('<button type="button" name="change" table-name="'+sTname+'" class="btn btn-primary" data-target="#edit-table-modal" data-toggle="modal" style="margin-right: 2%">Change</button> ');
        $(oTable).find("tr[row-index='"+i+"'] td[col='buttons']").append('<button type="button" name="delete" table-name="'+sTname+'" class="btn btn-danger" >Delete</button>');

}


function populate_modal(button, is_change) {

    $("#changing-field-wrapper").html("");
    for (i = 1; i < $(".tab-pane.active th").length-1; i++) {
        $("#changing-field-wrapper").append($(".changing-field-template").clone());
        $("#changing-field-wrapper .changing-field-template:last").removeClass("changing-field-template").addClass("entry-" + i);

        var new_label = $(".tab-pane.active th[col-index='" + i + "']").text();
        $(".entry-" + i + " label").text(new_label);

        if (is_change) {
            var new_input = $(button).parent().parent().find("td[col-index='" + i + "']").text();
            $(".entry-" + i + " input").val(new_input);
        } else {
            $(".entry-" + i + " input").attr("placeholder","Add data");
        }
        $(".entry-" + i + " input").attr("name", "nr-" + i)

        $(".entry-" + i).show();
    }
}

 //when add button is pressed
    $("button[name='add']").click(function(e){
        populate_modal(this)
        $("#tableModalLabel").text("Add to the selected table");

        var table = $(this).attr("table-name");
        $("button[modal-button='changing']").attr("value","add-"+table);
        $("button[modal-button='changing']").attr("from", "add");

    });



    // Button Save Changes in Modal
    $("button[modal-button='changing']").click(function() {
        sActiveTableName = $($(".nav-link.active")[0]).attr("aria-controls")

        if(sActiveTableName){

                var oActiveTable =  $("tbody[table-name="+sActiveTableName+"]");
            if($(this)[0].attributes.from.value === "add"){ // from

                var oRow = getDataFromModal("");
                var sRow  = getRowInString(oRow);

                //tables - add
                $("div[id='disPlay']").css("display", "block");
                    $.getJSON('/_edit-tables/', {
                        table: sActiveTableName,
                    function: 'INSERT',
                    values: sRow,
                }).done(function(data){
                    console.log(data)
                    $("div[id='disPlay']").css("display", "none");
                    if (data.message !== "Error!"){

                        var id = data.id_used[0][0];
                        oRow[0] = id;
                        var oModelTable = findTableInModel(sActiveTableName);
                        var nRowInTableModel = oModelTable.length;
                        oModelTable.push(oRow);
                        oActiveTable.append('<tr row-index="'+nRowInTableModel+'"></tr>');
                        CustomTable.prototype.pageFunctionality(oModelTable, oActiveTable[0], CustomTable.prototype.getNumberOfPage(nRowInTableModel));
                        swal({
                            title: 'Successfully!',
                            text: 'The record was added!',
                            icon: "success",
                            buttons: {
                              cancel: false,
                              confirm: "Close"
                            }
                          })
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
            }else if($(this)[0].attributes.from.value === "change"){ // from
               var nCurrentRowInModal =  parseInt($(this)[0].attributes.rowIndexInModal.value);
                var nCurrentRowInTbody =   parseInt($(this)[0].attributes.rowIndexInTable.value);
               var nRealID = parseInt($(this)[0].attributes.realid.value);

               var oRow = getDataFromModal(nRealID);
               var sRow = getRowInString(oRow);

                //tables - change
                $("div[id='disPlay']").css("display", "block");
                $.getJSON('/_edit-tables/', {
                    table: sActiveTableName,
                function: 'UPDATE',
                where: nRealID,
                values: sRow ,
                }).done(function(data){
                $("div[id='disPlay']").css("display", "none");
                    if (data.message !== "Error!"){
                        var oModelTable = findTableInModel(sActiveTableName);
                        oModelTable[nCurrentRowInModal] = oRow;

                        $(oActiveTable.find("tr")[nCurrentRowInTbody-1]).replaceWith("<tr row-index='"+nCurrentRowInModal+"'></tr>");
                        CustomTable.prototype.renderRow(oRow, nCurrentRowInModal, oActiveTable[0]);
                        swal({
                            title: 'Successfully!',
                            text: 'The record was changed!',
                            icon: "success",
                            buttons: {
                              cancel: false,
                              confirm: "Close"
                            }
                          })
                    }else{
                        swal({
                            title: 'Error!',
                            text: 'The server is not responding!',
                            icon: "error",
                            buttons: {
                              cancel: false,
                              confirm: "Close"
                            }
                          })
                    }

                })
            }
            stickEvent();
        }

    });

    function getRowInString(oRow) {
        var sRow= "'";
        for(var i = 1; i < oRow.length; i++){
            sRow += oRow[i];
            if(i !== oRow.length-1) {
                sRow += "','";
            } else {
                sRow += "'";
            }
        }
        return sRow;
    }

    function getDataFromModal(nID){
        var oRow = [nID];

        for(var i = 0; i < $("#changing-field-wrapper")[0].children.length; i++){
            for(var j = 0; j < $("#changing-field-wrapper")[0].children[i].children.length; j++){
                if($("#changing-field-wrapper")[0].children[i].children[j].value !== undefined){
                    oRow.push($("#changing-field-wrapper")[0].children[i].children[j].value);
                }
            }
        }
        return oRow;
    }

    function stickEvent(){
        $("button[name='change']").unbind();
        $("button[name='change']").bind("click",function(e){
            populate_modal(this, true);

            $("#tableModalLabel").text("Change selected row");

            var index = $(this).parent().parent().find("td[col-index='0']").text();
            var table = $(this).attr("table-name");
            var nCurrentRowInModal =  parseInt($(this).closest("tr")[0].getAttribute("row-index"));
            var nRealID = parseInt($(this).closest("tr")[0].cells[0].getAttribute("value"));
            var nRowInTable = $(this).closest("tr")[0].rowIndex;

            $("input[name='changing-input-hidden']").val(index);
            $("button[modal-button='changing']").attr("value","change-"+table);
            $("button[modal-button='changing']").attr("from", "change");
            $("button[modal-button='changing']").attr("rowIndexInModal", nCurrentRowInModal);
            $("button[modal-button='changing']").attr("realID", nRealID);
            $("button[modal-button='changing']").attr("rowIndexInTable", nRowInTable);
        });
        // EVENT - delete row
        $("button[name='delete']").unbind();
        $("button[name='delete']").bind("click",function(e){
            sActiveTableName =  $($(this).closest("tbody")[0]).attr("table-name");
            nCurrentRowInModal =  $($(this).closest("tr")[0]).attr("row-index");
            var nRealID = parseInt($(this).closest("tr")[0].cells[0].getAttribute("value"));
            var nRowInTable = $(this).closest("tr")[0].rowIndex;
            $("div[id='disPlay']").css("display", "block");
                $.getJSON('/_edit-tables/', {
                table: sActiveTableName,
                function: 'DELETE',
                where: nRealID
                }).done(function(data){

                    $("div[id='disPlay']").css("display", "none");
                    if (data.message !== "Error!"){
                        var oModelTable = findTableInModel(sActiveTableName);
                        oModelTable.splice((nCurrentRowInModal), 1);
                        var oActiveTable = $("tbody[table-name='"+sActiveTableName+"']")
                        $($("tbody[table-name="+sActiveTableName+"]").find("tr")[nRowInTable-1]).remove();
                        CustomTable.prototype.pageFunctionality(oModelTable, oActiveTable[0], getPageValue(sActiveTableName) );
                        swal({
                            title: 'Successfully!',
                            text: 'The record is deleted!',
                            icon: "success",
                            buttons: {
                              cancel: false,
                              confirm: "Close"
                            }
                          })
                    }else{
                        swal({
                            title: 'Error!',
                            text: 'The server is not responding!',
                            icon: "error",
                            buttons: {
                              cancel: false,
                              confirm: "Close"
                            }
                          })
                    }
                });
        });
    }

    function findTableInModel(sActiveTableName) {
        for(var i = 0; i < oTables.length; i++){
            if( oTables[i].sTableName === sActiveTableName){
                return oTables[i].oData;
            }
        }
    }

    CustomTable.prototype.getNumberOfPage = function (nTableLength){
        return  Math.ceil(nTableLength/recordsInPage);
    }

    function setPageValue(nPage) {
        $("input[name='page-nr']").attr("value", nPage);
        $("input[name='page-nr']").text(nPage);
    }
    function getPageValue(sName) {
        for(var i = 0; i < $("input[name='page-nr']").length; i++){
            if (sName === $($("input[name='page-nr']")[i]).closest("div").attr("table-name")){
                if (parseInt($($("input[name='page-nr']")[i]).val()) < 1){
                    alert("Not exist this page")
                    break;
                }else{
                    return  parseInt($($("input[name='page-nr']")[i]).val());
                }
            }
        }
    }
